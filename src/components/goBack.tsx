//import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

const GoBack: React.FC = () => {
  return (
    <div className="flex -center abs-bl w-[25vw] h-[25vw] overflow-hidden bg-secondary-dark rounded-tr-2xl border-r-4 border-t-2 border-white">
      <div className="flex -center w-[20vw] h-[20vw] bg-primary-light text-white rounded-2xl border-2 border-white">
        <Link href="/">Back</Link>
      </div>
    </div>
  );
};
export default GoBack
