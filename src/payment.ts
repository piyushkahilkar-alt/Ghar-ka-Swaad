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
        const keyId = "rzp_live_SlcqfzS2rFe2iS";

        const numericPrice = parseFloat(plan.monthly_price.toString().replace(/[^0-9.]/g, ''));
        if (isNaN(numericPrice) || numericPrice <= 0) {
            throw new Error('Invalid plan price');
        }

        // --- STEP 1: ₹1 Verification ---
        onProcessing('Initiating ₹1 Verification...');
        
        const verifyOrderResponse = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                amount: 100, // ₹1
                currency: 'INR',
                receipt: `receipt_verify_${uid}_${Date.now()}`,
                notes: { userId: uid, planName: 'Verification' }
            })
        });
        const verifyOrderData = await verifyOrderResponse.json();
        if (!verifyOrderResponse.ok) throw new Error(verifyOrderData.error || 'Failed to create verification order');

        const verifyOptions = {
            key: keyId,
            amount: 100,
            currency: 'INR',
            name: "Ghar Ka Swaad (Verification)",
            description: "₹1 Verification for Subscription",
            order_id: verifyOrderData.id,
            handler: async function (response: any) {
                window.alert("Verification Successful! Now initiating actual payment...");
                
                // --- STEP 2: Actual Plan Payment ---
                try {
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
                                window.alert("Payment Successful!");
                                toast.success('Payment Successful! Activating plan...', { duration: 4000 });
                                onSuccess(finalResponse.razorpay_payment_id);
                            } catch (err: any) {
                                window.alert("Payment Verification Failed!");
                                toast.error(`Verification Failed: ${err.message}`);
                                onError(err);
                            }
                        },
                        prefill: { name, contact },
                        theme: { color: "#ff6c37" }
                    };

                    const rzpFinal = new (window as any).Razorpay(actualOptions);
                    rzpFinal.on('payment.failed', function(res: any) {
                        window.alert("Actual Payment Failed!");
                        toast.error(`Payment Failed: ${res?.error?.description}`);
                        onError(new Error(`Payment Failed: ${res?.error?.description}`));
                    });
                    rzpFinal.open();
                } catch(actualErr: any) {
                    window.alert("Actual Payment Initiation Failed!");
                    onError(actualErr);
                }
            },
            prefill: { name, contact },
            theme: { color: "#ff6c37" }
        };

        const rzpVerify = new (window as any).Razorpay(verifyOptions);
        rzpVerify.on('payment.failed', function (res: any) {
            window.alert("Verification Payment Failed!");
            const errDesc = res?.error?.description || "Payment Failed";
            toast.error(`Verification Failed: ${errDesc}`);
            onError(new Error(`Verification Failed: ${errDesc}`));
        });
        rzpVerify.open();

    } catch (error: any) {
        window.alert("Failed to start payment process!");
        toast.error(error.message || "An error occurred");
        onError(error);
    }
};
