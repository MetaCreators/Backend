import { eq } from "drizzle-orm";
import { db } from "../db";
import { trainingImages, UserTable } from "../schema";
import "dotenv/config"
async function InsertUser() {
    //insert a value in some table:
    await db.insert(UserTable).values({
        name: "yash",
        email: "yash@gmail.com"
    })

    const user = await db.query.UserTable.findFirst()
    console.log(user)
}
//InsertUser()

async function InsertTrainingImage() {
    await db.insert(trainingImages).values({
        status: "success",
        userId: "35c81749-b2aa-4a50-a55f-f86f3cb2c64e",
    })
}
//InsertTrainingImage()

async function DeleteTable() {
    //delete complete table :
    await db.delete(UserTable);
}
//DeleteTable();

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

async function updateUserName() {
    const user = await db.update(UserTable).set({
        name:"newName"
    }).where(eq(UserTable.name, "yash"))
    
    const allusers = await db.select().from(UserTable)
    console.log(allusers)
}
updateUserName()

//db functions to add:

// create new user upon signup
// add credits to user when he pays
// deduct credit when he generates image
// store user sent training images to cloud (get cloud url)
// store generated image (both replicate and cloud url)
// get user credits
// get user images
// get user models
//add user model
