import Link from "next/link";

const goBack = () => {
  return (
    <div className="bg-blue-800 flex items-center justify-center w-full h-full font-semibold text-slate-800">
      <Link href="/">
        Go Back
      </Link>
    </div>
  )
}

export default goBack
