import type { NextPage } from "next";
import Link from "next/link";
import useSWR from "swr";
import { Post, Sub } from "../types";
import axios from "axios";
import Image from "next/image";
import { useAuthState } from "../context/auth";
import useSWRInfinite from "swr/infinite";
import PostCard from "../components/PostCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";

const Home: NextPage = () => {
  const { authenticated } = useAuthState();
  const { pathname } = useRouter();
  const authRoutes = ["/login", "/register"];
  const authRoute = authRoutes.includes(pathname);
  const [searchPost, setSearchPost] = useState('');
  const [searchPosts, setSearchPosts] = useState<Post[]>([]);

  const fetcher = async (url: string) => {
    return await axios.get(url).then((res) => res.data);
  };
  const address = `/subs/sub/topSubs`;

  const getKey = (pageIndex: number, previousPageData: Post[]) => {
    if (previousPageData && !previousPageData.length) return null;
    return `/posts?page=${pageIndex}`;
  };

  const {
    data,
    error,
    size: page,
    setSize: setPage,
    isValidating,
    mutate,
  } = useSWRInfinite<Post[]>(getKey);
  const { data: topSubs } = useSWR<Sub[]>(address, fetcher);

  const isInitialLoading = !data && !error;
  const posts: Post[] = data ? ([] as Post[]).concat(...data) : [];

  // 스크롤 내려서 observedPost 에 닿으면
  // 다음 페이지 포스트들을 가져오기 윟나 포스트 Id
  const [observedPost, setObservedPost] = useState("");

  const observeElement = (element: HTMLElement | null) => {
    if (!element) return;
    console.log("observe");
    const observer = new IntersectionObserver(
      (entries) => {
        // isIntersecting: 관찰 대상 교차 상태 (boolean)
        if (entries[0].isIntersecting === true) {
          console.log("마지막 포스트에 도달");
          setPage(page + 1);
          observer.unobserve(element);
        }
        // 옵저버가 실행되기 위해 타겟 가시성이 얼마나 필요한지의 백분율
      },
      { threshold: 1 }
    );
    observer.observe(element);
  };
  // Infinite Scroll
  useEffect(() => {
    // 포스트가 없다면 return
    if (!posts || posts.length === 0) return;
    // posts 배열안에 마지막 post에 id를 가져옵니다.
    const id = posts[posts.length - 1].identifier;
    // posts 배열에 post가 추가돼서 마지막 post가 바뀌었다면
    // 바뀐 post 중 마지막post를 obsevedPost로
    if (id !== observedPost) {
      setObservedPost(id);
      observeElement(document.getElementById(id));
    }
  }, [posts]);

  return (
    <>
    {!authRoute && <NavBar searchPost={searchPost} setSearchPost={setSearchPost} setSearchPosts={setSearchPosts} search={true}/>}
      <div className="flex max-w-5xl px-4 pt-14 mx-auto">
        {/* 포스트 목록 */}
        <div className="w-full md:mr-3 md:w-8/12">
          <div className="w-9/12">
            {isInitialLoading && (
              <p className="text-lg text-center">Loading..</p>
            )}
            {searchPosts.length > 0 ? searchPosts?.map((post) => (
              <PostCard post={post} key={post.identifier} mutate={mutate} />
            ))
            : posts?.map((post) => (
              <PostCard post={post} key={post.identifier} mutate={mutate} />
            ))
          }
          </div>
        </div>
        {/* 사이드 바 */}
        <div className="hidden w-4/12 ml-3 md:block">
          <div className="bg-white border rounded">
            <div className="p-4 border-b">
              <p className="text-lg font-semibold text-center">상위 커뮤니티</p>
            </div>
            {/* 커뮤니티 목록 */}
            <div>
              {topSubs?.map((sub) => (
                <div
                  key={sub.name}
                  className="flex items-center px-4 py-2 text-xs border-b"
                >
                  <Link href={`/r/${sub.name}`}>
                    <a>
                      <Image
                        src={sub.imageUrl}
                        className="rounded-full cursor-pointer"
                        alt="sub"
                        width={24}
                        height={24}
                      />
                    </a>
                  </Link>
                  <Link href={`/r/${sub.name}`}>
                    <a className="ml-2 font-bold hover:cursor-pointer">
                      /r/{sub.name}
                    </a>
                  </Link>
                  <p className="ml-auto font-medium">{sub.postCount}</p>
                </div>
              ))}
            </div>
            {authenticated && (
              <div className="w-full py-6 text-center">
                <Link href="/subs/create">
                  <a className="w-full p-2 text-center text-white bg-gray-400 rounded">
                    커뮤니티 만들기
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
