import { prisma } from "../Utils/prisma.js";




export const ApproveRequest = async (req, res) => {
  try {
    console.log("inside approve");
    
    const { universityId } = req.body;

    const university = await prisma.university.findUnique({ where: { id : universityId } });
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }


      await prisma.university.update({
      where: { id : universityId },
      data: {
        isApproved: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "University request accepted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while approving the university request.",
    });
  }
};



export const FetchRequests = async (req, res) => {
  try {
    const universities = await prisma.university.findMany({
      where: {
        isApproved: false, 
      },
    });

    return res.status(200).json({
      success: true,
      message: "University requests fetched successfully.",
      universities,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while fetching university requests.",
    });
  }
};



export const FetchAll = async (req, res) => {
  try {
    console.log("in all")
    const universities = await prisma.university.findMany({
      where : {isApproved : true}
    });

    console.log("all : " , universities)

    return res.status(200).json({
      success: true,
      message: "University requests fetched successfully.",
      universities,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while fetching university requests.",
    });
  }
};


export const RemoveUniversitiy = async (req, res) => {
  try {
    const { universityId } = req.body;
    console.log("inside remove")

    const university = await prisma.university.findUnique({ where: { id : universityId } });
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }


      await prisma.university.update({
      where: { id : universityId },
      data: {
        isApproved: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: "University removed successfully.",
      university,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while removing university .",
    });
  }
};



