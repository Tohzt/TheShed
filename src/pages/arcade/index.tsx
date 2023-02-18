import * as React from "react"
import { useSession } from "next-auth/react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import goBack from "../../components/goBack";

const ArcadePage = () => {
  const { data: session } = useSession();

  return (session &&
    <>
      <Header title="Arcade" description="Touch My Buttons" />

      <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="flex flex-col flex-1 justify-around">
          <div className="select-none bg-zinc-900 w-[90vw] h-[135vw] max-h-[80vh] border-4 border-zinc-400 flex items-center justify-center">
            <iframe title='Mario Bros' src="../../../arcade/mario/index.html" width='100%' height='100%'></iframe>
          </div>
        </div>
      </div>

      <Footer func={goBack} size="h-[4vh]"/>
    </>
  );
};

export default ArcadePage

