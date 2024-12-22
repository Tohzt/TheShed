import * as React from "react"

const Huebound = () => {
  return (
    <div className="screen bg-slate-900 w-screen m-auto" >
      <iframe 
        className="m-auto unselectable border-2 border-slate-500 h-screen aspect-[9/16] max-h-full w-auto [image-rendering:pixelated] aspect[9/16]" 
        title='HueBound' 
        src="/arcade/huebound/index.html"
      ></iframe>
    </div >
  )
};

export default Huebound


