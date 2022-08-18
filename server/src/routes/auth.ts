import { isEmpty, validate } from "class-validator";
import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";

const me = async (_: Request, res: Response) => {
  return res.json(res.locals.user);
}


const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    let errors: any = {};

    // 1. 이메일, 유저이름이 사용되고 있는지 확인.
    const emailUser = await User.findOneBy({ email });
    const usernameUser = await User.findOneBy({ username });

    // 2. 사용중이면 에러 응답
    if (emailUser) errors.email = "이미 해당 이메일 주소가 사용중입니다.";
    if (usernameUser) errors.username = "이미 해당 사용자 이름이 사용중입니다.";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // 3. 이메일, 유저이름이 사용중이지 않으면 저장
    const user = new User();
    user.email = email;
    user.username = username;
    user.password = password;

    // 4. 엔티티에 정해 놓은 조건으로 user 데이터 유효성 검사
    errors = await validate(user);

    const mapErrors = (errors: Object[]) => {
      return errors.reduce((prev: any, err: any) => {
        prev[err.property] = Object.entries(err.constraints)[0][1];

        return prev;
      }, {});
    };

    if (errors.length > 0) return res.status(400).json(mapErrors(errors));

    // 5. 유저 정보를 user table 에 저장
    await user.save();

    // 6. 클라이언트에 응답 전송
    return res.json(user);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ e });
  }
};

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
router.get('/me', userMiddleware, authMiddleware, me);
router.post("/register", register);
router.post("/login", login);

export default router;
