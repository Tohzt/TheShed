import React from 'react';
import { useSession } from 'next-auth/react';

const Header = () => {
  const { data: session } = useSession();
  const user = session ? session.user : null

  return (
    <div className="flex -center">
      <div className="abs-top max-w-[90vw] w-full flex-col -center rounded-b-2xl bg-gradient-to-b from-secondary-light to-secondary-dark ">
        <h1>My App</h1>
        {user && (
          <div>
            <span>{user.name}</span>
            <br />
            <span>{user.email}</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default Header;
