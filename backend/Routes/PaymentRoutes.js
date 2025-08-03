import express from "express"
import { CreateOrder,  VerifyPayment, VerifySession,  ConfirmPayment } from "../Controllers/PaymentControllers.js";
import { verifyToken } from "../Middleware/Verify.js";

const paymentRouter = express.Router();


paymentRouter.post("/create-order"  ,verifyToken ,  CreateOrder)
paymentRouter.post("/verify-session"  ,verifyToken ,  VerifySession)
paymentRouter.post("/confirm-payment"  ,verifyToken ,  ConfirmPayment)
paymentRouter.get("/check-premium"  ,verifyToken ,  VerifyPayment)


export {
  paymentRouter
}