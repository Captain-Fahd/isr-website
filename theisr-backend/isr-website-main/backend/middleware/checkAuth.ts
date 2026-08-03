import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";

export const checkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (user.app_metadata?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  req.user = user;
  next();
};
