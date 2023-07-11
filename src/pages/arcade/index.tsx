import * as React from "react"
//import { useSession } from "next-auth/react";
import Header from "../../components/header"
import Footer from "../../components/Footer"
import Link from 'next/link';

const ArcadePage = () => {
  //const { data: session } = useSession();

  return (true &&
    <>
      <Header />
      <div className="screen bg-zinc-900 border-4 border-zinc-400 flex -center">
        <div className="flex -center -column bg-secondary w-[20vw] h-[20vw] rounded-2xl border-4 border-white">
          <Link className="flex -center w-full h-full" href="/arcade/godot">
            Godot
          </ Link>
        </div>
        <div className="flex -center -column bg-secondary w-[20vw] h-[20vw] rounded-2xl border-4 border-white">
          <Link className="flex -center w-full h-full" href="/arcade/mario">
            Mario
          </ Link>
        </div>
      </div>
      <Footer goBack={true} signIn={false} signOut={false}/>
    </>
  );
};

export default ArcadePage

