import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { generateImage } from "./services/thumbnail";
import apiRoutes from "./routes/apiRoutes";
import { authMiddleware } from "./middleware/auth";
import { supabase } from "./lib/supabase";
import { createClient } from "redis";
import * as aws from "aws-sdk";

const client = createClient({
    url: process.env.REDIS_URL
});    

try {
    client.connect();
    console.log("connected to redis");
} catch (error) {
    console.log("error connecting to redis",error)
}


const app: Application = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: function (origin:any, callback:any) {
    const allowedOrigins = [
      'https://lithouse.in',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

const bucket = "lithouseuserimages";
const digiendpoint = new aws.Endpoint("blr1.digitaloceanspaces.com");
const s3Client = new aws.S3({
    endpoint: digiendpoint,
    accessKeyId: process.env.DIGIOCEAN_OBJECT_ACCESS_ID || "" ,
    secretAccessKey: process.env.DIGIOCEAN_OBJECT_SECRET || "" 
});

//app.options('*', cors(corsOptions)); this is for production ?
app.use(cors(corsOptions));

app.use(express.json());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.use("/api", apiRoutes);

//TODO: PUT THIS IN PROPER ROUTE
app.post("/thumbnail", authMiddleware, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      res.status(401).json({ message: "No authentication token provided" });
      return;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res
        .status(401)
        .json({ success: false, message: "Invalid authentication token" });
      return;
    }

    const { userIdea, userStyle, targetAudience } = req.body;
    console.log(userIdea);
    if (!userIdea) {
      res.status(400).json({
        success: false,
        message: 'Please provide a search term in the "userIdea" field.',
      });
      return;
    }

    const result = await generateImage(userIdea, userStyle, targetAudience);
    const images = Array.isArray(result) ? result : [result];
    // TODO: AI logic here: Respond with 3 image URLs

    res.json({
      success: true,
      searchTerm: userIdea,
      images,
    });
  } catch (error) {
    console.error("Thumbnail generation error: ", error);
    res.status(500).json({
      success: false,
      message: "An error during thumbnail generation",
      error: error instanceof Error ? error.message : error,
    });
  }
});

//TODO:abstract out properly => put the code in respective folders


app.post("/upload", async (req, res) => {
  //TODO:
  //3) save the DO url in db => once we get the url from DO and replicate, just store it in db
  //4)if folder already exists, store the image in the same, else create new => instead of checking this on spaces, we can just query
  // the db => check if there's a folder for the user => if yes then save in it else create a new
  const imageUrl = req.body.imageUrl; 
  const key = `Image-${Date.now()}`;
 
  //here we get a url where we can upload our images
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const blob = Buffer.from(arrayBuffer);

    const s3Params = {
      Bucket: bucket,
      Key: key,
      ContentType: response.headers.get("content-type") || "image/jpeg"
    };

    const uploadUrl = await s3Client.getSignedUrlPromise("putObject", s3Params);
    console.log("presigned URl is ", uploadUrl);
    const uploading = await fetch(uploadUrl, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": s3Params.ContentType
      }
    });
    console.log(uploading);

    res.json({
      message: "Image uploaded successfully",
      url: uploadUrl,
      key
    });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
})

app.get('/download', async (req, res) => {
  const key = req.query.key;
  const s3Params = {
    Bucket: bucket,
    Key: key
  };
  const getURL = await s3Client.getSignedUrlPromise("getObject", s3Params);
  console.log("download url is", getURL);

  res.json({ url: getURL });
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
