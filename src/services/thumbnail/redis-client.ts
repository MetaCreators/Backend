import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

let regularClient: any = null;
let subscriberClient: any = null;

export async function getRedisClient() {
  if (!regularClient) {
    console.log("creating new regular redis client")
    regularClient = createClient({
      url: process.env.REDIS_URL
    });
    await regularClient.connect();
    console.log("new regular redis client created")
  }
  return regularClient;
}

export async function getRedisSubscriber() {
  if (!subscriberClient) {
    console.log("creating new subscriber redis client")
    subscriberClient = createClient({
      url: process.env.REDIS_URL
    });
    await subscriberClient.connect();
    console.log("new subscriber redis client created")
  }
  return subscriberClient;
}