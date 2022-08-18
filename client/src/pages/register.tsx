import axios from 'axios';
import Link from "next/link";
import { useRouter } from 'next/router';
import { FormEvent, useState } from "react";
import InputGroup from "../components/InputGroup";

const register = () => {
	const router = useRouter();
	const [email, set_email] = useState('');
	const [username, set_username] = useState('');
	const [password, set_password] = useState('');
	const [errors, set_errors] = useState<any>({});

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		try {
			const res = await axios.post('/auth/register', {
				email,
				username,
				password,
			})
			console.log('res:', res);
			router.push('/login')
		} catch (e: any) {
			console.log(e);
			set_errors(e?.response?.data || {});
		}
	}

  return (
    <div className="bg-white">
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="w-10/12 mx-auto md:w-96">
          <h1 className="mb-2 text-lg font-medium">회원가입</h1>
          <form onSubmit={handleSubmit}>
						<InputGroup 
							placeholder="Email"
							value={email}
							setValue={set_email}
							error={errors.email}
						/>
						<InputGroup 
							placeholder="Username"
							value={username}
							setValue={set_username}
							error={errors.username}
						/>
						<InputGroup 
							placeholder="Password"
							value={password}
							setValue={set_password}
							error={errors.password}
						/>
            <button className="w-full py-2 mb-1 text-xs font-bold text-white uppercase bg-gray-400 border border-gray-400 rounded">
              회원가입
            </button>
          </form>
          <small>
            이미 가입하셨나요?
            <Link href="/login">
              <a className="ml-1 text-blue-500 uppercase">로그인</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default register;
