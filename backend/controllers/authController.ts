import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";

export const signIn = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ data });
};

export const getMe = (req: Request, res: Response) => {
  return res.status(200).json({ data: { user: req.user } });
};
