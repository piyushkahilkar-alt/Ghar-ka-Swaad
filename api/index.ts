import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB connection Mocked
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

const FAKE_DB: { users: any[] } = { users: [] };

class User {
  _id: string;
  name?: string;
  phoneOrEmail?: string;
  password?: string;
  address?: string;
  landmark?: string;
  city?: string;
  referralCode?: string;
  referralRewards: number;
  notifications: any;
  subscription: any;

  constructor(data: any) {
    this._id = Date.now().toString();
    this.name = data.name;
    this.phoneOrEmail = data.phoneOrEmail;
    this.password = data.password;
    this.address = data.address;
    this.landmark = data.landmark;
    this.city = data.city;
    this.referralRewards = 0;
    this.notifications = {};
    this.subscription = {};
  }

  async save() {
    const index = FAKE_DB.users.findIndex((u:any) => u._id === this._id);
    if(index === -1) {
      FAKE_DB.users.push({...this});
    } else {
      FAKE_DB.users[index] = {...this};
    }
  }

  static async findOne(query: any) {
    return FAKE_DB.users.find(u => {
      if (query.phoneOrEmail && query._id) return u.phoneOrEmail === query.phoneOrEmail && u._id !== query._id.$ne;
      return u.phoneOrEmail === query.phoneOrEmail;
    }) || null;
  }

  static async findById(id: string) {
    const data = FAKE_DB.users.find(u => u._id === id);
    if (!data) return null;
    const user = new User(data);
    user._id = data._id;
    user.referralCode = data.referralCode;
    user.referralRewards = data.referralRewards;
    user.notifications = data.notifications || {};
    user.subscription = data.subscription || {};
    (user as any).select = function() { return this; };
    return user;
  }

  static async findByIdAndUpdate(id: string, update: any, options: any) {
    const userIndex = FAKE_DB.users.findIndex(u => u._id === id);
    if (userIndex === -1) throw new Error('User not found');
    
    if (update.$set) {
      for (const [key, val] of Object.entries(update.$set)) {
        const parts = key.split('.');
        if (parts.length === 2) {
          FAKE_DB.users[userIndex][parts[0]] = FAKE_DB.users[userIndex][parts[0]] || {};
          FAKE_DB.users[userIndex][parts[0]][parts[1]] = val;
        } else {
          FAKE_DB.users[userIndex][key] = val;
        }
      }
    }
    const updatedUser = FAKE_DB.users[userIndex];
    return { select: () => updatedUser };
  }
}

// @ts-ignore
mongoose.models = { User: User };

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

app.post('/api/send-otp', async (req, res) => {
  try {
    const { phoneOrEmail } = req.body;
    if (!phoneOrEmail) {
      return res.status(400).json({ error: 'Phone or email is required' });
    }
    // Simulation: integrate with WhatsApp Business API using business account 8275116821.
    console.log(`[WhatsApp Business 8275116821] Sent OTP to ${phoneOrEmail}`);
    res.json({ message: 'OTP sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, phoneOrEmail, password, address, landmark, city } = req.body;

    if (!name || !phoneOrEmail || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const existingUser = await User.findOne({ phoneOrEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this phone/email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ 
        name, 
        phoneOrEmail, 
        password: hashedPassword,
        address,
        landmark,
        city
    });
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;

    const user = await User.findOne({ phoneOrEmail });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

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

app.post('/api/plans/subscribe', authenticateToken, async (req: any, res: any) => {
  try {
    const { planId, planName } = req.body;
    const startDate = new Date();
    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + 30); // 30 days plan typically

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          'subscription.planId': planId,
          'subscription.planName': planName,
          'subscription.status': 'active',
          'subscription.startDate': startDate,
          'subscription.renewalDate': renewalDate,
          'subscription.isPaused': false,
          'subscription.pauseStartDate': null,
          'subscription.pauseEndDate': null
        } 
      },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Subscribe error:', error);
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

app.get('/api/orders', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Generate some history based on whether they have an active plan or not
    const history = user?.subscription?.planName ? [
      { id: 1, date: new Date().toISOString().split('T')[0], meal: user.subscription.planName, status: 'Preparing' },
    ] : [];

    res.json({
      activePlan: user?.subscription?.planName || null,
      history: history
    });
  } catch(e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default app;
