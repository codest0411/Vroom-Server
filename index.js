// ...existing code...
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_IO_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: [
    'https://vroom-client.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// Stripe client
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reviews', require('./routes/reviews'));
// ...admin route removed...
// ...existing code...
app.use('/api', require('./routes/stripe'));

// Example route
app.get('/', (req, res) => {
  res.send('Vr00m backend running!');
});


// WebSocket events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Rider requests a ride (for live updates)
  socket.on('joinRideRoom', (rideId) => {
    socket.join(`ride_${rideId}`);
  });

  // Driver accepts a ride
  socket.on('acceptRide', ({ rideId, driverId }) => {
    // Notify all in the ride room
    io.to(`ride_${rideId}`).emit('rideAccepted', { rideId, driverId });
  });

  // Ride status update (e.g., picked up, completed)
  socket.on('rideStatus', ({ rideId, status }) => {
    io.to(`ride_${rideId}`).emit('rideStatusUpdate', { rideId, status });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
