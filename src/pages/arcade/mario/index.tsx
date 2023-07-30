import * as React from "react"

const Mario = () => {
  return (
    <div className="screen bg-slate-900" >
      <iframe className="unselectable w-screen h-screen" title='Mario Bros' src="../../../arcade/mario/index.html"></iframe>
    </div >
  )
};

export default Mario

