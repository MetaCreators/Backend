import { db } from "../db";
import { UserTable } from "../schema";
import "dotenv/config"
async function main() {
    await db.insert(UserTable).values({
        name: "yash",
        email: "yash@gmail.com"
    })

    const user = await db.query.UserTable.findFirst()
    console.log(user)
}
main()
