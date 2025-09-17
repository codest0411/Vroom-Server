// Simple location search API for India (demo, scalable for real use)
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());

// Demo: Replace with a real DB or external API for production
const locations = [
  { label: 'Mumbai, Maharashtra', value: { lat: 19.076, lng: 72.8777 } },
  { label: 'Delhi, Delhi', value: { lat: 28.6139, lng: 77.209 } },
  { label: 'Bengaluru, Karnataka', value: { lat: 12.9716, lng: 77.5946 } },
  { label: 'Chennai, Tamil Nadu', value: { lat: 13.0827, lng: 80.2707 } },
  { label: 'Kolkata, West Bengal', value: { lat: 22.5726, lng: 88.3639 } },
  // ...add more or connect to a real DB
];

app.get('/api/locations', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (!q) return res.json([]);
  // Simple substring match (replace with fuzzy search for real use)
  const results = locations.filter(loc => loc.label.toLowerCase().includes(q)).slice(0, 20);
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Location API running on port ${PORT}`);
  
});
