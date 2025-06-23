import express from "express"
import { CreateOrder, ConfirmPayment, VerifyPayment, UseMoney  } from "../Controllers/PaymentControllers.js";
import { verifyToken } from "../Middleware/Verify.js";

const paymentRouter = express.Router();


paymentRouter.post("/create-order"  ,verifyToken ,  CreateOrder)
paymentRouter.post("/confirm-payment"  ,verifyToken ,  ConfirmPayment)
paymentRouter.get("/check-premium"  ,verifyToken ,  VerifyPayment)
paymentRouter.get("/use-money"  ,verifyToken ,  UseMoney)

export {
  paymentRouter
}