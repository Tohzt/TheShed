import React from 'react';
import ProfileIcon from './ProfileIcon';
import { useSession } from 'next-auth/react';
import { api } from "../utils/api";

const Header = () => {
  const { data: session } = useSession();
  const user = session ? session.user : null
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const [width, setWidth] = React.useState<number>(900);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  React.useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;

  return (
    <div className="">
      <div className="header-profile-container"></div>
      <div className="header-profile-square"></div>
      <div className="header-profile-gap"></div>
      <div className="header-icon"></div>
      <div className="header-icon-inner"></div>
      <ProfileIcon />
      <div className="header-profile-rectangle">
        <div className="w-full">
          <div className="header-text">
            <div className="flex-col -center gap-1">
              {user && isMobile ? (
                <div>
                  <span>{user.name}</span>
                </div>
              ) : (
                <>
                  <span className="text-[3em] font-bold text-white">The</span>
                  <span className="-translate-x-2 text-[3em] font-bold text-white">Shed</span>
                  {/*
                {hello.data ? hello.data.greeting : "Loading tRPC query..."}
                */}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
