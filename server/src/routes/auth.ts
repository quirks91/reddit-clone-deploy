import { validate } from "class-validator";
import { Request, Response, Router } from "express";
import { User } from "../entities/User";

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
        prev[err.property] = Object.entries(err.constraints[0][1]);

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

const router = Router();
router.post("/register", register);

export default router;
