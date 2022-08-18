import { isEmpty, validate } from "class-validator";
import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    let errors: any = {};
    
    // 1. 이메일, 유저이름이 입력되었는지 확인.
    if (isEmpty(email)) errors.email = '이메일을 입력해 주세요.';
    if (isEmpty(password)) errors.password = '비밀번호를 입력해 주세요.';
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // 2. DB 에서 이메일 찾기
    const user = await User.findOneBy({ email });
    if (!user) return res.status(404).json({ email: '이메일이 없습니다.' });

    // 3. 이메일이 있다면 비밀번호 확인
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return res.status(401).json({ password: '비밀번호가 다릅니다.'});

    // 4. 비밀번호가 맞다면 토큰 생성
    const token = jwt.sign({ email }, process.env.JWT_SECRET);

    // 5. 생성한 토큰을 쿠키에 저장
    res.set("Set-Cookie", cookie.serialize("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    }));
    
    // 6. 클라이언트에 응답 전송
    return res.json({ user, token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ e });
  }
};

const router = Router();
router.post("/login", login);

export default router;
