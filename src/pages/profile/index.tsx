import * as React from "react"
import Link from "next/link";
import { useSession } from "next-auth/react";
import ProfileIcon from "../components/ProfileIcon";

const ProfilePage = () => {
  const { data: session } = useSession();

  return ( session &&
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <ProfileIcon />
        <span> User:    </span>
        <span>{session?.user?.name}</span>
        <br />
        <span> Email:    </span>
        <span>{session?.user?.email}</span>
        <br />

        <Link href="/">
          Go Back
        </Link>
      </div>
    </>
  );
};

export default ProfilePage

