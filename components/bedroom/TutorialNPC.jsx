"use client";

import { useEffect, useState } from "react";

export default function TutorialNPC({ x, y, visible = true, state = "idle", theme = "classic" }) {
  const [frame, setFrame] = useState(1);
  useEffect(() => {
    if (!visible) return;
    if (state === "idle") { setFrame(1); return; }
    const id = setInterval(() => setFrame(i => (i + 1) % 3), 150);
    return () => clearInterval(id);
  }, [visible, state]);
  if (!visible) return null;
  return (
    <div style={{position:"absolute",left:x+(state === "walking_away" ? frame*9 : 0),top:y+(state === "walking_away" ? frame*9 : 0),width:78,height:114,zIndex:22,
      opacity:state === "disappearing" ? .4 : 1}}>
      <div role="img" aria-label="NODEX tutorial guide" style={{width:78,height:114,
        backgroundImage:`url(/assets/bedroom/${theme}/characters/npc-guide-sheet.png)`,
        backgroundPosition:`${-frame * 78}px ${state === "walking_away" ? -228 : 0}px`,
        backgroundSize:"234px 456px",
        backgroundRepeat:"no-repeat",imageRendering:"pixelated",filter:"drop-shadow(0 4px 1px rgba(18,18,20,.3))"}} />
      {state === "idle" && <span style={{position:"absolute",top:-17,left:-3,color:"#fff8dc",fontSize:13,background:"#312539",padding:"2px 4px",whiteSpace:"nowrap",border:"1px solid #d5c9a7"}}>GUIDE</span>}
    </div>
  );
}
