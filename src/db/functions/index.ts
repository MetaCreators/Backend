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
}
createNewUser("yash7","yash7@gmail.com")

//get all users:
async function getAllUsers() {
    const users = await db.select().from(UserTable);
    console.log(users);
    return users;
}
//getAllUsers()


// store user sent training images to cloud (get cloud url)
async function createNewTrainingImage() {
    await db.insert(trainingImages).values({
        status: "success",
        userId: "35c81749-b2aa-4a50-a55f-f86f3cb2c64e",
    })
}
//InsertTrainingImage()

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