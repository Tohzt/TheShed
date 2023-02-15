import React from 'react';
import Link from 'next/link';

const PageButtons: React.FC<{style: string; pagepath: string; label: string;}> = (props) => {
  const style = "w-[100px] h-[100px] flex justify-center items-center rounded-lg bg-blue-600 " + props?.style;
  return (
    <Link href={props?.pagepath}>
      <div className={style}>
        {props?.label}
      </div>
    </Link>
  );
};

export default PageButtons;
