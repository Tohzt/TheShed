import * as React from "react"
//import { useSession } from "next-auth/react";
import Header from "../../components/header"
import Footer from "../../components/Footer"

const ProfilePage = () => {
  //const { data: session } = useSession();

  return (true &&
    <>
      <Header />

      <div className="flex screen flex-col -center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="pt-10 text-white">
        {/*
          <span> User:    </span>
          <span>{session ? session?.user?.name : "Not Logged In"}</span>
          <br />
          <span> Email:    </span>
          <span>{session ? session?.user?.email : "Not Logged In"}</span>
          <br />
        */}
        </div>
      </div>

      <Footer goBack={true} signIn={true} signOut={false}/>
    </>
  );
};

export default ProfilePage

