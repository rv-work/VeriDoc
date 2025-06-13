import { prisma } from "../Utils/prisma.js";

export const UniversityRequest = async (req, res) => {

    try {
      const { universityName, type, website, registrationNumber, contactPerson, designation, phone, email, walletAddress } = req.body;

      if (!universityName || !type || !website || !registrationNumber || !contactPerson || !designation || !phone || !email || !walletAddress) {
        return res.status(400).json({ message: "All fields are required." });
      }

      const newUniversity = await prisma.university.create({
        data: {
          universityName,
          type,
          website,
          registrationNumber,
          contactPerson,
          designation,
          phone,
          email,
          walletAddress,
          isApproved: false, 
        },
      });

      return res.status(201).json({ success : true, message: "University request submitted successfully.", university: newUniversity });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred while submitting the university request." });
    }
  
};


export const CheckStatus = async (req, res) => {

    try {
      console.log("inside")
      const { walletAddress } = req.body;


      const university = await prisma.university.findUnique({ where: { walletAddress } });
      if (!university) {
        return res.status(404).json({ status: "University not found" });
      }
     
      console.log("status : " , university.isApproved)
      
      return res.status(201).json({ success : true, status: university.isApproved });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred while submitting the university request." });
    }
  
};



