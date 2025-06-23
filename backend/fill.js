import { prisma } from "./Utils/prisma.js";

async function main() {
  // Step 1: Fetch the single user
  const user = await prisma.user.findFirst({
    where : {
      walletAddress : "0x2546BcD3c84621e976D8185a91A922aE77ECEc30"
    }
  });

  if (!user) {
    console.error("No user found.");
    return;
  }

  await prisma.user.update({
    where : {
      walletAddress : "0x2546BcD3c84621e976D8185a91A922aE77ECEc30"
    },
    data : {
      subscription : "free",
      balance : 0
      
    }
  })

  // const university = await prisma.university.findFirst();
  // if (!university) {
  //   console.error("No university found.");
  //   return;
  // }

  // // Step 3: Update university to link to the user
  // const updatedUniversity = await prisma.university.update({
  //   where: { id: university.id },
  //   data: {
  //     addedById: user.id
  //   }
  // });


  // // Step 3: Update university to link to the user
  // await prisma.university.update({
  //   where: { id: university.id },
  //   data: {
  //     addedById: user.id
  //   }
  // });
  console.log("done")

  // console.log(`✅ University '${updatedUniversity.universityName}' is now linked to user '${user.name}'`);
}

main()
  .catch((e) => console.error("❌ Error during backfill:", e))
  .finally(() => prisma.$disconnect());
