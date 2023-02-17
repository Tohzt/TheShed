const Footer: React.FC<{ func: any; size: string }> = (props) => {
  const placement = "absolute bottom-0 w-screen rounded-t-[42px] "
  return (
    <div className={placement}>
      <div className={`${placement} h-[5vh] bg-zinc-900 bg-opacity-60 blur-sm`}></div>
      <div className={`${placement} ${props.size} bg-gradient-to-tl from-[#ef8018] to-[#ffcb24] flex flex-col`}>
        {props.func}
      </div>
    </div>
  );
};
export default Footer
/* 
*/
