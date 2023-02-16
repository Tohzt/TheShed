import Link from "next/link";

const GoBack: React.FC = () => {
  const placement = "h-[4vh] absolute bottom-0 w-screen items-center justify-center rounded-t-full "
  return (
    <div className={placement}>
      <div className={`${placement}bg-zinc-900 bg-opacity-60 blur-sm -translate-y-2`}></div>
      <div className={`${placement}bg-zinc-600`}>
        <Link href="/">
          <div className="flex justify-center text-[hsl(280,100%,70%)]">
            Go Back
          </div>
        </Link>
      </div>
    </div>
  );
};
export default GoBack;
