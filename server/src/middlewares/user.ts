import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { NextFunction, Request, Response } from "express";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. 요청 쿠키에 담겨 있는 토큰 정보 가져오기
    const token = req.cookies.token;
    console.log('token:', token);
    if (!token) return next();

    // 2. verify method 와 jwt secret 을 이용해 토큰 Decoded
    const { email }: any = jwt.verify(token, process.env.JWT_SECRET);

    // 3. 토큰에서 나온 email 을 이용해 유저 정보 DB 에서 가져오기
    const user = await User.findOneBy({ email });
    if (!user) throw new Error("Unautenticated");
    console.log('user:', user);
    
    // 3. 유저 정보를 res.local.user 에 넣어준다.
    res.locals.user = user;
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: "something went wrong " });
  }
};
