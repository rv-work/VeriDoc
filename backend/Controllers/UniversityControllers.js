import { prisma } from "../Utils/prisma.js";

export const UniversityRequest = async (req, res) => {

    try {
      const { universityName, type, website, registrationNumber, contactPerson, designation, phone, email, walletAddress } = req.body;

      if (!universityName || !type || !website || !registrationNumber || !contactPerson || !designation || !phone || !email || !walletAddress) {
        return res.status(400).json({ message: "All fields are required." });
      }

      const user = req.user;

      const uni = await prisma.university.findUnique({
        where: { walletAddress },
      })

      if(uni) {
        return res.status(400).json({ success : false  , msg: "University with this wallet address already exists. check Status" });
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
          addedBy: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      

      return res.status(201).json({ success : true, message: "University request submitted successfully.", university: newUniversity });
    } catch (error) {
      return res.status(500).json({ message: "An error occurred while submitting the university request." });
    }
  
};


export const CheckStatus = async (req, res) => {

    try {
      const { walletAddress } = req.body;

      const university = await prisma.university.findUnique({ where: { walletAddress } });
      if (!university) {
        return res.status(200).json({ success : false, msg: "University not found" });
      }
     
      
      return res.status(201).json({ success : true, status: university.isApproved });
    } catch (error) {
      return res.status(500).json({ message: "An error occurred while submitting the university request." });
    }
  
};

export const GetDetails = async (req, res) => {
  try {
    const user = req.user;

    if (!user?.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const universities = await prisma.university.findMany({  
      where: {
        addedById: user.id
      }
    });

    return res.status(200).json({ success: true, user, universities });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Something went wrong" });
  }
};




