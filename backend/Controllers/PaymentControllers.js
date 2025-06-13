



import  Stripe from 'stripe';
const  stripe = Stripe('sk_test_...'); 
import { prisma } from '../Utils/prisma.js';

app.use(express.json());


export const CreateOrder = async (req , res) => {

  const {planName } = req.body;
  
  const user = req.user ;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'upi', 'paytm' , 'gpay'], 
    line_items: [{
      price_data: {
        currency: 'inr',
        product_data: {
          name: 'T-Shirt',
        },
        unit_amount: 50000, 
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: 'http://localhost:3000/payment/success',
    cancel_url: 'http://localhost:3000/payment/cancel',
  });

  if( session.url === "http://localhost:3000/payment/success"){
     await prisma.user.update({
      where : { id: user.id },
      data : {
        subscription : planName
      }
     })
  }

  res.json({ url: session.url });
};





// import  Razorpay from 'razorpay';
// import  crypto  from 'crypto';


// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID, 
//   key_secret: process.env.RAZORPAY_KEY_SECRET, 
// });


// export const CreateOrder = async (req , res) => {
//     try {
//     const { amount, currency, planType, planName } = req.body;

//     if (!amount || !currency || !planType || !planName) {
//       return res.status(400).json({
//         error: 'Missing required fields: amount, currency, planType, planName'
//       });
//     }

//     const options = {
//       amount: amount, 
//       currency: currency,
//       receipt: `receipt_${Date.now()}`,
//       notes: {
//         planType: planType,
//         planName: planName,
//         createdAt: new Date().toISOString()
//       }
//     };

//     // Create order
//     const order = await razorpay.orders.create(options);

//     // You can save order details to database here
//     console.log('Order created:', order);

//     res.status(200).json({
//       success: true,
//       order: order,
//       id: order.id,
//       amount: order.amount,
//       currency: order.currency
//     });

//   } catch (error) {
//     console.error('Error creating order:', error);
//     res.status(500).json({
//       error: 'Failed to create order',
//       details: error.message
//     });
//   }
// }

// export const VerifyPayment = async (req , res) => {
//   try {
//     const { 
//       razorpay_order_id, 
//       razorpay_payment_id, 
//       razorpay_signature 
//     } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest('hex');

//     const isAuthentic = expectedSignature === razorpay_signature;

//     if (isAuthentic) {
//       console.log('Payment verified successfully');
      
//       const payment = await razorpay.payments.fetch(razorpay_payment_id);
//       const order = await razorpay.orders.fetch(razorpay_order_id);

//       const paymentData = {
//         orderId: razorpay_order_id,
//         paymentId: razorpay_payment_id,
//         signature: razorpay_signature,
//         amount: payment.amount / 100, 
//         currency: payment.currency,
//         status: payment.status,
//         method: payment.method,
//         planType: order.notes.planType,
//         planName: order.notes.planName,
//         createdAt: new Date(),
//         verified: true
//       };

//       // TODO: Save paymentData to your database
//       console.log('Payment data to save:', paymentData);

//       // TODO: Activate user plan/subscription
//       // await activateUserPlan(userId, planType, planName);

//       res.status(200).json({
//         success: true,
//         message: 'Payment verified successfully',
//         paymentData: paymentData
//       });

//     } else {
//       res.status(400).json({
//         success: false,
//         message: 'Payment verification failed'
//       });
//     }

//   } catch (error) {
//     console.error('Error verifying payment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Payment verification failed',
//       error: error.message
//     });
//   }
// }


// export const GetPaymentStatus = async (req , res) => {
//   try {
//     const { paymentId } = req.params;

//     const payment = await razorpay.payments.fetch(paymentId);

//     if (!payment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Payment not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       payment: payment
//     });

//   } catch (error) {
//     console.error('Error fetching payment status:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch payment status',
//       error: error.message
//     });
//   }
// }

// export const WebhookHandler = async (req, res) => {
//   try {
//     const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
//     const webhookSignature = req.get('X-Razorpay-Signature');
    
//     const expectedSignature = crypto
//       .createHmac('sha256', webhookSecret)
//       .update(JSON.stringify(req.body))
//       .digest('hex');

//     if (webhookSignature === expectedSignature) {
//       const event = req.body.event;
//       const paymentEntity = req.body.payload.payment.entity;
      
//       console.log('Webhook received:', event);
      
//       switch (event) {
//         case 'payment.captured':
//           console.log('Payment captured:', paymentEntity.id);
//           break;
          
//         case 'payment.failed':
//           console.log('Payment failed:', paymentEntity.id);
//           break;
          
//         default:
//           console.log('Unhandled webhook event:', event);
//       }
      
//       res.status(200).json({ success: true });
//     } else {
//       res.status(400).json({ error: 'Invalid signature' });
//     }
    
//   } catch (error) {
//     console.error('Webhook error:', error);
//     res.status(500).json({ error: 'Webhook processing failed' });
//   }
// }

// export const RefundPayment = async (req , res) => {
//  try {
//     const { paymentId, amount, reason } = req.body;
    
//     const refund = await razorpay.payments.refund(paymentId, {
//       amount: amount * 100, 
//       notes: {
//         reason: reason,
//         refundedAt: new Date().toISOString()
//       }
//     });
    
//     res.status(200).json({
//       success: true,
//       refund: refund
//     });
    
//   } catch (error) {
//     console.error('Refund error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// }

