const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.register = async (req, res) => {
  const { email, password, role, fullName } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required.' });
  }
  try {
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { role, fullName },
      invite: true // This will send a confirmation/invite email
    });
    if (error) return res.status(400).json({ error: error.message });

    // Insert into the correct table
    const userId = data.user?.id;
    if (!userId) return res.status(500).json({ error: 'User creation failed.' });

    let insertError;
    if (role === 'driver') {
      // Insert into drivers table
      const { error: driverError } = await supabase.from('drivers').insert([
        { id: userId, email, full_name: fullName || null }
      ]);
      insertError = driverError;
    } else {
      // Insert into users table
      const { error: userError } = await supabase.from('users').insert([
        { id: userId, email, full_name: fullName || null }
      ]);
      insertError = userError;
    }
    if (insertError) return res.status(400).json({ error: insertError.message });

    res.status(201).json({ user: data.user });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.' });
  }
};

exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required.' });
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) return res.status(400).json({ error: error.message });
    // Check role in user_metadata
    if (data.user?.user_metadata?.role !== role) {
      return res.status(403).json({ error: `Not authorized as ${role}` });
    }
    res.status(200).json({ session: data.session, user: data.user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
};
