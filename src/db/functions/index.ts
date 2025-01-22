import { eq } from "drizzle-orm";
import { db } from "../db";
import { trainingImages, UserTable } from "../schema";
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
createNewUser("yash9","yash9@gmail.com")

//get all users:
async function getAllUsers() {
    const users = await db.select().from(UserTable);
    console.log(users);
    return users;
}
//getAllUsers()


// store user sent training images to cloud (get cloud url)
async function createNewTrainingImage(userId:string) {
    const response = await db.insert(trainingImages).values({
        status: "pending",
        userId: userId,
    }).returning({
        id:trainingImages.id
    })
    console.log(response);
    return response
}
//createNewTrainingImage("c4396bd2-854b-4400-a7d9-72921c57e395")

//update training status upon completion
async function updateTrainingStatus(status:"pending" | "success" | "failed") {
    const response = await db.update(trainingImages).set({
        status:status
    }).returning({
        id:trainingImages.id
    })
    return response
}

//get all training data
async function getAllTrainingData() {
    const trainings = await db.select().from(trainingImages);
    console.log(trainings);
    return trainings;
}
//getAllTrainingData()

//store user's new model on training complete
async function createNewUserModel() {
    
}

// get user models
async function getUserModels() {
    
}

//store user's new generated Image
async function storeGeneratedImage() {
    
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