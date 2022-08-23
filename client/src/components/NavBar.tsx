import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { FaSearch } from "react-icons/fa";
import { useAuthDispatch, useAuthState } from "../context/auth";

interface NavBarProps {
  searchPost?: string;
  setSearchPost: Dispatch<SetStateAction<string>>;
  setSearchPosts?: Dispatch<SetStateAction<any>>;
  search: boolean;
}

const NavBar = ({
  searchPost,
  setSearchPost,
  setSearchPosts,
  search,
}: NavBarProps) => {
  const { loading, authenticated } = useAuthState();
  const dispatch = useAuthDispatch();

  const searchPosts = async () => {
    const text = searchPost?.trim();
    const result = await axios.get(`/posts/search`, {
      params: { q: text },
    });
    if (setSearchPosts) {
      setSearchPosts(result.data);
    }
  };

  const handleLogout = () => {
    axios
      .post("/auth/logout")
      .then(() => {
        dispatch("LOGOUT");
        window.location.reload();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const onKeyDown = (e: any) => {
    if (e.key === "Enter") {
      searchPosts();
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-5 bg-white h-13">
      <span className="text-2xl font-semibold text-gray-400">
        <Link href="/">
          <a>
            <Image
              src="/reddit-name-logo.png"
              alt="logo"
              width={80}
              height={45}
            ></Image>
          </a>
        </Link>
      </span>
      <div className="max-w-full px-4">
        {search && (
          <div className="relative flex items-center bg-gray-100 border rounded hover:border-gray-700 hover:bg-white">
            <FaSearch className="ml-2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Reddit"
              className="px-3 py-1 bg-transparent rounded h-7 focus:outline-none"
              value={searchPost}
              onChange={(e) => setSearchPost(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
        )}
      </div>

      <div className="flex">
        {!loading &&
          (authenticated ? (
            <button
              className="w-20 px-2 mr-2 text-sm text-center text-white bg-gray-400 rounded h-7"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          ) : (
            <>
              <Link href="/login">
                <a className="w-20 px-2 pt-1 mr-2 text-sm text-center text-blue-500 border border-blue-500 rounded h-7">
                  로그인
                </a>
              </Link>
              <Link href="/register">
                <a className="w-20 px-2 pt-1 text-sm text-center text-white bg-gray-400 rounded h-7">
                  회원가입
                </a>
              </Link>
            </>
          ))}
      </div>
    </div>
  );
};

export default NavBar;
