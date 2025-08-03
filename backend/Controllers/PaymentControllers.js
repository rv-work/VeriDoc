import Stripe from 'stripe';
import { prisma } from '../Utils/prisma.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const CreateOrder = async (req, res) => {
  try {
    const {
      planName,
      amount,
      successUrl,
      cancelUrl
    } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `VeriDoc ${planName} Plan`,
              description: `One-time payment for ${planName} plan`,
            },
            unit_amount: amount * 100, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&planName=${planName}`,
      cancel_url: `${cancelUrl}?status=cancelled`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), 
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
export const VerifySession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Session ID is required' 
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }


      res.json({
      success: true,
      paymentStatus: session.payment_status,
      sessionStatus: session.status,
      planName: session.metadata?.planName,
      amount: session.metadata?.amount,
      customerEmail: session.customer_details?.email,
      paymentIntentId: session.payment_intent,
    });

    

  } catch (error) {
    console.error('Error verifying payment session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify payment session' 
    });
  }
};


export const ConfirmPayment = async (req, res) => {
  const { sessionId, planName } = req.body;

  const userId = req.user.id;


  const session = await stripe.checkout.sessions.retrieve(sessionId);


  if (session.payment_status === 'paid') {

    console.log("Confirmed payment for session", session.id);
    console.log("plan name : " , planName)

    if (planName === "basic") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscription: planName,
          expiryDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months
        }
      });
    } else if (planName === "premium") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscription: planName,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        }
      });
    } else if (planName === "enterprise") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscription: planName,
          expiryDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years
        }
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

   console.log("user after cnf : " , user)

    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({ success: false, error: 'Payment not successful' });
  }
};





export const VerifyPayment = async (req, res) => {
   
  if(req.user.subscription === "free") {
    return res.status(403).json({ success : false, error: 'Payment required for this action' });
  } else {
    res.status(400).json({success : true, message: "Payment verified successfully" });
  }
};