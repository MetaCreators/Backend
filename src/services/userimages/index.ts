import * as aws from "aws-sdk";

const bucket = "lithouseuserimages";
const digiendpoint = new aws.Endpoint("blr1.digitaloceanspaces.com");
const s3Client = new aws.S3({
    endpoint: digiendpoint, // Find your endpoint in the control panel, under Settings. Prepend "https://".
    //forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    //region: "blr1", // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (for example, nyc3).
    accessKeyId: process.env.DIGIOCEAN_OBJECT_ACCESS_ID || "" , // Access key pair. You can create access key pairs using the control panel or API.
    secretAccessKey: process.env.DIGIOCEAN_OBJECT_SECRET || "" // Secret access key defined through an environment variable.
});




