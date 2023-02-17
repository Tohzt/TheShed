import * as React from "react"
import { useSession } from "next-auth/react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import goBack from "../../components/goBack";

const ProfilePage = () => {
  const { data: session } = useSession();

  return (session &&
    <>
      <Header title="Profile" description="Basic Profile Shit" />

      <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="pt-10 text-white">
        </div>
        <span> User:    </span>
        <span>{session?.user?.name}</span>
        <br />
        <span> Email:    </span>
        <span>{session?.user?.email}</span>
        <br />
      </div>

      <Footer func={goBack} size="h-[4vh]"/>
    </>
  );
};

export default ProfilePage

