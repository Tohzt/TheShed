import * as React from "react"
//import { useSession } from "next-auth/react";
import ProfileIcon from "../../components/ProfileIcon";
import GoBack from "../../components/goBack";
import Header from "../../components/header"
import Link from 'next/link';

const ArcadePage = () => {
  //const { data: session } = useSession();

  return (true &&
    <>
      <Header />
      <div className="screen bg-zinc-900 border-4 border-zinc-400 flex -center">
        <div className="flex -center -column bg-secondary w-[20vw] h-[20vw] rounded-2xl border-4 border-white">
          <Link href="/arcade/mario">
            Mario
          </ Link>
        </div>
      </div>
      <GoBack />
    </>
  );
};

export default ArcadePage

