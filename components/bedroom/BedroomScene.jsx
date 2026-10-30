"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ROOM_OBJECTS, STAGE_WIDTH, STAGE_HEIGHT, SOLID_SCENE_AREAS, WALKABLE_POLYGON } from "@/data/isoBedroomObjects";
import { TUTORIAL_DIALOGUE } from "@/data/tutorialDialogue";
import { getSavedTheme } from "@/utils/themeStorage";
import { usePlayerMovement } from "@/hooks/usePlayerMovement";
import { useInteraction } from "@/hooks/useInteraction";
import { isBedroomPositionBlocked } from "@/utils/bedroomGeometry";
import { completeTutorial, resetTutorial } from "@/utils/roomStorage";
import PlayerCharacter from "./PlayerCharacter";
import TutorialNPC from "./TutorialNPC";
import DialogueBox from "./DialogueBox";
import InteractionPrompt from "./InteractionPrompt";
import TelevisionMenu from "./TelevisionMenu";
import BookshelfMenu from "./BookshelfMenu";
import DrawerInteraction from "./DrawerInteraction";
import ComputerBoot from "./ComputerBoot";
import BedInteraction from "./BedInteraction";
import MobileControls from "./MobileControls";

const playerDimensions = { width: 78, height: 114 };
const guidePosition = { x: 690, y: 505 };

export default function BedroomScene() {
  const [gameState, setGameState] = useState("BEDROOM_IDLE");
  const [showTutorial, setShowTutorial] = useState(false);
  const [playerGender, setPlayerGender] = useState("boy");
  const [playerProfile, setPlayerProfile] = useState({ name: "Player", gender: "boy" });
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const [npcState, setNpcState] = useState("idle");
  const [npcVisible, setNpcVisible] = useState(true);
  const [tvVisible, setTvVisible] = useState(false);
  const [bookshelfVisible, setBookshelfVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [computerBootVisible, setComputerBootVisible] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [theme, setTheme] = useState("classic");
  const [viewport, setViewport] = useState({ width: 1200, height: 780 });
  const [assetReady, setAssetReady] = useState(false);
  const lastPosition = useRef({ x: 630, y: 646 });
  const departureTimers = useRef([]);

  useEffect(() => {
    setTheme(getSavedTheme());
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAssetReady(false);
    const art = new Image();
    art.onload = () => { if (!cancelled) setAssetReady(true); };
    art.onerror = () => { console.error('NODEX bedroom background could not be loaded'); if (!cancelled) setAssetReady(true); };
    art.src = `/assets/bedroom/${theme}/room-iso.png`;
    return () => { cancelled = true; };
  }, [theme]);

  const checkPlayerCollision = useCallback((x, y) =>
    isBedroomPositionBlocked(x, y, ROOM_OBJECTS, SOLID_SCENE_AREAS, WALKABLE_POLYGON), []);

  const movementLocked = gameState !== "BEDROOM_IDLE" || isResting;
  const { position, setPosition, direction, isMoving } = usePlayerMovement(
    630, 646, movementLocked, checkPlayerCollision, 240
  );

  const { activeObject, interactionPrompt } = useInteraction(
    position, playerDimensions, gameState !== "BEDROOM_IDLE", ROOM_OBJECTS
  );

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("nodex_player_profile") || "null");
      if (saved && typeof saved.name === "string" && saved.name.trim()) {
        setPlayerProfile(saved);
        setPlayerGender(saved.gender === "girl" ? "girl" : "boy");
      }
    } catch { /* Invalid profile is ignored without affecting progress. */ }
    // Consistent with the accepted flow: guide begins every fresh bedroom launch.
    setTutorialIndex(0);
    setNpcState("idle");
    setNpcVisible(true);
    setShowTutorial(true);
    setGameState("NPC_DIALOGUE");
    return () => departureTimers.current.forEach(clearTimeout);
  }, []);

  const handleWakeUp = useCallback(() => {
    setIsResting(false);
    setGameState("BEDROOM_IDLE");
    // Put player at the accessible position where they started resting.
    setPosition(lastPosition.current);
  }, [setPosition]);

  const handleInteraction = useCallback(() => {
    if (isResting) { handleWakeUp(); return; }
    if (!activeObject || gameState !== "BEDROOM_IDLE") return;
    switch (activeObject.type) {
      case "computer": setGameState("COMPUTER_BOOT"); setComputerBootVisible(true); break;
      case "tv": setGameState("TV_MENU"); setTvVisible(true); break;
      case "bookshelf": setGameState("BOOKSHELF_MENU"); setBookshelfVisible(true); break;
      case "drawer": setGameState("DRAWER_OPEN"); setDrawerVisible(true); break;
      case "bed":
        lastPosition.current = { ...position };
        setGameState("BED_RESTING");
        setIsResting(true);
        break;
    }
  }, [activeObject, gameState, handleWakeUp, isResting, position]);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.repeat) return;
      const target = e.target;
      if (target instanceof HTMLElement && target.closest('input,textarea,select')) return;
      if (gameState === "NPC_DIALOGUE") return;
      if (gameState === "BED_RESTING" && ["e", "E", "Enter", " ", "Escape"].includes(e.key)) {
        e.preventDefault(); handleWakeUp(); return;
      }
      if (gameState === "BEDROOM_IDLE" && ["e", "E", "Enter", " "].includes(e.key)) {
        e.preventDefault(); handleInteraction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, handleInteraction, handleWakeUp]);

  const handleTutorialNext = () => setTutorialIndex(i => i + 1);
  const handleGenderSelection = gender => {
    setPlayerGender(gender);
    setPlayerProfile(previous => ({ ...previous, gender }));
    setTutorialIndex(3);
  };
  const handleNameEntry = name => {
    setPlayerProfile(previous => ({ ...previous, name }));
    setTutorialIndex(4);
  };
  const handleNameConfirmation = confirmed => {
    if (!confirmed) { setTutorialIndex(3); return; }
    const profile = { name: playerProfile.name, gender: playerGender };
    try { localStorage.setItem("nodex_player_profile", JSON.stringify(profile)); } catch {}
    setTutorialIndex(5);
  };
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setNpcState("walking_away");
    departureTimers.current.push(setTimeout(() => {
      setNpcState("disappearing");
      departureTimers.current.push(setTimeout(() => {
        setNpcVisible(false);
        completeTutorial();
        setGameState("BEDROOM_IDLE");
      }, 450));
    }, 420));
  };
  const replayIntroduction = () => {
    departureTimers.current.forEach(clearTimeout);
    departureTimers.current = [];
    resetTutorial();
    setNpcState("idle"); setNpcVisible(true);
    setTutorialIndex(0); setShowTutorial(true); setGameState("NPC_DIALOGUE");
  };

  const handleMobileMove = (direction, down) => {
    const key = { up:"ArrowUp", down:"ArrowDown", left:"ArrowLeft", right:"ArrowRight" }[direction];
    if (key) window.dispatchEvent(new KeyboardEvent(down ? "keydown" : "keyup", { key, bubbles:true }));
  };
  const scale = Math.min(viewport.width / STAGE_WIDTH, viewport.height / STAGE_HEIGHT, 1.35);

  return (
    <div style={{ position:"relative",width:"100vw",height:"100dvh",background:"#11131d",overflow:"hidden",fontFamily:"monospace" }}>
      <div style={{ position:"absolute",width:STAGE_WIDTH*scale,height:STAGE_HEIGHT*scale,
        left:"50%",top:"50%",transform:"translate(-50%,-50%)" }}>
        <div style={{ position:"relative",width:STAGE_WIDTH,height:STAGE_HEIGHT,
          transform:`scale(${scale})`,transformOrigin:"top left",overflow:"hidden" }}>
          <img src={`/assets/bedroom/${theme}/room-iso.png`} alt="NODEX original angled pixel-art bedroom"
            draggable={false} style={{position:"absolute",left:0,top:0,width:STAGE_WIDTH,height:STAGE_HEIGHT,imageRendering:"pixelated"}} />
          {!assetReady && <div style={{position:"absolute",left:"42%",top:"43%",color:"#fff7dc",fontSize:24}}>Loading bedroom...</div>}
          {activeObject && gameState === "BEDROOM_IDLE" && (
            <svg width={STAGE_WIDTH} height={STAGE_HEIGHT} viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
              style={{position:"absolute",left:0,top:0,pointerEvents:"none"}} aria-hidden="true">
              <polygon points={activeObject.outline} fill="#fff6a3" fillOpacity="0.08"
                stroke="#fff8bd" strokeWidth="4" strokeDasharray="10 6" />
            </svg>
          )}
          {!isResting ? (
            <PlayerCharacter x={position.x} y={position.y} direction={direction}
              isMoving={isMoving} theme={theme} gender={playerProfile.gender} />
          ) : (
            <div aria-label="Player resting in bed" role="img" style={{position:"absolute",left:255,top:465,width:82,height:114,zIndex:22,
              overflow:"hidden",borderRadius:12,filter:"drop-shadow(0 3px 2px #30435e)"}}>
              <div style={{position:"absolute",left:4,top:0,width:78,height:114,
                backgroundImage:`url(/assets/bedroom/${theme}/characters/player-${playerProfile.gender === "girl" ? "girl" : "boy"}-sheet.png)`,
                backgroundPosition:"-78px 0px",backgroundSize:"234px 456px",imageRendering:"pixelated"}} />
            </div>
          )}
          {isResting && <img src={`/assets/bedroom/${theme}/bed-quilt-foreground.png`} alt="" draggable={false}
            style={{position:"absolute",left:205,top:525,width:197,height:155,zIndex:23,pointerEvents:"none",imageRendering:"pixelated"}} />}
          <TutorialNPC x={guidePosition.x} y={guidePosition.y} visible={npcVisible} state={npcState} theme={theme} />
          <InteractionPrompt prompt={interactionPrompt} x={position.x+39} y={position.y}
            visible={!!activeObject && gameState === "BEDROOM_IDLE" && !isResting} />
        </div>
      </div>
      <div style={{position:"fixed",top:12,left:12,zIndex:80,padding:"9px 13px",color:"#292032",
        background:"#f3eedc",border:"3px solid #352c3b",boxShadow:"3px 3px 0 #111",fontSize:12}}>
        WASD / Arrows: Move &nbsp; · &nbsp; E / Enter / Space: Interact
      </div>
      {gameState === "BEDROOM_IDLE" && !npcVisible && (
        <button type="button" onClick={replayIntroduction}
          style={{position:"fixed",top:12,right:16,zIndex:80,padding:"10px 14px",color:"#292032",
          background:"#f3eedc",border:"3px solid #352c3b",fontFamily:"monospace",cursor:"pointer"}}>
          Replay NPC Introduction
        </button>
      )}
      <DialogueBox
        dialogue={TUTORIAL_DIALOGUE.map(line => ({ ...line, text:line.text.replaceAll("{name}",playerProfile.name) }))}
        currentIndex={tutorialIndex} onNext={handleTutorialNext} onComplete={handleTutorialComplete}
        visible={gameState === "NPC_DIALOGUE" && showTutorial}
        nameValue={playerProfile.name === "Player" ? "" : playerProfile.name}
        selectedGender={playerGender} onGender={handleGenderSelection}
        onName={handleNameEntry} onConfirm={handleNameConfirmation}
      />
      <TelevisionMenu visible={tvVisible} onClose={() => { setTvVisible(false);setGameState("BEDROOM_IDLE"); }} />
      <BookshelfMenu visible={bookshelfVisible} onClose={() => { setBookshelfVisible(false);setGameState("BEDROOM_IDLE"); }} />
      <DrawerInteraction visible={drawerVisible} onClose={() => { setDrawerVisible(false);setGameState("BEDROOM_IDLE"); }} />
      <ComputerBoot visible={computerBootVisible} onComplete={() => setComputerBootVisible(false)} />
      <BedInteraction visible={isResting} onWakeUp={handleWakeUp} isResting />
      <MobileControls onMove={handleMobileMove} onInteract={handleInteraction} />
    </div>
  );
}
