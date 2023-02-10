import React from 'react';
import Link from 'next/link';

const PageButtons: React.FC<{pagepath: string; label: string;}> = (props) => {
  return (
    <Link href={props?.pagepath}>
      <div className="w-[100px] h-[100px] flex justify-center items-center rounded-lg bg-blue-600">
        {props?.label}
      </div>
    </Link>
  );
};

export default PageButtons;
