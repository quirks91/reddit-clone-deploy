import axios from "axios";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { FormEvent, useState } from "react";
import InputGroup from "../../components/InputGroup";

const SubCreate = () => {
  const router = useRouter();
  const [name, set_name] = useState("");
  const [title, set_title] = useState("");
  const [description, set_description] = useState("");
  const [errors, set_errors] = useState<any>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("/subs", { name, title, description });
      router.push(`/r/${res.data.name}`);
    } catch (e: any) {
      console.log(e);
      set_errors(errors.response.data);
    }
  };

  return (
    <div className="flex flex-col justify-center pt-16">
      <div className="w-10/12 mx-auto md:w-96">
        <h1 className="mb-2 text-lg font-medium">커뮤니티 만들기</h1>
        <hr />
        <form onSubmit={handleSubmit}>
          <div className="my-6">
            <p className="font-medium">Name</p>
            <p className="mb-2 text-xs text-gray-400">
              커뮤니티 이름은 변경할 수 없습니다.
            </p>
            <InputGroup
              placeholder="이름"
              value={name}
              setValue={set_name}
              error={errors.name}
            />
          </div>
          <div className="my-6">
            <p className="font-medium">Title</p>
            <p className="mb-2 text-xs text-gray-400">
              주제를 나타냅니다. 변경 가능합니다.
            </p>
            <InputGroup
              placeholder="주제"
              value={title}
              setValue={set_title}
              error={errors.title}
            />
          </div>
          <div className="my-6">
            <p className="font-medium">Description</p>
            <p className="mb-2 text-xs text-gray-400">
              해당 커뮤니티에 대한 설명입니다.
            </p>
            <InputGroup
              placeholder="설명"
              value={description}
              setValue={set_description}
              error={errors.description}
            />
          </div>
          <div className="flex justify-end">
            <button className="px-4 py-1 text-sm font-semibold rounded text-white bg-gray-400 border">
              커뮤니티 만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubCreate;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const cookie = req.headers.cookie;
    if(!cookie) throw new Error("missing auth token cookie");

    // cookie 가 있다면 쿠키로 서버에서 인증 처리
    await axios.get(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api/auth/me`, {
      headers: {cookie}
    })

    return { props: {}}
  } catch (e) {
    res.writeHead(307, { Location: '/login'}).end();
    return { props: {}}
  }
};
