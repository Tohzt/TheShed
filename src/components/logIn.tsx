import { signIn } from "next-auth/react";
import { type GetServerSideProps } from "next";

interface LoginProps {
  id: string;
  name: string;
  signinUrl: string;
  callbackUrl: string;
  type: string;
}
const Login: React.FC<LoginProps> = (props) => {

  return (
    <div className="w-full h-full flex justify-center items-center">
    {/*
      {props.id ? (
        <div className="flex items-center justify-center w-[25vw] h-[8vh] rounded-full font-semibold bg-blue-400 text-slate-300 border-4 border-slate-300">
          {
            Object?.values(providers).map(provider => (
              <div key={provider}>
                <button onClick={() => void signIn(provider)}>{provider}</button>
              </div>
            ))
            }
          <button onClick={() => void signIn(props.id)}>{props.name}</button>
        </div>
      ) : (
        <p>Loading providers...</p>
      )}
      */}
    </div>
  );
}
export default Login;
