import { signIn, signOut, useSession } from "next-auth/react";
//import { api } from "../utils/api";

const SignInOut: React.FC = () => {
  const { data: sessionData } = useSession();
  const placement = "absolute bottom-0 right-0 items-center justify-center rounded-tl-full "
  return (
    <div className={placement}>
      <div className={`${placement}w-[22vw] h-[22vw] translate-y-2 -translate-x-2 bg-zinc-900 bg-opacity-80 blur-sm `}></div>
      <div className={`${placement}w-[20vw] h-[20vw] `}></div>
      <div className={`${placement}w-[20vw] h-[20vw] bg-[#2e026d] overflow-hidden`}>
        <button
          className="translate-x-[3vw] translate-y-[3vw] rounded-full w-full h-full font-semibold text-white "
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          <div className="-rotate-45 -translate-x-2 -translate-y-2 text-[hsl(280,100%,70%)]">
            {sessionData ? "Sign Out" : "Sign In"}
          </div>
        </button>
      </div>
    </div>
  );
};
export default SignInOut
