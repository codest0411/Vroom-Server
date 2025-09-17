const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.rate = async (req, res) => {
  const { rideId, userId, rating, comment } = req.body;
  if (!rideId || !userId || !rating) return res.status(400).json({ error: 'Missing required fields.' });
  try {
    const { data, error } = await supabase.from('reviews').insert([
      { ride_id: rideId, user_id: userId, rating, comment }
    ]);
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ review: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review.' });
  }
};
