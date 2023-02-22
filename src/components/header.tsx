import React from 'react';
import { useSession } from 'next-auth/react';
import { api } from "../utils/api";

const Header = () => {
  const { data: session } = useSession();
  const user = session ? session.user : null
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <div className="flex -center">
      <div className="abs-top max-w-[90vw] w-full flex-col -center rounded-b-2xl bg-gradient-to-b from-secondary-light to-secondary-dark ">
        <h1>My App</h1>
        {user ? (
          <div>
            <span>{user.name}</span>
            <br />
            <span>{user.email}</span>
          </div>
        ) : (
        <>
          <h1 className="bg-secondary">
            <span className="">Landing Page</span>
          </h1>
          <p className="text-2xl text-white">
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>
        </>
        )}
      </div>
    </div>
  );
};
export default Header;
