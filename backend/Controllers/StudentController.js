import { prisma } from "../Utils/prisma.js";

export const ViewIssuer = async (req, res) => {

    try {
      const { add } = req.body;


      const university = await prisma.university.findUnique({ where: { walletAddress  : add} });
      if (!university) {
        return res.status(404).json({ status: "University not found" });
      }
     
      
      return res.status(201).json({ success : true, university });
    } catch (error) {
      return res.status(500).json({ message: "An error occurred while submitting the university request." });
    }
  
};