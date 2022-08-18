import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { NextFunction, Request, Response } from "express";

export default async (_: Request, res: Response, next: NextFunction) => {
  try {
    // 1. 유저 정보 가져오기
    const user: User | undefined = res.locals.user;

    if (!user) throw new Error("Unautenticated");

    return next();


  } catch (e) {
    console.log(e);
    return res.status(401).json({ error: "Unautenticated" });
  }
};
