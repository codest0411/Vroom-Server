const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  const { amount, email } = req.body;
  if (!amount || !email) {
    console.error('Missing amount or email:', req.body);
    return res.status(400).json({ error: 'Missing amount or email' });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: { name: 'Ride Payment' },
          unit_amount: Math.round(Number(amount) * 100),
        },
        quantity: 1,
      }],
      customer_email: email,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    });
    if (!session || !session.id) {
      console.error('Stripe session creation failed:', session);
      return res.status(500).json({ error: 'Stripe session creation failed' });
    }
    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // TODO: Mark payment as complete in your DB
  }
  res.json({received: true});
});

module.exports = router;
