import React from 'react';
import Link from 'next/link';

const PageButtons: React.FC = (props) => {
  return (
    <Link href={props?.page}>
      <div className="w-[100px] h-[100px] flex justify-center items-center rounded-lg bg-blue-600">
        {props?.label}
      </div>
    </Link>
  );
};

export default PageButtons;
