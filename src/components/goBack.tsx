//import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

const GoBack: React.FC = () => {
  const [pos, setPos] = useState<{xx: number; yy: number}>({xx: 0,yy: 20});
  useEffect(() => {
    //increase xx from 0 to 60 over 2 seconds
    const interval = setInterval(() => {
      setPos((prev) => {
        if (prev.xx < 50) {
          return { xx: prev.xx + 1, yy: prev.yy };
        } else {
          return { xx: prev.xx, yy: prev.yy };
        }
      });
    }, 20);
    return () => clearInterval(interval);
  });
  

  let placement = "absolute -bottom-[20vw] items-center justify-center rounded-full " + "left-[" + pos.xx + "vw] top-[" + pos.yy + "vw] ";
  console.log(placement);

  return (
    <div className="">
      <div className={`${placement}w-[42vw] h-[42vw] translate-y-2 translate-x-2 bg-zinc-900 bg-opacity-80 blur-sm `}></div>
      <div className={`${placement}w-[40vw] h-[40vw] `}></div>
      <div className={`${placement}w-[40vw] h-[40vw] bg-zinc-800 overflow-hidden hover:animate-spin`}>
        <button
          className="rounded-full w-full h-full font-semibold text-white "
          onClick={() => console.log("Go Back")}
        >
        <div className="-translate-y-8 text-[hsl(280,100%,70%)]">
            <Link href="/">
              Go Back
            </Link>
          </div>
        </button>
      </div>
    </div>
  );
};
export default GoBack
