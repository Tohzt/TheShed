import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function GoBack() {
  return (
    <>
      <Link href="/">
        <div className="flex justify-center">
          Go Back
        </div>
      </Link>
    </>
  )
}

const Footer: React.FC<{ func: any }> = (props) => {
  const placement = "absolute bottom-0 w-screen items-center justify-center rounded-t-full "
  return (
    <div className={placement}>
      <div className={`${placement}h-[5vh] bg-zinc-900 bg-opacity-60 blur-sm`}></div>
      <div className={`${placement}h-[4vh] bg-gradient-to-tl from-[#ef8018] to-[#ffcb24]`}>
        {props.func}
      </div>
    </div>
  );
};
export default Footer
