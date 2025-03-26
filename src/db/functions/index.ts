import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { generatedImages, models, trainingImages, UserTable, creditTransactions } from "../schema";
import "dotenv/config";

// create new user upon signup => example usage: createNewUser("yash9","yash9@gmail.com")

export async function createNewUser(name: string, email: string) {
  try {
    const existingUser = await db.select().from(UserTable).where(eq(UserTable.email, email));
    if (existingUser.length > 0) {
      throw new Error("User with this email already exists");
    }
    const newUser = await db.insert(UserTable).values({
      name: name,
      email: email
    }).returning({
      id: UserTable.id
    });
    console.log(newUser);
    return newUser;
  } catch (error) {
    console.error("Error creating new user:", error);
    throw error;
  }
}

//get all users => example usage: getAllUsers()
async function getAllUsers() {
  const users = await db.select().from(UserTable);
  console.log(users);
  return users;
}

export async function checkUserExists(email: string) {
  const user = await db.select().from(UserTable).where(eq(UserTable.email, email));
  return user.length > 0;
}

// store user sent training images to cloud (get cloud url and then store it in db) =>
//example usage: storeUserTrainingImage("4c5adfad-5a24-4de4-ae1c-046f13559ab4", "aws.com/random", "success");
async function storeUserTrainingImage(
  userId: string,
  cloudUrl: string,
  status: "pending" | "success" | "failed"
) {
  const response = await db
    .insert(trainingImages)
    .values({
      status: status, //indicates whether saving to cloud was successful or not
      userId: userId,
      cloudUrl: cloudUrl,
    })
    .returning({
      id: trainingImages.id,
    });
  console.log(response);
  return response;
}

//example usage: getAllUserStoredImageData()
async function getAllUserStoredImageData() {
  const images = await db.select().from(trainingImages);
  console.log(images);
  return images;
}

//store user's new model on training complete => createNewUserModel("4c5adfad-5a24-4de4-ae1c-046f13559ab4", "success");
export async function createNewUserModel(
  userId: string,
  status: "canceled" | "processing" | "failed" | "starting" | "succeeded"
) {
  // yaha model ayega
  const response = await db
    .insert(models)
    .values({
      status: status, //indicates whether saving to cloud was successful or not
      userId: userId,
    })
    .returning({
      id: models.id,
    });
  console.log(response);
  return response;
}

//update training status upon completion => example usage: updateModelTrainingStatus("failed","0f513bf9-7e63-4ea2-9314-f88621756ed5")
// status values can be "canceled" || "processing" || "failed" || "starting" || "succeeded" => need to change this in the db
export async function updateModelTrainingStatus(
  status: "canceled" | "processing" | "failed" | "starting" | "succeeded",
  modelId: string
) {
  const response = await db
    .update(models)
    .set({
      status: status,
    })
    .where(eq(models.id, modelId))
    .returning({
      id: models.id,
    });
  console.log(response);
  return response;
}

//get all training data => example usage: getAllModelsData()
async function getAllModelsData() {
  const allModels = await db.select().from(models);
  console.log(allModels);
  return allModels;
}

//get a User's Models => example usage: getUserModels("4c5adfad-5a24-4de4-ae1c-046f13559ab4")
async function getUserModels(userId: string) {
  const allModels = await db
    .select()
    .from(models)
    .where(eq(models.userId, userId));
  console.log(allModels);
  return allModels;
}

//store user's new generated Image => example usage: storeGeneratedImage("aws/storage","replicateURL","0f513bf9-7e63-4ea2-9314-f88621756ed5","replicateImgId","4c5adfad-5a24-4de4-ae1c-046f13559ab4","some random prompt","success",5)
export async function storeGeneratedImage(
  cloudUrl: string,
  replicateUrl: string,
  modelId: string,
  replicateImageId: string,
  userId: string,
  prompt: string,
  status: "pending" | "success" | "failed",
  creditsUsed: number
) {
  const response = await db
    .insert(generatedImages)
    .values({
      status: status, //indicates whether saving to cloud was successful or not
      userId: userId,
      cloudUrl: cloudUrl,
      replicateUrl,
      modelId,
      replicateImageId,
      prompt,
      creditsUsed,
    })
    .returning({
      id: trainingImages.id,
    });
  console.log(response);
  return response;
}
// get user images => example usage: getUserGeneratedImages("4c5adfad-5a24-4de4-ae1c-046f13559ab4","0f513bf9-7e63-4ea2-9314-f88621756ed5")

export async function getUserGeneratedImages(userId: string, modelId: string) {
  const user = await db.query.generatedImages.findMany({
    columns: { cloudUrl: true, id: true },
    where: and(
      eq(generatedImages.userId, userId),
      eq(generatedImages.modelId, modelId)
    )
  })
  console.log(user);
  return user;
}

// add credits to user when he pays
export async function addUserCredits(userId: string, creditAmount: number) {
  if (!userId || !creditAmount) {
    throw new Error("userId and creditAmount are required");
  }

  // First check if user exists
  const user = await db.select().from(UserTable).where(eq(UserTable.id, userId));
  if (user.length === 0) {
    throw new Error("User not found");
  }

  const currentCredits = user[0].availableCreds;

  // Update credits
  await db.update(UserTable)
    .set({
      availableCreds: currentCredits + creditAmount,
      updatedAt: new Date()
    })
    .where(eq(UserTable.id, userId));

  // Add transaction record
  await db.insert(creditTransactions).values({
    userId: userId,
    changeAmount: creditAmount,
    reason: "topup"
  });

  return currentCredits + creditAmount;
}

// deduct credit when he generates image
export async function deductUserCredits(userId: string, deduction: number) {
  const userCredits = await getUserCredits(userId);
  //handle insufficient credits case here
  if (!userCredits) {
    return null;
  }
  await db
    .update(UserTable)
    .set({
      availableCreds: userCredits - deduction,
    })
    .where(eq(UserTable.id, userId));

  console.log(getUserCredits(userId));
}

//Example usage: deductUserCredits("01f90e3d-171d-4313-8985-f25ccd5cd915", 10);

// get user credits
async function getUserCredits(userId: string) {
  const user = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.id, userId));
  console.log(user);
  return user.length > 0 ? user[0].availableCreds : null;
}

//EXTRA FUNCTIONS:

//update username/details
async function updateUserName(email: string, newName: string) {
  const user = await db
    .update(UserTable)
    .set({
      name: newName,
    })
    .where(eq(UserTable.email, email));
  const allusers = await db.select().from(UserTable);
  console.log(allusers);
}
//updateUserName()

async function DeleteTable() {
  //delete complete table :
  await db.delete(UserTable);
}
//DeleteTable();
