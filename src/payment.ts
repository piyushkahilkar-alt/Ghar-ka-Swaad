import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

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
        onProcessing('Creating order...');
        
        // 1. Create Order Backend Call
        const numericPrice = parseFloat(plan.monthly_price.toString().replace(/[^0-9.]/g, ''));
        if (isNaN(numericPrice) || numericPrice <= 0) {
            throw new Error('Invalid plan price');
        }

        const { uid } = JSON.parse(userStr);
        const orderResponse = await fetch('/api/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                amount: Math.round(numericPrice * 100), // paise
                currency: 'INR',
                receipt: `receipt_plan_${plan.id}_${Date.now()}`,
                notes: {
                    userId: uid,
                    planName: plan.name
                }
            })
        });


        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
            throw new Error(orderData.error || 'Failed to create order');
        }

        onProcessing('Opening Secure Payment...');

        // 2. Open Razorpay Checkout Modal
        // Use explicitly provided test key if environment variable is missing or different
        const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        const keyId = "rzp_test_SlJrq5daKnq9o0"; // explicitly set as requested by user
        if (!keyId) {
            throw new Error('Razorpay Key ID not found');
        }

        const options = {
            key: keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Ghar Ka Swaad",
            description: `Subscription: ${plan.name}`,
            order_id: orderData.id,
            handler: async function (response: any) {
                try {
                    onProcessing('Activating Subscription...');
                    await verifyPayment(response, token, userStr, plan);
                    
                    // Call success callback
                    onSuccess(response.razorpay_payment_id);
                } catch (error: any) {
                    onError(error);
                }
            },
            prefill: {
                name: JSON.parse(userStr).name || "Customer",
                contact: JSON.parse(userStr).phoneOrEmail || "",
            },
            theme: {
                color: "#ff6c37"
            }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
            onError(new Error(`Payment Failed: ${response.error.description}`));
        });
        
        rzp.open();

    } catch (error: any) {
        onError(error);
    }
};
