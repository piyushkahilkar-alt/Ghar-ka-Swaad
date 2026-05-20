import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export const verifyPayment = async (response: any, token: string, userStr: string, plan: any) => {
    const { uid } = JSON.parse(userStr);
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
    
    if (!verifyResponse.ok) {
         throw new Error(verifyData.error || 'Payment verification failed');
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
        const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_Srj7kQKZ36qnD2";

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
                    toast.success('Payment Successful! Please share screenshot of this payment on our WhatsApp.', { duration: 6000, icon: '📱' });
                    onSuccess(finalResponse.razorpay_payment_id);
                    setTimeout(() => {
                        window.open(`https://wa.me/918275116821?text=Hi, I subscribed to ${encodeURIComponent(plan.name)}. Payment ID: ${finalResponse.razorpay_payment_id}. Please find attached my screenshot.`, '_blank');
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
