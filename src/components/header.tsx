import React from 'react';
import ProfileIcon from './ProfileIcon';
import { useSession } from 'next-auth/react';
import { api } from "../utils/api";

const Header = () => {
  const { data: session } = useSession();
  const user = session ? session.user : null
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <div className="abs-top w-screen max-h-[50vw] flex -center">
      <div className="header-profile-container"></div>
      <div className="header-profile-square"></div>
      <div className="header-profile-gap"></div>
      <div className="header-icon"></div>
      <div className="header-icon-inner"></div>
      <ProfileIcon />

      <div className="header-profile-rectangle">

      <div className=" header w-full">

        <div className="overflow-hidden flex -center h-[25vw] text-white text-lg font-heading">
          {user ? (
            <div>
              <span>{user.name}</span>
            </div>
          ) : (
              <div className="flex-col -center gap-1">
                <span className="text-[3em] font-bold text-white">The</span>
                <span className="-translate-x-2 text-[3em] font-bold text-white">Shed</span>
                {/*hello.data ? hello.data.greeting : "Loading tRPC query..."}*/}
              </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
