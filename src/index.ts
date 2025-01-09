import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { generateImage } from "./services/thumbnail";
import apiRoutes from "./routes/apiRoutes";
import { authMiddleware } from "./middleware/auth";
import { supabase } from "./lib/supabase";
import { createClient } from "redis";

const client = createClient();    

try {
    client.connect();
    console.log("connected to redis");
} catch (error) {
    console.log("error connecting to redis",error)
}


const app: Application = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.use("/api", apiRoutes);

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

app.post("/api/imagefinetune",async (req, res) => {
  const { userid } = req.body;
  
  try {
    await client.lPush("training", JSON.stringify({ userid: userid }));
    res.json({message:`training received for userid ${userid}`}) 
  } catch (error) {
    res.json({
      message:"training input failed",
      error:error
    })
  }
    
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
