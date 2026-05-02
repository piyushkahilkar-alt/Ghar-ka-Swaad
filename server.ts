import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error. Please verify your MONGO_URI:', err.message));
} else {
  console.warn('WARN: MONGO_URI is not set. Database operations will fail if called.');
}

// Mongoose Models
const notificationPrefsSchema = new mongoose.Schema({
  orderUpdates: { type: Boolean, default: true },
  menuAnnouncements: { type: Boolean, default: false }
}, { _id: false });

const subscriptionSchema = new mongoose.Schema({
  isPaused: { type: Boolean, default: false },
  pauseStartDate: { type: Date, default: null },
  pauseEndDate: { type: Date, default: null }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneOrEmail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  referralCode: { type: String },
  referralRewards: { type: Number, default: 0 },
  notifications: { type: notificationPrefsSchema, default: () => ({}) },
  subscription: { type: subscriptionSchema, default: () => ({}) }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// JWT Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- API Routes ---

// 1. Register User
app.post('/api/register', async (req, res) => {
  try {
    const { name, phoneOrEmail, password } = req.body;

    // Basic Validation
    if (!name || !phoneOrEmail || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ phoneOrEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this phone/email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      phoneOrEmail,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Login User
app.post('/api/login', async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;

    const user = await User.findOne({ phoneOrEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, phoneOrEmail: user.phoneOrEmail } });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/profile', authenticateToken, async (req: any, res: any) => {
  try {
    const { name, phoneOrEmail } = req.body;
    
    if (!name || !phoneOrEmail) {
      return res.status(400).json({ error: 'Name and contact are required' });
    }

    const existingUser = await User.findOne({ phoneOrEmail, _id: { $ne: req.user.id } });
    if (existingUser) {
      return res.status(400).json({ error: 'This contact is already associated with another account' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, phoneOrEmail } },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. User Profile
app.get('/api/profile', authenticateToken, async (req: any, res: any) => {
  try {
    let user = await User.findById(req.user.id).select('-password');
    if (user && !user.referralCode) {
      user.referralCode = 'GHS-' + user._id.toString().substring(0, 6).toUpperCase();
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/profile/notifications', authenticateToken, async (req: any, res: any) => {
  try {
    const { orderUpdates, menuAnnouncements } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          'notifications.orderUpdates': orderUpdates,
          'notifications.menuAnnouncements': menuAnnouncements
        } 
      },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/profile/subscription/pause', authenticateToken, async (req: any, res: any) => {
  try {
    const { startDate, endDate } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          'subscription.isPaused': true,
          'subscription.pauseStartDate': startDate,
          'subscription.pauseEndDate': endDate
        } 
      },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/profile/subscription/resume', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          'subscription.isPaused': false,
          'subscription.pauseStartDate': null,
          'subscription.pauseEndDate': null
        } 
      },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. User Orders (Dummy Data)
app.get('/api/orders', authenticateToken, (req: any, res: any) => {
  // Dummy order history
  res.json({
    activePlan: "Standard Veg Plan",
    history: [
      { id: 1, date: '2023-10-25', meal: 'Standard Veg Daily Meal', status: 'Delivered' },
      { id: 2, date: '2023-10-24', meal: 'Standard Veg Daily Meal', status: 'Delivered' },
    ]
  });
});

// Setup Vite Middleware for frontend React app
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production logic
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
