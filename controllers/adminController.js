// TODO: Implement admin management logic here
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.getUsers = async (req, res) => {
  try {
    // Fetch users from both 'users' and 'drivers' tables
    const { data: users, error: usersError } = await supabase.from('users').select('*');
    const { data: drivers, error: driversError } = await supabase.from('drivers').select('*');
    if (usersError || driversError) {
      return res.status(500).json({ error: usersError?.message || driversError?.message });
    }
    // Combine and return
    res.status(200).json({ users, drivers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};
exports.getPayments = (req, res) => {
  // List payments
  res.send('Payments logic');
};
