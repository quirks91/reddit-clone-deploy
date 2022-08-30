import "../styles/globals.css";
import type { AppProps } from "next/app";
import axios from "axios";
import { AuthProvider } from "../context/auth";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";
import { SWRConfig } from "swr";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ["/login", "/register", "/"];
  const authRoute = authRoutes.includes(pathname);
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api";
  axios.defaults.withCredentials = true;

  const fetcher = async (url: string) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (e: any) {
      throw e.response.data;
    }
  };

  return (
    <>
      <Head>
        <script
          defer
          src="https://use.fontawesome.com/releases/v6.1.1/js/all.js"
          integrity="sha384-xBXmu0dk1bEoiwd71wOonQLyH+VpgR1XcDH3rtxrLww5ajNTuMvBdL5SOiFZnNdp"
          crossOrigin="anonymous"
        ></script>
        <meta
          httpEquiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />
      </Head>
      <SWRConfig
        value={{
          fetcher,
        }}
      >
        <AuthProvider>
          {!authRoute && (
            <NavBar setSearchPost={() => console.log()} search={false} />
          )}
          <div className={"pt-12 bg-gray-200 min-h-screen"}>
            <Component {...pageProps} />
          </div>
        </AuthProvider>
      </SWRConfig>
    </>
  );
}

export default MyApp;
