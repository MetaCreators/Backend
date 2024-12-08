import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      res.status(401).json({ message: "Invalid authentication token" });
      return;
    }

    // Add user to request headers
    req.headers["userId"] = user.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
    return;
  }
};
