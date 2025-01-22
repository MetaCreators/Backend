import { eq } from "drizzle-orm";
import { db } from "../db";
import { generatedImages, models, trainingImages, UserTable } from "../schema";
import "dotenv/config"

// create new user upon signup
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
//createNewUser("yash9","yash9@gmail.com")

//get all users:
async function getAllUsers() {
    const users = await db.select().from(UserTable);
    console.log(users);
    return users;
}
//getAllUsers()


// store user sent training images to cloud (get cloud url and then store it in db)
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
//storeUserTrainingImage("c4396bd2-854b-4400-a7d9-72921c57e395")
async function getAllUserStoredImageData() {
    const images = await db.select().from(trainingImages);
    console.log(images);
    return images;
}

//store user's new model on training complete
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
createNewUserModel("c4396bd2-854b-4400-a7d9-72921c57e395", "success");
//update training status upon completion
async function updateModelTrainingStatus(status:"pending" | "success" | "failed",modelId:string) {
    const response = await db.update(models).set({
        status:status
    }).where(eq(models.id,modelId)).returning({
        id:models.id
    })
    console.log(response);
    return response
}
//updateTrainingStatus("success","dbce8b99-0cc7-4746-b140-1ea8576e5083")
//get all training data

async function getAllModelsData() {
    const allModels = await db.select().from(models);
    console.log(allModels);
    return allModels;
}
getAllModelsData()

//store user's new generated Image
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
// get user images
async function getUserImages() {
    const user = await db.query.UserTable.findMany({
        columns: { email: true,id:true },
        with: {
            trainingImages: {
                columns: {
                    cloudUrl: true,
                    createdAt:true
            }
        }}
    })
    console.log(user);
}
//getUserImages()

// add credits to user when he pays
async function addUserCredits() {
    
}

// deduct credit when he generates image
async function deductUserCredits() {
    
}

// store generated image (both replicate and cloud url)

// get user credits
async function getUserCredits() {
    
}

//EXTRA FUNCTIONS:

//update username/details
async function updateUserName() {
    const user = await db.update(UserTable).set({
        name:"newName"
    }).where(eq(UserTable.name, "yash"))
    
    const allusers = await db.select().from(UserTable)
    console.log(allusers)
}
//updateUserName()

async function DeleteTable() {
    //delete complete table :
    await db.delete(UserTable);
}
//DeleteTable();