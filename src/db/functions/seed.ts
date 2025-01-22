import { db } from "../db";
import { UserTable } from "../schema";
import "dotenv/config"
async function DbInsert() {
    //insert a value in some table:
    const user = await db.insert(UserTable).values([{
        name: "yash",
        email: "yash@gmail.com",
    }, {
        name: "yash1",
        email: "yash1@gmail.com",
    }, {
        name: "yash2",
        email: "yash2@gmail.com",
    }]).returning({
        id: UserTable.id
    })

    //const user = await db.query.UserTable.findFirst()
    console.log(user)
}

DbInsert();
