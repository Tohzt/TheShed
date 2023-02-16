import { signIn, signOut, useSession } from "next-auth/react";
//import { api } from "../utils/api";

const SignInOut: React.FC = () => {
  const { data: sessionData } = useSession();
  const placement = "h-[4vh] absolute bottom-0 w-screen items-center justify-center rounded-t-full "
  return (
    <div className={placement}>
      <div className={`${placement}bg-zinc-900 bg-opacity-60 blur-sm -translate-y-2`}></div>
      <div className={`${placement}bg-zinc-600`}>
        <button
          className="w-full h-full font-semibold text-white "
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          <div className="text-[hsl(280,100%,70%)]">
            {sessionData ? "Sign Out" : "Sign In"}
          </div>
        </button>
      </div>
    </div>
  );
};
export default SignInOut
