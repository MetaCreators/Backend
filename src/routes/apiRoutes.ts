import { Router } from "express";
//import { generateImage } from "../services/thumbnail";
import { generateScript } from "../services/script";
import { generateDescription } from "../services/description";
import { authMiddleware } from "../middleware/auth";
import { finetune } from "../services/thumbnail/finetune";
import { genpersonimage } from "../services/thumbnail/genpersonimage";

const router = Router();

//router.post("/thumbnail", generateImage);

router.post("/script", authMiddleware, generateScript);

router.post("/description", authMiddleware, generateDescription);

//router.post("/imagefinetune", authMiddleware, finetune);
//TODO: Add middleware after testing
//router.post("/imagefinetune" ,finetune);

router.post("/genpersonimage", authMiddleware, genpersonimage);

export default router;
