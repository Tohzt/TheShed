//import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

const GoBack: React.FC = () => {
  return (
    <Link
      className="flex -center w-[20vw] h-[20vw] bg-primary-light text-white rounded-2xl border-2 border-white"
      href="/">
      Back
    </Link>
  );
};
export default GoBack
