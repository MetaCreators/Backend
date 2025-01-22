import { db } from "../db";
import { UserTable } from "../schema";
import "dotenv/config"
async function DbInsert() {
    //insert a value in some table:
    await db.insert(UserTable).values({
        name: "yash",
        email: "yash@gmail.com"
    })

    const user = await db.query.UserTable.findFirst()
    console.log(user)
}
//DbInsert()


async function DbDelete() {
    //delete complete table :
    await db.delete(UserTable);
}

DbDelete();