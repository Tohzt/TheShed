//import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

const GoBack: React.FC = () => {
  let placement = "absolute -bottom-[20vw] items-center justify-center rounded-full left-[0vw] -bottom-[20vw] ";
  return (
    <div className="">
      <div className={`${placement}w-[42vw] h-[42vw] translate-y-2 translate-x-2 bg-zinc-900 bg-opacity-80 blur-sm `}></div>
      <div className={`${placement}w-[40vw] h-[40vw] `}></div>
      <div className={`${placement}w-[40vw] h-[40vw] bg-zinc-800 overflow-hidden`}>
        <button className="rounded-full w-full h-full font-semibold text-white ">
          <div className="w-full h-full text-[hsl(280,100%,70%)]">
            <Link href="/">
              <div className="pt-8 w-full h-full">
                Go Back
              </div>
            </Link>
          </div>
        </button>
      </div>
    </div>
  );
};
export default GoBack
