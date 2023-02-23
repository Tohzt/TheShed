import * as React from "react"

const Mario = () => {
  return (
      <div className="screen bg-slate-900" >
        <iframe className="nes-aspect-ratio " title='Mario Bros' src="../../../arcade/mario/index.html" width='240px' height='360px'></iframe>
      </div >
  )
};

export default Mario

