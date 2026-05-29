import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { sendWhatsAppMessage } from '../src/services/whatsapp.js';

dotenv.config();

let adminDb: any = null;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const adminApp = initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
    adminDb = getFirestore(adminApp);
  } else {
    // Prevent hanging on default credentials in Vercel
    console.log("No FIREBASE_SERVICE_ACCOUNT provided. Skipping Firebase Admin initialization.");
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

  if (token.startsWith('dummy-token-')) {
    req.user = { id: token.replace('dummy-token-', '') };
    return next();
  }

  try {
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// --- API Routes ---

app.post(['/api/send-otp', '/send-otp'], async (req, res) => {
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

app.post(['/api/register', '/register'], async (req, res) => {
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

app.post(['/api/login', '/login'], async (req, res) => {
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

app.put(['/api/profile', '/profile'], authenticateToken, async (req: any, res: any) => {
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

app.get(['/api/profile', '/profile'], authenticateToken, async (req: any, res: any) => {
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

app.get('/api/track-order/:phone', async (req: any, res: any) => {
  try {
    const phone = req.params.phone;
    if (!phone) return res.status(400).json({ error: "Phone number required" });
    
    if (adminDb) {
        try {
             const querySnapshot = await adminDb.collection("users").where("phoneOrEmail", "==", phone).get();
             if (!querySnapshot.empty) {
                 const userData = querySnapshot.docs[0].data();
                 let plans: any[] = [];
                 if (userData.subscriptions && userData.subscriptions.length > 0) {
                     plans = userData.subscriptions;
                 } else if (userData.subscription && userData.subscription.planName) {
                     plans = [userData.subscription];
                 }
                 if (plans.length > 0) {
                     return res.json({ success: true, plans, location: { address: userData.address, latitude: userData.latitude, longitude: userData.longitude }});
                 }
             }
        } catch (e) {
            console.log("Firestore query failed for tracking:", e);
        }
    }
  
    const user = await User.findOne({ phoneOrEmail: phone });
    if (user) {
        let plans: any[] = [];
        if (user.subscriptions && user.subscriptions.length > 0) plans = user.subscriptions;
        else if (user.subscription && user.subscription.planName) plans = [user.subscription];
        
        if (plans.length > 0) {
            return res.json({ success: true, plans, location: { address: user.address, latitude: user.latitude, longitude: user.longitude }});
        }
    }
  
    return res.status(404).json({ error: "No active plans found for this number." });
  } catch (error) {
    res.status(500).json({ error: "Server error tracking order." });
  }
});

app.get(['/api/orders', '/orders'], authenticateToken, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Generate some history based on whether they have an active plan or not
    let history: any[] = [];
    if (user?.subscriptions && user.subscriptions.length > 0) {
       history = user.subscriptions.map((sub: any, i: number) => ({ id: i + 1, date: new Date().toISOString().split('T')[0], meal: sub.planName, status: 'Out for Delivery' }));
    } else if (user?.subscription?.planName) {
       history = [{ id: 1, date: new Date().toISOString().split('T')[0], meal: user.subscription.planName, status: 'Out for Delivery' }];
    }

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
app.post(['/api/create-order', '/create-order'], authenticateToken, async (req: any, res: any) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    const finalAmount = amount || 100; // Use actual amount or fallback to 1 INR

    const razorpayLive = new Razorpay({
      key_id: "rzp_live_SuJKak8lep7KID",
      key_secret: "pXmA9tDdGrz8gt6MZDdo0STs",
    });

    console.log(`[Checkout process] Creating Razorpay order for amount: ${finalAmount}`);

    const options = {
      amount: finalAmount,
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {}
    };

    const order = await razorpayLive.orders.create(options);
    console.log(`[Checkout process] Successfully created order: ${order.id}`);
    
    // Save pending order
    if (adminDb && req.body.notes?.userId) {
      try {
        await adminDb.collection("payments").doc(`order_${order.id}`).set({
          orderId: order.id,
          userId: req.body.notes.userId,
          amount: finalAmount / 100,
          status: "pending",
          plan: req.body.notes.planName || "Unknown Plan",
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) { }
    }
    
    res.json(order);
  } catch (error: any) {
    console.error('Razorpay create order error detail:', error.message || error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

app.post(['/api/verify-payment', '/verify-payment'], authenticateToken, async (req: any, res: any) => {
  try {
    console.log(`[Verify Payment] Received verification request for order: ${req.body.razorpay_order_id}`);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planName, amount, planId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    const secret = "pXmA9tDdGrz8gt6MZDdo0STs";
    if (!secret) throw new Error('Razorpay secret not configured');

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error(`[Verify Payment] Signature mismatch for order: ${razorpay_order_id}`);
      return res.status(400).json({ error: 'Signature mismatch. Payment verification failed.' });
    }
    
    console.log(`[Verify Payment] Signature matched for order: ${razorpay_order_id}. Capturing successful payment.`);

    const numericAmount = parseFloat((amount || "0").toString().replace(/[^0-9.]/g, ''));
    if (adminDb && userId) {
      try {
        await adminDb.collection("payments").doc(razorpay_payment_id).set({
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          userId: userId,
          amount: numericAmount,
          status: "success",
          plan: planName || "Unknown Plan",
          createdAt: new Date().toISOString()
        }, { merge: true });

        // Update the user's document in Firestore with subscription details
        const renewal = new Date();
        renewal.setDate(renewal.getDate() + 30);
        const newSubInfo = {
            status: 'active',
            planName: planName || "Unknown Plan",
            planId: planId ? planId.toString() : "",
            isPaused: false,
            startDate: new Date().toISOString(),
            renewalDate: renewal.toISOString(),
            expiryDate: renewal.toISOString(),
            paymentId: razorpay_payment_id
        };
        await adminDb.collection("users").doc(userId).set({
          subscription: newSubInfo, // Legacy fallback
          subscriptions: FieldValue.arrayUnion(newSubInfo)
        }, { merge: true });
        
      } catch (e) {
        console.error("Firebase write error:", e);
      }
    }

    try {
      let phoneToSend =req.body.contact;
      let actualUserId = req.user?.id || userId;
      if (!phoneToSend && actualUserId) {
        const user = await User.findById(actualUserId);
        if (user && user.phoneOrEmail) phoneToSend = user.phoneOrEmail;
      }
      
      const successMessage = `Hello, your payment of ₹${numericAmount} for the ${planName} plan was successful! Enjoy your subscription.`;
      const ownerMessage = `[Admin Alert] User ${phoneToSend} (ID: ${actualUserId}) bought ${planName} for ₹${numericAmount}. Payment ID: ${razorpay_payment_id}`;
      
      if (phoneToSend) {
         sendWhatsAppMessage(phoneToSend, successMessage);
      }
      sendWhatsAppMessage("827516821", ownerMessage);

      // Silent Google Sheets Webhook
      try {
        let webhookUserObj = { name: "Not provided", email: "Not provided", address: "Not provided" };
        
        try {
           const localUser = await User.findById(actualUserId) || await User.findById(req.user?.id);
           if (localUser) {
               webhookUserObj = {
                 name: localUser.name || "Not provided",
                 email: localUser.phoneOrEmail || "Not provided", // often used as email
                 address: [localUser.address, localUser.landmark, localUser.city].filter(Boolean).join(', ')
               };
               if (!phoneToSend || phoneToSend === "Customer") {
                  phoneToSend = localUser.phoneOrEmail || "Not provided";
               }
           }
        } catch (e) { console.error(e) }

        if (adminDb && actualUserId && webhookUserObj.name === "Not provided") {
           const snap = await adminDb.collection("users").doc(actualUserId).get();
           if (snap.exists && snap.data()) {
               const data = snap.data();
               webhookUserObj = {
                 name: data.name || data.displayName || "Not provided",
                 email: data.email || "Not provided",
                 address: [data.address, data.landmark, data.city].filter(Boolean).join(', ')
               };
               if (!phoneToSend || phoneToSend === "Customer") {
                  phoneToSend = data.phone || data.phoneNumber || "Not provided";
               }
           }
        }

        const planDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(planDate.getDate() + 30);

        const sheetData = {
          name: webhookUserObj.name,
          mobile: phoneToSend,
          email: webhookUserObj.email,
          address: webhookUserObj.address || "Not provided",
          selectedPlan: planName,
          amountPaid: numericAmount,
          planDate: planDate.toISOString(),
          expiryDate: expiryDate.toISOString()
        };

        fetch("https://script.google.com/macros/s/AKfycbymDzWgpjJQcgWateXiuCh9a-ZgcLSVETbP90EVyp8rlLzbJhrMEh57PoZQpG7mbb9c9A/exec", {
          method: "POST",
          headers: {
             "Content-Type": "application/json",
          },
          body: JSON.stringify(sheetData)
        }).catch(e => console.error("Webhook post failed:", e));
      } catch (err) {
        console.error("Webhook processing error:", err);
      }
    } catch(err) {
      console.error("Error sending WA in verify:", err);
    }

    try {
       const user = await User.findById(req.user.id || userId);
       if (user) {
          user.subscriptions = user.subscriptions || [];
          const now = new Date();
          const renewal = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

          const newSub = {
              status: 'active',
              planName: planName,
              planId: planId ? planId.toString() : "",
              isPaused: false,
              startDate: now.toISOString(),
              renewalDate: renewal.toISOString(),
              expiryDate: renewal.toISOString()
          };
          user.subscriptions.push(newSub);

          user.subscription = newSub; // fallback
          await user.save();
       }
    } catch (e) {}

    res.json({ success: true, message: 'Payment verified successfully.' });
  } catch (error: any) {
    console.error('Razorpay verify payment error detail:', error.message || error);
    res.status(500).json({ error: 'Failed to verify payment', details: error.message });
  }
});

// Razorpay Webhook Endpoint
app.post(['/api/webhook', '/webhook'], async (req, res) => {
  try {
    const webhookSecret = "pXmA9tDdGrz8gt6MZDdo0STs";
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
      const userPhone = payment.contact || 'Customer'; // Razorpay includes contact
      const amount = payment.amount / 100;

      console.log(`[Notification Alert] ✅ Payment Successful: ₹${amount} for ${planName}.`);
      
      if (adminDb) {
        try {
          await adminDb.collection("payments").doc(payment.id).set({
            paymentId: payment.id,
            orderId: payment.order_id,
            userId: userId,
            amount: amount,
            status: "success",
            plan: planName,
            createdAt: new Date().toISOString()
          }, { merge: true });

          if (userId !== 'unknown_user') {
            const renewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            const newSubInfo = {
                status: 'active',
                planName: planName,
                isPaused: false,
                startDate: new Date().toISOString(),
                renewalDate: renewal.toISOString(),
                expiryDate: renewal.toISOString(),
                paymentId: payment.id
            };
            await adminDb.collection("users").doc(userId).set({
              subscription: newSubInfo,
              subscriptions: FieldValue.arrayUnion(newSubInfo)
            }, { merge: true });
          }
        } catch (dbErr) {
          console.error("Firebase write failed:", dbErr);
        }
      }

      // 👉 Send WhatsApp Message
      try {
        let phoneToSend = userPhone;
        // If razorpay didn't have phone, try to get from our DB
        if (userId !== 'unknown_user' && (!phoneToSend || phoneToSend === 'Customer')) {
             const user = await User.findById(userId);
             if (user && user.phoneOrEmail) { phoneToSend = user.phoneOrEmail; }
        }
        
        const successMessage = `Hello, your payment of ₹${amount} for the ${planName} plan was successful! Enjoy your subscription.`;
        const ownerMessage = `[Admin Alert] User ${phoneToSend} (ID: ${userId}) bought ${planName} for ₹${amount}. Payment ID: ${payment.id}`;
        
        // Notify Customer
        if (phoneToSend && phoneToSend !== 'Customer') {
            sendWhatsAppMessage(phoneToSend, successMessage);
        }
        
        // Notify Owner
        sendWhatsAppMessage("827516821", ownerMessage);

      } catch (waErr) {
        console.error("Failed to send WhatsApp message:", waErr);
      }

      if (userId !== 'unknown_user') {
        const user = await User.findById(userId);
        if (user) {
          user.subscriptions = user.subscriptions || [];
          const newSub = {
              status: 'active',
              planName: planName,
              isPaused: false,
              startDate: new Date().toISOString(),
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          user.subscriptions.push(newSub);

          user.subscription = newSub; // legacy
          await user.save();
        }
      }
    } else if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const userId = payment.notes?.userId || 'unknown_user';
      const planName = payment.notes?.planName || 'Unknown Plan';
      const userPhone = payment.contact || 'Customer';
      const amount = payment.amount / 100;
      
      console.log(`[Notification Alert] ❌ Payment Failed: ₹${amount} for ${planName} (User: ${userId}).`);

      if (adminDb) {
        try {
          await adminDb.collection("payments").doc(payment.id).set({
            paymentId: payment.id,
            orderId: payment.order_id,
            userId: userId,
            amount: amount,
            status: "failed",
            plan: planName,
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (dbErr) {
          console.error("Firebase write failed:", dbErr);
        }
      }

      // 👉 Send WhatsApp Message for Failure
      try {
        let phoneToSend = userPhone;
        if (userId !== 'unknown_user' && (!phoneToSend || phoneToSend === 'Customer')) {
             const user = await User.findById(userId);
             if (user && user.phoneOrEmail) { phoneToSend = user.phoneOrEmail; }
        }
        
        const failMessage = `Hello, your payment of ₹${amount} for the ${planName} plan failed. Please try again or contact support.`;
        const ownerMessage = `[Admin Alert] Payment FAILED for User ${phoneToSend} (ID: ${userId}) - Plan: ${planName}, ₹${amount}.`;
        
        if (phoneToSend && phoneToSend !== 'Customer') {
            sendWhatsAppMessage(phoneToSend, failMessage);
        }
        sendWhatsAppMessage("827516821", ownerMessage);
      } catch (waErr) {
        console.error("Failed to send WhatsApp message:", waErr);
      }
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send("Webhook processing failed");
  }
});

app.get(['/api/admin/sync-sheets', '/admin/sync-sheets'], async (req: any, res: any) => {
  try {
    if (!adminDb) return res.status(500).json({ error: "Firebase admin not initialized." });
    
    const usersSnap = await adminDb.collection("users").get();
    const paymentsSnap = await adminDb.collection("payments").get();
    
    const paymentsByUser: Record<string, number> = {};
    paymentsSnap.forEach((doc: any) => {
      const data = doc.data();
      if (data.userId && data.amount) {
         paymentsByUser[data.userId] = (paymentsByUser[data.userId] || 0) + data.amount;
      }
    });

    const syncedUsers = [];
    const webhookUrl = "https://script.google.com/macros/s/AKfycbymDzWgpjJQcgWateXiuCh9a-ZgcLSVETbP90EVyp8rlLzbJhrMEh57PoZQpG7mbb9c9A/exec";

    for (const doc of usersSnap.docs) {
       const data = doc.data();
       
       let planName = data.subscription?.planName || data.selectedPlan || data.planName || data.plan || "Old Plan";
       let time = data.createdAt ? (typeof data.createdAt.toMillis === 'function' ? data.createdAt.toMillis() : new Date(data.createdAt).getTime()) : Date.now();
       if (isNaN(time)) time = Date.now();
       
       let amountPaid = paymentsByUser[doc.id] || data.amount || data.paidAmount || data.amountPaid || 0;
       
       const planDate = new Date(time);
       const expiryDate = new Date(time);
       expiryDate.setDate(planDate.getDate() + 30);
       
       const sheetData = {
          name: data.name || data.displayName || data.fullName || "Not provided",
          mobile: data.phone || data.phoneNumber || data.mobile || data.phoneOrEmail || "Not provided",
          email: data.email || "Not provided",
          address: [data.address, data.landmark, data.city].filter(Boolean).join(', ') || "Not provided",
          selectedPlan: planName,
          amountPaid: amountPaid,
          planDate: planDate.toISOString(),
          expiryDate: expiryDate.toISOString()
       };

       fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sheetData)
       }).catch(e => console.error("Sync Webhook failed for user", doc.id, e));
       
       syncedUsers.push(sheetData);
    }
    
    res.json({ success: true, count: syncedUsers.length, users: syncedUsers });
  } catch (err: any) {
    console.error("Sync Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

export default app;
