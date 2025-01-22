import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import {migrate} from "drizzle-orm/postgres-js/migrator"
import postgres from 'postgres'

const migrationClient = postgres(process.env.DATABASE_URL as string, { max: 1 });
async function main() {
    await migrate(drizzle(migrationClient), {
        migrationsFolder: "./src/db/migrations"
    })
    await migrationClient.end();
}

main()

//automatic trigger function for updating the updated_at field:

// import { sql } from "drizzle-orm";
// await db.execute(sql`
//     CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
//     BEGIN
//         NEW.updated_at = CURRENT_TIMESTAMP;
//         RETURN NEW;
//     END;
//     $$ LANGUAGE plpgsql;

//     CREATE TRIGGER set_updated_at
//     BEFORE UPDATE ON models
//     FOR EACH ROW
//     EXECUTE FUNCTION update_updated_at_column();
// `);

