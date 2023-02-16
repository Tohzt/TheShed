import * as React from "react"
import { useSession } from "next-auth/react";
import ProfileIcon from "../../components/profileIcon";
import GoBack from "../../components/goBack";
import Header from "../../components/header";

const ProfilePage = () => {
  const { data: session } = useSession();

  return (session &&
    <>
      <Header />
      <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="pt-10 text-white">
        </div>
        <ProfileIcon />
        <span> User:    </span>
        <span>{session?.user?.name}</span>
        <br />
        <span> Email:    </span>
        <span>{session?.user?.email}</span>
        <br />

      </div>
      <GoBack />
    </>
  );
};

export default ProfilePage

