"use client";

import { useEffect, useState } from "react";

export default function MobileControls({ onMove, onInteract }) {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)');
    const update = () => setIsTouch(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  if (!isTouch) return null;

  function control(direction, glyph) {
    return (
      <button type="button" key={direction} aria-label={`Move ${direction}`}
        onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); onMove(direction, true); }}
        onPointerUp={e => { e.preventDefault(); onMove(direction, false); }}
        onPointerCancel={() => onMove(direction, false)}
        onLostPointerCapture={() => onMove(direction, false)}
        style={{width:50,height:50,border:"2px solid #221b26",background:"#e8e6dd",
          color:"#16131e",fontSize:22,fontWeight:900,touchAction:"none"}}>{glyph}</button>
    );
  }
  return (
    <div style={{position:"fixed",bottom:14,left:14,zIndex:100,touchAction:"none"}}>
      <div style={{display:"flex",justifyContent:"center"}}>{control("up","▲")}</div>
      <div style={{display:"flex",gap:2}}>
        {control("left","◀")}{control("down","▼")}{control("right","▶")}
      </div>
      <button type="button" onClick={onInteract} style={{marginTop:8,marginLeft:54,width:58,height:58,
        background:"#233cbe",color:"white",fontWeight:900,border:"2px solid #e5e8ff",touchAction:"none"}}>E</button>
    </div>
  );
}
