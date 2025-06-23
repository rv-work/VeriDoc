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
            unit_amount: amount * 1000, 
          },
          quantity: 1,
        },
       
        
      ],
      mode:  'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&planName=${planName}`,
      cancel_url: cancelUrl,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

export const ConfirmPayment = async (req, res) => {

  const { sessionId , planName  , purpose} = req.body;
  const userId = req.user.id;

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === 'paid') {

    console.log("Confirmed payment for session", session.id);


    if(purpose === "subscription") {
       await prisma.user.update({
         where: { id: userId },
         data: {
           subscription:planName, 
           expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) 
         }
       });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: 250 * 100
          }
        }
      });
    }


    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({ success: false ,  error: 'Payment not successful' });
  }
};




export const VerifyPayment = async (req, res) => {
   
  if(req.user.subscription === "free") {
    return res.status(403).json({ success : false, error: 'Payment required for this action' });
  } else {
    res.status(400).json({success : true, message: "Payment verified successfully" });
  }
};



export const UseMoney = async (req, res) => {
  try {
    const user = req.user;
    console.log("called")
    
    console.log("balance : " , user)


    if (!user || typeof user.balance !== 'number') {
      return res.status(400).json({ success: false, error: 'Invalid user data' });
    }

    console.log("balance : " , user)

    if (user.balance < 100) {
      return res.status(200).json({ success: false, error: 'Insufficient balance' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: {
          decrement: 250 * 100,
        },
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("UseMoney Error:", error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};




