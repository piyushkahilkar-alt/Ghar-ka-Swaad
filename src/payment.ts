import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import toast from 'react-hot-toast';

export const verifyPayment = async (response: any, token: string, userStr: string, plan: any) => {
    console.log("[DEBUG Frontend] verifyPayment started with response:", response, "plan:", plan);
    const { uid } = JSON.parse(userStr);
    
    // Log API Request
    console.log("[DEBUG Frontend] Fetching /api/verify-payment API request...");
    const verifyResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userId: uid,
            planName: plan.name,
            amount: plan.monthly_price,
            planId: plan.id
        })
    });

    const verifyData = await verifyResponse.json();
    console.log("[DEBUG Frontend] /api/verify-payment API response:", verifyResponse.status, verifyData);
    
    if (!verifyResponse.ok) {
         console.error("[DEBUG Frontend] Payment verification failed at backend!");
         throw new Error(verifyData.error || 'Payment verification failed');
    }
    
    // Fallback: If verification succeeded but backend couldn't update Firestore (due to Vercel env constraints),
    // update Firestore securely from the frontend.
    try {
        console.log("[DEBUG Frontend] Initiating fast-save fallback to Firebase...");
        const renewal = new Date();
        renewal.setDate(renewal.getDate() + 30);
        const numericAmount = parseFloat((plan.monthly_price || "0").toString().replace(/[^0-9.]/g, ''));
        const newSubInfo = {
            status: 'active',
            planName: plan.name || "Unknown Plan",
            planId: plan.id ? plan.id.toString() : "",
            isPaused: false,
            startDate: new Date().toISOString(),
            renewalDate: renewal.toISOString(),
            expiryDate: renewal.toISOString(),
            paymentId: response.razorpay_payment_id,
            amountPaid: numericAmount,
            paymentStatus: 'success'
        };
        
        await setDoc(doc(db, "users", uid), {
            subscription: newSubInfo,
            subscriptions: arrayUnion(newSubInfo)
        }, { merge: true });
        
        await setDoc(doc(db, "payments", response.razorpay_payment_id), {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            userId: uid,
            amount: numericAmount,
            status: "success",
            plan: plan.name || "Unknown Plan",
            createdAt: new Date().toISOString()
        }, { merge: true });
        console.log("[DEBUG Frontend] Firebase save completed successfully!");
    } catch (dbErr) {
        console.error("[DEBUG Frontend] Firebase fast-save fallback failed:", dbErr);
    }
    
    return verifyData;
};

export const startPayment = async (
    plan: any, 
    userStr: string, 
    token: string, 
    onProcessing: (status: string) => void,
    onSuccess: (paymentId: string) => void, 
    onError: (error: Error) => void
) => {
    try {
        const { uid } = JSON.parse(userStr);
        const contact = JSON.parse(userStr).phoneOrEmail || "";
        const name = JSON.parse(userStr).name || "Customer";
        // Override env variables with provided valid keys to prevent Vercel caching old keys
        const keyId = "rzp_live_SuJKak8lep7KID";

        const numericPrice = parseFloat(plan.monthly_price.toString().replace(/[^0-9.]/g, ''));
        if (isNaN(numericPrice) || numericPrice <= 0) {
            throw new Error('Invalid plan price');
        }

        // --- Actual Plan Payment ---
        onProcessing('Initiating final payment...');
        const actualOrderResponse = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                amount: Math.round(numericPrice * 100),
                currency: 'INR',
                receipt: `receipt_plan_${plan.id}_${Date.now()}`,
                notes: { userId: uid, planName: plan.name }
            })
        });
        const actualOrderData = await actualOrderResponse.json();
        if (!actualOrderResponse.ok) throw new Error(actualOrderData.error || 'Failed to create final order');

        const actualOptions = {
            key: keyId,
            amount: actualOrderData.amount,
            currency: 'INR',
            name: "Ghar Ka Swaad",
            description: `Subscription: ${plan.name}`,
            order_id: actualOrderData.id,
            handler: async function (finalResponse: any) {
                try {
                    onProcessing('Activating Subscription...');
                    await verifyPayment(finalResponse, token, userStr, plan);
                    toast.success('Payment Successful!', { duration: 6000, icon: '✅' });
                    onSuccess(finalResponse.razorpay_payment_id);
                    
                    const userObj = JSON.parse(userStr);
                    const whatsappMsg = `*New Subscription Alert!*\n\n` +
                      `*Name:* ${userObj.name || userObj.displayName || ''}\n` +
                      `*Mobile Number:* ${userObj.phone || userObj.phoneNumber || ''}\n` +
                      `*Email:* ${userObj.email || ''}\n` +
                      `*Address:* ${[userObj.address, userObj.landmark, userObj.city].filter(Boolean).join(', ')}\n` +
                      `*Selected Plan:* ${plan.name}\n` +
                      `*Amount Paid:* ₹${plan.monthly_price}\n` +
                      `*Query:* ${userObj.userQuery || 'None'}\n\n` +
                      `*Payment ID:* ${finalResponse.razorpay_payment_id}`;
                      
                    setTimeout(() => {
                        window.open(`https://wa.me/918275116821?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
                    }, 3000);
                    
                } catch (err: any) {
                    toast.error(`Verification Failed: ${err.message}`);
                    onError(err);
                }
            },
            prefill: { name, contact },
            theme: { color: "#ff6c37" }
        };

        const rzpFinal = new (window as any).Razorpay(actualOptions);
        rzpFinal.on('payment.failed', function(res: any) {
            toast.error(`Actual Payment Failed: ${res?.error?.description}`);
            onError(new Error(`Payment Failed: ${res?.error?.description}`));
        });
        
        rzpFinal.open();

    } catch (error: any) {
        toast.error(error.message || "An error occurred");
        onError(error);
    }
};
