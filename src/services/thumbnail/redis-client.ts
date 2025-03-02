import { createClient } from "redis";

let client:any = null;

export async function getRedisClient() {
    if (!client) {
      console.log("new redis client created")
      client = createClient({
        url: process.env.REDIS_URL
      });
      await client.connect();
    }
  return client;
}