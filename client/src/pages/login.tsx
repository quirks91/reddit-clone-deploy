import React, { FormEvent, useState } from "react";
import axios from "axios";
import InputGroup from "../components/InputGroup";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthDispatch } from "../context/auth";

const login = () => {
  const router = useRouter();
  const [email, set_email] = useState("");
  const [password, set_password] = useState("");
  const [errors, set_errors] = useState<any>({});

  const dispatch = useAuthDispatch();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "/auth/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      dispatch("LOGIN", res.data?.user);
      router.push("/");
    } catch (e: any) {
      console.log(e);
      set_errors(e?.response?.data || {});
    }
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="w-10/12 mx-auto md:w-96">
          <h1 className="mb-2 text-lg font-medium">로그인</h1>
          <form onSubmit={handleSubmit}>
            <InputGroup
              placeholder="Email"
              value={email}
              setValue={set_email}
              error={errors.email}
            />
            <InputGroup
              placeholder="Password"
              value={password}
              setValue={set_password}
              error={errors.password}
            />
            <button className="w-full py-2 mb-1 text-xs font-bold text-white uppercase bg-gray-400 border border-gray-400 rounded">
              로그인
            </button>
          </form>
          <small>
            아직 아이디가 없나요?
            <Link href="/login">
              <a className="ml-1 text-blue-500 uppercase">회원가입</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default login;
