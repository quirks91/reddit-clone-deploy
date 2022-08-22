import { NextFunction, Request, Response, Router } from "express";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";

import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { isEmpty } from "class-validator";
import { AppDataSource } from "../data-source";
import Sub from "../entities/Sub";
import Post from "../entities/Post";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { makeId } from "../utils/helpers";
import { unlinkSync } from "fs";

const getSub = async (req: Request, res: Response) => {
  const name = req.params.name;

  try {
    const sub = await Sub.findOneByOrFail({ name });

    // 포스트 생성 후 해당 sub에 속하는 포스트 정보를 넣어준다
    const posts = await Post.find({
      where: { subName: sub.name },
      order: { createdAt: "DESC" },
      relations: ["comments", "votes"],
    });

    sub.posts = posts;

    if (res.locals.user) {
      sub.posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    console.log(sub);

    return res.status(200).json(sub);
  } catch (e) {
    return res.status(404).json({ e: "서브를 찾을 수 없습니다. " });
  }
};

const createSub = async (req: Request, res: Response, next) => {
  const { name, title, description } = req.body;

  try {
    let errors: any = {};

    // 1. sub name 과 title 확인
    if (isEmpty(name)) errors.name = "이름은 비워둘 수 없습니다.";
    if (isEmpty(title)) errors.title = "제목은 비워둘 수 없습니다.";

    if (Object.keys(errors).length > 0) throw errors;

    // 2. sub 가 존재하는 확인.
    const sub = await AppDataSource.getRepository(Sub)
      .createQueryBuilder("sub")
      .where("lower(sub.name) = :name", { name: name.toLowerCase() })
      .getOne();

    if (sub) errors.name = "서브가 이미 존재합니다.";
  } catch (e) {
    console.error(e);
    return res.status(500).json({ e: "문제가 발생했습니다." });
  }

  try {
    const user: User = res.locals.user;

    const sub = new Sub();

    sub.name = name;
    sub.title = title;
    sub.description = description;
    sub.user = user;

    await sub.save();
    return res.json(sub);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

const topSubs = async (req: Request, res: Response) => {
  try {
    const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' ||s."imageUrn",'https://www.gravatar.com/avatar?d=mp&f=y')`;
    const subs = await AppDataSource.createQueryBuilder()
      .select(
        `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
      )
      .from(Sub, "s")
      .leftJoin(Post, "p", `s.name = p."subName"`)
      .groupBy('s.title, s.name, "imageUrl"')
      .orderBy(`"postCount"`, "DESC")
      .limit(5)
      .execute();
    return res.json(subs);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const sub = await Sub.findOneOrFail({
      where: {
        name: req.params.name,
      },
    });

    if (sub.username !== user.username) {
      return res
        .status(403)
        .json({ error: "이 커뮤니티를 소유하고 있지 않습니다. " });
    }

    res.locals.sub = sub;

    return next();
  } catch (e) {
    console.log(e);
    return res.status(500).json({ e: "문제가 발생했습니다. " });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: "public/images",
    filename: (_, file, callback) => {
      const name = makeId(15);
      callback(null, name + path.extname(file.originalname));
    },
  }),
  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
      callback(null, true);
    } else {
      callback(new Error("jpeg/png 파일만 가능합니다."));
    }
  },
});

const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;
  try {
    const type = req.body.type;
    // 파일 유형을 지정하지 않았을 경우 업로드된 파일 삭제
    if (type !== "image" && type !== "banner") {
      if (!req.file?.path)
        return res.status(400).json({ e: "유효하지 않은 파일" });
      // 파일 삭제
      unlinkSync(req.file.path);
      return res.status(400).json({ e: "잘못된 유형" });
    }

    let oldImageUrn: string = "";

    if (type === "image") {
      // 사용중인 Urn 저장 (이전 파일을 아래서 삭제)
      oldImageUrn = sub.imageUrn || "";
      // 새로운 파일 이름을 저장
      sub.imageUrn = req.file?.filename || "";
    } else if (type === "banner") {
      oldImageUrn = sub.bannerUrn || "";
      sub.bannerUrn = req.file?.filename || "";
    }
    // DB에 저장
    await sub.save();

    // 사용하지 않은 이미지파일 삭제
    if (oldImageUrn !== "") {
      const fullFilename = path.resolve(
        process.cwd(),
        "public",
        "images",
        oldImageUrn
      );
      unlinkSync(fullFilename);
    }

    return res.json(sub);
  } catch (e) {
    console.log(e);
  }
};

const router = Router();
router.get("/:name", userMiddleware, getSub);
router.post("/", userMiddleware, authMiddleware, createSub);
router.get("/sub/topSubs", topSubs);
router.post(
  "/:name/upload",
  userMiddleware,
  authMiddleware,
  ownSub,
  upload.single("file"),
  uploadSubImage
);

export default router;
