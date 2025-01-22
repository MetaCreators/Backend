import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { generatedImages, models, trainingImages, UserTable } from "../schema";
import "dotenv/config"

// create new user upon signup => example usage: createNewUser("yash9","yash9@gmail.com")
async function createNewUser(name:string,email:string) {
    const newUser = await db.insert(UserTable).values({
        name: name,
        email: email
    }).returning({
      id:UserTable.id  
    })
    console.log(newUser)
    //await getAllUsers()
    //await getAllTrainingData()
}

//get all users => example usage: getAllUsers()
async function getAllUsers() {
    const users = await db.select().from(UserTable);
    console.log(users);
    return users;
}

// store user sent training images to cloud (get cloud url and then store it in db) =>
//example usage: storeUserTrainingImage("4c5adfad-5a24-4de4-ae1c-046f13559ab4", "aws.com/random", "success");
async function storeUserTrainingImage(userId:string,cloudUrl:string,status:"pending" | "success" | "failed") {
    const response = await db.insert(trainingImages).values({
        status: status,//indicates whether saving to cloud was successful or not
        userId: userId,
        cloudUrl:cloudUrl
    }).returning({
        id:trainingImages.id
    })
    console.log(response);
    return response
}

//example usage: getAllUserStoredImageData()
async function getAllUserStoredImageData() {
    const images = await db.select().from(trainingImages);
    console.log(images);
    return images;
}

//store user's new model on training complete => createNewUserModel("4c5adfad-5a24-4de4-ae1c-046f13559ab4", "success");
async function createNewUserModel(userId:string,status:"pending" | "success" | "failed") {
    // yaha model ayega
     const response = await db.insert(models).values({
        status: status,//indicates whether saving to cloud was successful or not
        userId: userId,
    }).returning({
        id:models.id
    })
    console.log(response);
    return response
}

//update training status upon completion => example usage: updateModelTrainingStatus("failed","0f513bf9-7e63-4ea2-9314-f88621756ed5")
async function updateModelTrainingStatus(status:"pending" | "success" | "failed", modelId:string) {
    const response = await db.update(models).set({
        status:status
    }).where(eq(models.id,modelId)).returning({
        id:models.id
    })
    console.log(response);
    return response
}

//get all training data => example usage: getAllModelsData()
async function getAllModelsData() {
    const allModels = await db.select().from(models);
    console.log(allModels);
    return allModels;
}

//get a User's Models => example usage: getUserModels("4c5adfad-5a24-4de4-ae1c-046f13559ab4")
async function getUserModels(userId:string) {
    const allModels = await db.select().from(models).where(eq(models.userId,userId));
    console.log(allModels);
    return allModels;
}

//store user's new generated Image => example usage: storeGeneratedImage("aws/storage","replicateURL","0f513bf9-7e63-4ea2-9314-f88621756ed5","replicateImgId","4c5adfad-5a24-4de4-ae1c-046f13559ab4","some random prompt","success",5)
async function storeGeneratedImage(cloudUrl:string,replicateUrl:string,modelId:string,replicateImageId:string,userId:string,prompt:string,status:"pending" | "success" | "failed",creditsUsed:number) {
    const response = await db.insert(generatedImages).values({
        status: status,//indicates whether saving to cloud was successful or not
        userId: userId,
        cloudUrl: cloudUrl,
        replicateUrl,
        modelId,
        replicateImageId,
        prompt,
        creditsUsed
    }).returning({
        id:trainingImages.id
    })
    console.log(response);
    return response
}
// get user images => example usage: getUserGeneratedImages("4c5adfad-5a24-4de4-ae1c-046f13559ab4","0f513bf9-7e63-4ea2-9314-f88621756ed5")
async function getUserGeneratedImages(userId:string,modelId:string) {
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
async function addUserCredits() {
    
}

// deduct credit when he generates image
async function deductUserCredits() {
    
}

// get user credits
async function getUserCredits() {
    
}

//EXTRA FUNCTIONS:

//update username/details
async function updateUserName(email:string,newName:string) {
    const user = await db.update(UserTable).set({
        name:newName
    }).where(eq(UserTable.email, email))
    const allusers = await db.select().from(UserTable)
    console.log(allusers)
}
//updateUserName()

async function DeleteTable() {
    //delete complete table :
    await db.delete(UserTable);
}
//DeleteTable();