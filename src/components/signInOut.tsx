import { signIn, signOut, useSession } from "next-auth/react";

const SignInOut: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <button
      className="w-[20vw] h-[20vw] bg-primary-light text-white rounded-2xl border-2 border-white"
      onClick={sessionData ? () => void signOut() : () => void signIn()}
    >
    {sessionData ? "Sign Out" : "Sign In"}
    </button>
  );
};
export default SignInOut
