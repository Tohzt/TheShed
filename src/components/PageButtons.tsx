import React from 'react';
import Link from 'next/link';
interface Props {
  style?: string;
  pagePath?: string;
  label?: string;
}

const PageButtons: React.FC<Props> = (props) => {
  const style = "page-button w-[80vw] h-[80px] flex justify-center items-center " + props?.style;
  return (
    <Link href={props?.pagePath}>
      <div className={style}>
        {props?.label}
      </div>
    </Link>
  );
};

export default PageButtons;
