import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

let adminDb: any = null;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const adminApp = initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
    adminDb = getFirestore(adminApp);
  } else {
    const adminApp = initializeApp();
    adminDb = getFirestore(adminApp);
  }
} catch (e) {
  console.log('Firebase admin not fully initialized (waiting for credentials).');
}

const app = express();

app.use(express.json({
  verify: (req, res, buf) => {
    (req as any).rawBody = buf;
  }
}));
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
  mapLink?: string;
  latitude?: number;
  longitude?: number;
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
    this.mapLink = data.mapLink;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
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

  static async findById(id: string): Promise<any> {
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

  static async findByIdAndUpdate(id: string, update: any, options: any): Promise<any> {
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
    const { name, phoneOrEmail, password, address, landmark, city, mapLink, latitude, longitude } = req.body;

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
        city,
        mapLink,
        latitude,
        longitude
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
    );
    
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/profile', authenticateToken, async (req: any, res: any) => {
  try {
    let user = await User.findById(req.user.id);
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
    );
    
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
    );
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
    );
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
    );
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
      { id: 1, date: new Date().toISOString().split('T')[0], meal: user.subscription.planName, status: 'Out for Delivery' },
    ] : [];

    res.json({
      activePlan: user?.subscription?.planName || null,
      history: history,
      userLocation: {
        address: user?.address,
        mapLink: user?.mapLink,
        latitude: user?.latitude,
        longitude: user?.longitude
      }
    });
  } catch(e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Payment Routes - Razorpay
app.post('/api/create-order', authenticateToken, async (req: any, res: any) => {
  try {
    const { amount, currency, receipt } = req.body;
    const testingAmount = 100; // 1 INR

    const razorpayLive = new Razorpay({
      key_id: "rzp_live_SlNHXXiBlvShoX",
      key_secret: "y1PuBcho0RssIPRogKuHD0vS",
    });

    const options = {
      amount: testingAmount,
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: req.body.notes || {}
    };

    const order = await razorpayLive.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/verify-payment', authenticateToken, async (req: any, res: any) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planName, amount, planId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    const secret = "y1PuBcho0RssIPRogKuHD0vS";
    if (!secret) throw new Error('Razorpay secret not configured');

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Signature mismatch. Payment verification failed.' });
    }

    const numericAmount = parseFloat((amount || "0").toString().replace(/[^0-9.]/g, ''));
    if (adminDb && userId) {
      try {
        await adminDb.collection("payments").doc(razorpay_payment_id).set({
          paymentId: razorpay_payment_id,
          userId: userId,
          amount: numericAmount,
          status: "success",
          plan: planName || "Unknown Plan",
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.error("Firebase write error:", e);
      }
    }

    try {
       const user = await User.findById(req.user.id || userId);
       if (user) {
          user.subscription = user.subscription || {};
          user.subscription.status = 'active';
          user.subscription.planName = planName;
          user.subscription.planId = planId ? planId.toString() : "";
          user.subscription.isPaused = false;
          user.subscription.startDate = new Date().toISOString();
          const renewal = new Date();
          renewal.setDate(renewal.getDate() + 30);
          user.subscription.renewalDate = renewal.toISOString();
          user.subscription.expiryDate = renewal.toISOString();
          await user.save();
       }
    } catch (e) {}

    res.json({ success: true, message: 'Payment verified successfully.' });
  } catch (error) {
    console.error('Razorpay verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Razorpay Webhook Endpoint
app.post('/api/webhook', async (req, res) => {
  try {
    const webhookSecret = "y1PuBcho0RssIPRogKuHD0vS";
    const signature = req.headers['x-razorpay-signature'];
    
    if (webhookSecret && signature && (req as any).rawBody) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update((req as any).rawBody)
        .digest('hex');
      if (expectedSignature !== signature) {
        return res.status(400).send("Invalid Signature");
      }
    }

    const event = req.body;
    
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const userId = payment.notes?.userId || 'unknown_user';
      const planName = payment.notes?.planName || 'Unknown Plan';
      const amount = payment.amount / 100;

      if (adminDb) {
        try {
          await adminDb.collection("payments").doc(payment.id).set({
            paymentId: payment.id,
            userId: userId,
            amount: amount,
            status: "success",
            plan: planName,
            createdAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.error("Firebase write failed:", dbErr);
        }
      }

      if (userId !== 'unknown_user') {
        const user = await User.findById(userId);
        if (user) {
          user.subscription = user.subscription || {};
          user.subscription.status = 'active';
          user.subscription.isPaused = false;
          user.subscription.planName = planName;
          user.subscription.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          await user.save();
        }
      }
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send("Webhook processing failed");
  }
});

app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

export default app;
