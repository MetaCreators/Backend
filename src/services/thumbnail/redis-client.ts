import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

let client:any = null;

export async function getRedisClient() {
    if (!client) {
      console.log("creating new redis client")
      client = createClient({
        url: process.env.REDIS_URL
      });
      await client.connect();
      console.log("new redis client created")
    }
  return client;
}