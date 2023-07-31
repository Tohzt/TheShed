import React from 'react';
import { useRouter } from 'next/router';

interface Props {
  style?: string;
  path?: string;
  label?: string;
}

const SocialButtons: React.FC<Props> = (props) => {
  const style = "social-button " + props?.style;
  const [hover, setHover] = React.useState(false);
  const [hoverStyle, setHoverStyle] = React.useState("");

  React.useEffect(() => {
    if (hover) setHoverStyle(" button-pressed");
    else setHoverStyle(" button-released");
  }, [hover, hoverStyle]);

  const router = useRouter();

  const handleClick = () => {
    void router.push(props?.path);
  };

  return (
    <div
      className={style + hoverStyle}
      onClick={handleClick}
      onTouchStart={() => { setHover(true) }}
      onTouchEnd={() => { setHover(false) }}
    >
      {props?.label}
    </div>
  );
};

export default SocialButtons;


