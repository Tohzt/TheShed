import React from 'react';
import Link from 'next/link';
interface Props {
  style?: string;
  pagePath?: string;
  label?: string;
}


const PageButtons: React.FC<Props> = (props) => {
  const style = "page-button w-[80vw] h-[10vh] flex justify-center items-center " + props?.style;
  const [hover, setHover] = React.useState(false);
  const [hoverStyle, setHoverStyle] = React.useState(" border-b-8");
  const divRef = React.useRef(null)
  const linkRef = React.useRef<HTMLAnchorElement>(null)
  
  React.useEffect(() => {
    if (hover) {
      setHoverStyle(" border-t-4 border-b-4");
    } else {
      setHoverStyle(" border-b-8");
    }
  }, [hover, hoverStyle]);

  const handleClick = () => {
    setTimeout(() => {
      linkRef?.current?.click();
    }, 200);
  };

  return (
    <div 
      ref={divRef} 
      className={style + hoverStyle} 
      onClick={handleClick}
      onTouchStart={()=>{setHover(true)}}
      onTouchEnd={()=>{setHover(false)}}
    >
    <Link ref={linkRef} className={"pointer-events-none"} href={props?.pagePath} >
        {props?.label}
      </Link>
    </div>
  );
};

export default PageButtons;
