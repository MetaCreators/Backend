import { Router, Request, Response } from "express";
import { generateScript } from "../services/script";
import { generateDescription } from "../services/description";
import { authMiddleware } from "../middleware/auth";
import { finetune } from "../services/thumbnail/finetune";
import * as aws from "aws-sdk";
import crypto from "crypto";

import {
  GeminiService,
  ReplicateService,
  ImageController,
} from "../services/thumbnail/genpersonimage";

import dotenv from "dotenv";
import { checkUserExists, createNewUser, getUserGeneratedImages } from "../db/functions";
import { getRazorpayInstance } from "../services/razorpay/razorpay";

const router = Router();
dotenv.config();

const geminiService = new GeminiService(process.env.GEMINI_API_KEY as string);
const replicateService = new ReplicateService(
  process.env.REPLICATE_API_KEY as string
);
const bucket = "lithouseuserimages";
const digiendpoint = new aws.Endpoint("blr1.digitaloceanspaces.com");
const s3Client = new aws.S3({
  endpoint: digiendpoint,
  accessKeyId: process.env.DIGIOCEAN_OBJECT_ACCESS_ID || "",
  secretAccessKey: process.env.DIGIOCEAN_OBJECT_SECRET || ""
});

// Initialize controller
const imageController = new ImageController(geminiService, replicateService);

router.post("/script", generateScript);

router.post("/description", authMiddleware, generateDescription);

//router.post("/imagefinetune", authMiddleware, finetune);
//TODO: Add middleware after testing
router.post("/imagefinetune", finetune);

router.post(
  "/genpersonimage",
  (req: Request, res: Response) => {
    imageController.generateImage(req, res);
  }
);

router.get(
  "/get-presignedurl-upload",
  async (req: Request, res: Response) => {
    const { userId } = req.query;
    const key = `${userId}/trainingImages/${Date.now()}.zip`;
    const s3Params = {
      Bucket: bucket,
      Key: key,
      ContentType: "application/zip"
    };
    //this presignedUrl is for uploading zip files => wont open if you directly click on it
    const presignedUrl = await s3Client.getSignedUrlPromise("putObject", s3Params);
    console.log("presigned URl for saving training images is ", presignedUrl);
    res.json({
      presignedUrl: presignedUrl,
      filename: key
    })
  }
);

router.post("/training-status", async (req: Request, res: Response) => {
  //TODO:
  //here,
  //1) update the training status in db
  //2) save other necessary things in db => update the models list for user
  //3) What are other necessary items ??
})

router.post("/signup", async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    await createNewUser("newuser_" + Date.now(), email);
    res.json({
      message: "New User created successfully"
    });
  } catch (error: any) {
    if (error.message === "User with this email already exists") {
      res.json({
        message: "User already exists"
      });
    } else {
      res.status(500).json({
        error: error.message
      });
    }
  }
});

router.post('/user/check', async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await checkUserExists(email);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check user existence' });
  }
});

router.post('/user/getgeneratedimages', async (req: Request, res: Response) => {
  const { userId, modelId } = req.body;
  try {
    const images = await getUserGeneratedImages(userId, modelId);
    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user generated images' });
  }
});

// router.post('/payment', async (req: Request, res: Response) => {

//   try {
//     const razorpayInstance = await getRazorpayInstance();
//     const options = {
//       amount: 5000,
//       currency: "INR",
//       receipt: "receipt_order_7700000000000000000000",
//     };
//     const order = await razorpayInstance.orders.create(options);
//     res.json({ order });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'Failed to create order' });
//   }
// });

// router.post('/razorpay/create-order', async (req: Request, res: Response) => {
//   try {
//     const razorpayInstance = await getRazorpayInstance();
//     const options = {
//       amount: 100, // Amount in paise (₹500)
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//       notes: {
//         userId: req.body.userId // Add userId to track which user made the payment
//       }
//     };
//     const order = await razorpayInstance.orders.create(options);
//     res.json({
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency
//     });
//   } catch (error) {
//     console.error('Razorpay order creation error:', error);
//     res.status(500).json({ error: 'Failed to create order' });
//   }
// });

// router.post('/razorpay/verify', async (req: Request, res: Response) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       razorpay_payment_status
//     } = req.body;

//     // Verify the payment signature
//     const razorpayInstance = await getRazorpayInstance();
//     const generated_signature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
//       .update(razorpay_order_id + '|' + razorpay_payment_id)
//       .digest('hex');

//     if (generated_signature === razorpay_signature) {
//       // Payment is verified
//       if (razorpay_payment_status === 'paid') {
//         // Update user credits in your database
//         // await addUserCredits(userId, creditsToAdd);

//         res.json({
//           success: true,
//           message: 'Payment verified successfully'
//         });
//       } else {
//         res.status(400).json({
//           success: false,
//           message: 'Payment not completed'
//         });
//       }
//     } else {
//       res.status(400).json({
//         success: false,
//         message: 'Invalid payment signature'
//       });
//     }
//   } catch (error) {
//     console.error('Payment verification error:', error);
//     res.status(500).json({ error: 'Payment verification failed' });
//   }
// });

router.post('/razorpay/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, plan } = req.body;
    const razorpayInstance = await getRazorpayInstance();

    // Define plan-specific amounts in paise
    const planAmounts: { [key: string]: number } = {
      'Plus': 128000,    // ₹16
      'Max': 2176000,     // ₹27
      'Pro': 280000      // ₹35
    };

    // Get the amount based on the plan, or use the provided amount
    const orderAmount = planAmounts[plan] || amount;

    const options = {
      amount: orderAmount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: plan,
        userId: req.body.userId // Add userId to track which user made the payment
      }
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: plan
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/razorpay/verify', async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_payment_status,
      plan
    } = req.body;

    // Verify the payment signature
    const razorpayInstance = await getRazorpayInstance();
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment is verified
      if (razorpay_payment_status === 'paid') {
        // Define plan-specific credits/features
        const planCredits: { [key: string]: any } = {
          'Plus': {
            aiGenerationMinutes: 50,
            iStockCredits: 80,
            storageGB: 100,
            voiceClones: 2
          },
          'Max': {
            aiGenerationMinutes: 200,
            iStockCredits: 320,
            storageGB: 400,
            voiceClones: 5
          },
          'Pro': {
            aiGenerationMinutes: 200,
            iStockCredits: 320,
            storageGB: 400,
            voiceClones: 5
          }
        };

        // Update user's subscription in your database
        // await updateUserSubscription(userId, plan, planCredits[plan]);

        res.json({
          success: true,
          message: 'Payment verified successfully',
          plan: plan,
          credits: planCredits[plan]
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Payment not completed'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      error: 'Payment verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//TODO:
// 1) ISSUE INVOICES TO CUSTOMERS
// https://razorpay.com/docs/api/payments/invoices/#issue-an-invoice/


export default router;
