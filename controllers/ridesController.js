// Get rides for a driver (pending rides)
exports.getDriverRides = async (req, res) => {
  const { driver_id } = req.query;
  if (!driver_id) return res.status(400).json({ error: 'driver_id required' });
  try {
    const { data, error } = await supabase.from('rides').select('*').or('status.eq.pending,status.eq.accepted').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ rides: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch driver rides.' });
  }
};

// Driver accepts a ride
exports.acceptRide = async (req, res) => {
  const { rideId, driverId } = req.body;
  if (!rideId || !driverId) return res.status(400).json({ error: 'rideId and driverId required' });
  try {
    const { data, error } = await supabase.from('rides').update({ status: 'accepted', driver_id: driverId }).eq('id', rideId).select();
    if (error) return res.status(400).json({ error: error.message });
    // Optionally: emit Socket.IO event here if needed
    res.status(200).json({ ride: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept ride.' });
  }
};
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.bookRide = async (req, res) => {
  const { user_id, pickup, dropoff, fare, status } = req.body;
  if (!user_id || !pickup || !dropoff || !fare) {
    return res.status(400).json({ error: 'Missing required ride fields.' });
  }
  try {
    // Use rider_id instead of user_id for schema compatibility
    const { data, error } = await supabase.from('rides').insert([
      { rider_id: user_id, pickup, dropoff, fare, status: status || 'pending' }
    ]);
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ ride: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Ride booking failed.' });
  }
};

exports.getHistory = async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  try {
    // Use rider_id instead of user_id for schema compatibility
    const { data, error } = await supabase.from('rides').select('*').eq('rider_id', user_id).order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ rides: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ride history.' });
  }
};
