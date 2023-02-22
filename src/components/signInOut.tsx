import { signIn, signOut, useSession } from "next-auth/react";

const SignInOut: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <button
      className="bg-secondary-light m-4 p-4 rounded-full"
      onClick={sessionData ? () => void signOut() : () => void signIn()}
    >
    {sessionData ? "Sign Out" : "Sign In"}
    </button>
  );
};
export default SignInOut
