import express from "express"
import { CreateOrder , VerifyPayment , RefundPayment , GetPaymentStatus } from "../Controllers/PaymentControllers";

const paymentRouter = express.Router();


paymentRouter.post("/create-order"  , CreateOrder)
paymentRouter.post("/verify-payment"  , VerifyPayment)
paymentRouter.get("/payment-status/:paymentId"  , GetPaymentStatus)
paymentRouter.post("/refund"  , RefundPayment)


export {
  paymentRouter
}