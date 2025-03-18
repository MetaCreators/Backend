import dotenv from "dotenv";
import Razorpay from "razorpay";
dotenv.config();

let razorpayInstance: Razorpay | null = null;

export async function getRazorpayInstance() {
    if (!razorpayInstance) {
        console.log("creating new razorpay instance")
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        console.log("new razorpay instance created")
    }
    return razorpayInstance;
}
