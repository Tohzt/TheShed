import * as React from "react"
//import { useSession } from "next-auth/react";
import ProfileIcon from "../../components/ProfileIcon";
import GoBack from "../../components/goBack";

const ProfilePage = () => {
  //const { data: session } = useSession();

  return (true &&
    <>
      <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="pt-10 text-white">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            The <span className="text-[hsl(280,100%,70%)]">Profile</span>
          </h1>
          <p className="text-2xl">
            Basic Profile Shit
          </p>
        </div>
        <ProfileIcon />
        <span> User:    </span>
        {/*
        <span>{session ? session?.user?.name : "Not Logged In"}</span>
        */}
        <br />
        <span> Email:    </span>
        {/*
        <span>{session ? session?.user?.email : "Not Logged In"}</span>
        */}
        <br />

      </div>
      <GoBack />
    </>
  );
};

export default ProfilePage

