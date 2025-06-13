import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from 'cookie-parser';
import authRouter from "./Routes/AuthRoutes.js";
import universityRouter from "./Routes/UniversityRoutes.js";
import adminRouter from "./Routes/AdminRoutes.js";
import studentRouter from "./Routes/StudentRouter.js";
import { paymentRouter } from "./Routes/PaymentRoutes.js";



dotenv.config()

const app = express();

app.use(express.json())
app.use(cookieParser());


app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true
}));


app.use("/api/auth" , authRouter)
app.use("/api/university" , universityRouter)
app.use("/api/admin" , adminRouter)
app.use("/api/student" , studentRouter)
app.use("/api/payment" , paymentRouter)




app.get("/" , (req , res) => {
  res.send("Hii From Backend")
})

app.listen(5000 , () => {
  console.log(`Server is ruunning successfully at  : http://localhost:5000`)
})