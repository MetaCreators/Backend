import * as aws from "aws-sdk";
require("dotenv").config();
const bucket = "lithouseuserimages";
const digiendpoint = new aws.Endpoint("blr1.digitaloceanspaces.com");
const s3Client = new aws.S3({
    endpoint: digiendpoint, 
    accessKeyId: process.env.DIGIOCEAN_OBJECT_ACCESS_ID || "" ,
    secretAccessKey: process.env.DIGIOCEAN_OBJECT_SECRET || "" 
});

async function listAllObjects() {
  try {
    const response = await s3Client.listObjects({Bucket:bucket}).promise();
    console.log("obejcts:", response);
  } catch (error) {
    console.error("Error listing objects:", error);
  }
}

listAllObjects();
