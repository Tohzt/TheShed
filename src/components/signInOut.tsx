import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "../../utils/api";

const SignInOut: React.FC = () => {
  const { data: sessionData } = useSession();
  return (
    <div className="rounded-full bg-blue-500">
      <button
        className="rounded-full px-10 py-3 font-semibold text-white hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign Out" : "Sign In"}
      </button>
    </div>
  );
};
export default SignInOut
