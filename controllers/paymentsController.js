// Stripe Checkout session for wallet/ride payments
exports.createCheckoutSession = async (req, res) => {
  const { amount, type = 'wallet', userId, rideId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: type === 'wallet' ? 'Wallet Top-up' : 'Ride Payment',
              metadata: { userId, rideId }
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
    success_url: process.env.FRONTEND_URL + '/payment-success?type=' + type + '&amount=' + amount + '&userId=' + userId + (rideId ? ('&rideId=' + rideId) : ''),
    cancel_url: (type === 'driver-plan' ? process.env.FRONTEND_URL + '/driver-payment-cancel' : process.env.FRONTEND_URL + '/payment-cancel'),
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.pay = async (req, res) => {
  const { amount, currency = 'usd', payment_method_id, rideId, userId } = req.body;
  if (!amount || !payment_method_id || !rideId || !userId) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency,
      payment_method: payment_method_id,
      confirm: true,
      metadata: { rideId, userId },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });
    res.status(200).json({ success: true, paymentIntent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
