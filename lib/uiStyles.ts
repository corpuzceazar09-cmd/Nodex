export const ui = {
  page: "flex h-dvh min-h-0 flex-col items-center justify-center gap-3 overflow-hidden px-6 py-5 max-[640px]:px-2 max-[640px]:py-2 max-[480px]:gap-2",
  button:
    "flex cursor-pointer select-none items-center justify-center gap-2 border-[3px] border-[#292235] bg-[#f4eddb] shadow-[inset_-3px_-3px_0_#d6c9a8,inset_3px_3px_0_#ffffff,3px_3px_0_#0c0c14] px-[1.1rem] py-[0.55rem] text-center font-bold uppercase tracking-[0.05em] text-[#292235] transition-[background,color,transform] duration-100 hover:bg-[#514097] hover:text-white active:translate-y-0.5 active:duration-[50ms] disabled:cursor-not-allowed disabled:opacity-[0.45] disabled:hover:bg-[#f4eddb] disabled:hover:text-[#292235] max-[480px]:px-[0.8rem] max-[480px]:py-2 max-[480px]:text-[0.85rem]",
  buttonPrimary:
    "!bg-[#514097] !shadow-[inset_-3px_-3px_0_#3c2f78,inset_3px_3px_0_#7a68c0,3px_3px_0_#0c0c14] !px-6 !py-[0.85rem] !text-[1.1rem] !text-white hover:!bg-[#3c2f78] hover:!text-white max-[480px]:!px-4 max-[480px]:!py-3 max-[480px]:!text-base",
  buttonGreen: "!bg-[#78c850]",
  buttonRed: "!bg-[#e86858]",
  chip: "border-2 border-[#292235] bg-white px-2 py-[0.15rem] text-[0.8rem] font-bold text-[#292235]",
  chipStreak: "!bg-[#e86858]",
  hint: "text-[0.78rem] opacity-75",
  table:
    "border-collapse font-mono [&_th]:h-8 [&_th]:w-[2.4rem] [&_th]:border-2 [&_th]:border-[#292235] [&_th]:bg-[#292235] [&_th]:text-center [&_th]:text-[0.75rem] [&_th]:font-bold [&_th]:text-white [&_td]:h-8 [&_td]:w-[2.4rem] [&_td]:border-2 [&_td]:border-[#292235] [&_td]:text-center [&_td]:text-[0.85rem] [&_td]:font-bold",
  tableOutput: "bg-[#514097] text-white",
  tableOutputHeader: "!bg-[#514097] text-white",
  cellClickable: "cursor-pointer bg-white hover:bg-[#eeeeff]",
  overlay:
    "fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4",
  modal:
    "flex w-full max-w-[30rem] flex-col items-center gap-3 border-[5px] border-[#292235] bg-[#f4eddb] p-5 text-center shadow-[6px_6px_0_#0c0c14]",
  modalCorrect: "!border-[#78c850]",
  modalWrong: "!border-[#e86858]",
  toast:
    "fixed bottom-8 left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 border-[3px] border-white bg-[#292235] px-4 py-[0.6rem] text-center text-[0.85rem] font-bold text-white",
  node: "flex h-[3.25rem] w-[3.25rem] cursor-pointer items-center justify-center border-[3px] border-[#292235] bg-[#8a8a8a] font-mono text-[0.75rem] font-bold text-[#292235] max-[480px]:h-[2.75rem] max-[480px]:w-[2.75rem] max-[480px]:text-[0.65rem]",
  nodeDone: "!bg-[#78c850]",
  nodeCurrent: "animate-pulse !bg-white outline outline-[3px] outline-[#514097]",
  nodeCurrentEffect: "animate-pulse outline outline-[3px] outline-[#514097]",
  nodeLocked: "cursor-not-allowed !bg-[#5a5a5a] text-[#9a9a9a]",
  nodeLockedEffect: "cursor-not-allowed text-[#9a9a9a]",
  nodeFinal: "!h-16 !w-16 !bg-[#e86858] max-[480px]:!h-[3.1rem] max-[480px]:!w-[3.1rem]",
  block:
    "flex cursor-grab select-none items-center justify-center border-[3px] border-[#292235] bg-[#efefef] px-[0.55rem] py-[0.35rem] text-center text-[0.72rem] font-bold uppercase hover:bg-[#e0e0ff]",
  blockSelected: "!bg-[#514097] text-white",
  slot:
    "flex min-h-14 min-w-[5.5rem] cursor-pointer items-center justify-center border-[3px] border-dashed border-[#292235] bg-white p-1 text-center text-[0.7rem] font-bold uppercase max-[480px]:min-h-12 max-[480px]:min-w-[4.5rem] max-[480px]:text-[0.62rem]",
  slotFilled: "!border-solid !bg-[#efefef]",
  slotTarget: "animate-pulse outline outline-[3px] outline-[#514097]",
  workbench:
    "relative w-full touch-none select-none overflow-hidden border-[3px] border-[#292235] bg-[#ececec] bg-[linear-gradient(#dcdcdc_1px,transparent_1px),linear-gradient(90deg,#dcdcdc_1px,transparent_1px)] bg-[size:26px_26px]",
  circuitNode:
    "absolute z-20 select-none border-[3px] border-[#292235] bg-[#e8dfc8] font-mono",
  ledOn: "shadow-[0_0_12px_3px_rgba(111,217,127,0.9)]",
  rowActive: "[&_td]:bg-[#fff2b8]",
  rowActiveOutput: "[&_td[data-output]]:bg-[#78c850] [&_td[data-output]]:text-[#292235]",
  dialogue:
    "min-h-28 border-[5px] border-[#292235] bg-[#f4eddb] p-4 shadow-[6px_6px_0_#0c0c14] text-base leading-[1.6] max-[480px]:min-h-24 max-[480px]:p-3 max-[480px]:text-[0.9rem]",
  cursor: "after:animate-pulse after:content-['_']",
  player:
    "flex flex-col gap-2 border-[3px] border-[#292235] bg-[#f4eddb] p-3 shadow-[inset_0_0_0_3px_#dcd7fc,4px_4px_0_#0c0c14]",
  playerRow: "flex flex-wrap gap-2",
  playerCaption: "text-[0.68rem] opacity-70",
  progress: "h-4 border-2 border-[#292235] bg-[#e5e5e5]",
  progressFill: "h-full bg-[#514097] transition-[width] duration-400 [transition-timing-function:ease]",
  sandboxToolbar:
    "flex w-full flex-wrap items-center gap-[0.4rem] border-[3px] border-[#292235] bg-[#e8dfc8] px-3 py-2",
  sandboxToolbarGap: "min-w-4 flex-1",
  sandboxZoom: "min-w-12 text-center text-[0.8rem] font-bold",
  sandboxLayout:
    "grid min-h-0 w-full flex-1 grid-cols-[250px_minmax(0,1fr)_320px] items-start gap-3 max-[1100px]:grid-cols-1 max-[1100px]:overflow-y-auto max-[1100px]:overscroll-contain",
  sandboxFullscreen:
    "fixed left-0 top-0 z-[1000] h-screen w-screen grid-cols-[minmax(0,1fr)] gap-0 bg-[#f5f5f5]",
  sandboxPanel:
    "flex max-h-[calc(100dvh-220px)] min-h-0 flex-col gap-[0.4rem] overflow-auto border-[3px] border-[#292235] bg-[#e8dfc8] px-[0.7rem] py-[0.6rem] max-[1100px]:max-h-[28dvh] [&_h3]:m-0 [&_h3]:text-center [&_h3]:text-[0.9rem] [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-[0.08em] [&_h4]:m-0 [&_h4]:mt-[0.4rem] [&_h4]:text-[0.75rem] [&_h4]:font-bold [&_h4]:uppercase [&_h4]:tracking-[0.06em]",
  sandboxPanelHidden: "hidden",
  sandboxGroupLabel: "text-[0.72rem] uppercase tracking-[0.08em] opacity-70",
  sandboxLibItem:
    "flex items-baseline justify-between border-2 border-[#292235] bg-[#f4eddb] px-[0.4rem] py-1 text-left font-bold uppercase [&_small]:text-[0.65rem] [&_small]:opacity-70 aria-pressed:bg-white aria-pressed:shadow-[inset_0_0_0_2px_#514097]",
  sandboxMonitor:
    "grid grid-cols-2 gap-1 text-[0.72rem]",
  sandboxDetailEmpty: "flex flex-col gap-[0.3rem] text-[0.78rem]",
  sandboxBoardWrap: "flex min-w-0 flex-col gap-[0.4rem]",
  sandboxBoardScroll:
    "max-h-[calc(100dvh-260px)] min-w-0 overflow-auto border-[3px] border-[#292235] bg-[#f5f5f5] p-[0.6rem] max-[1100px]:max-h-[40dvh]",
  sandboxBoardFullscreen:
    "!h-screen !max-h-screen !border-0 !p-4",
  sandboxBoardHint:
    "border-2 border-[#292235] bg-[#e8dfc8] px-2 py-1 text-center text-[0.8rem]",
  sandboxDetail: "flex flex-col gap-[0.4rem] [&_h4]:!m-0 [&_h4]:!text-[0.85rem]",
  sandboxPowered:
    "border-2 border-[#78c850] bg-[#f6fff8] px-[0.4rem] py-1 font-bold",
  sandboxUnpowered:
    "border-2 border-[#e86858] bg-[#fff7f7] px-[0.4rem] py-1 font-bold",
  sandboxPinTable:
    "[&_td]:px-[0.35rem] [&_td]:py-[0.2rem] [&_td]:!text-[0.72rem] [&_th]:px-[0.35rem] [&_th]:py-[0.2rem] [&_th]:!text-[0.72rem]",
  pinRowPower: "[&_td]:bg-[#fff5f5]",
  pinRowGround: "[&_td]:bg-[#f7f7f7]",
  pinRowInput: "[&_td]:bg-[#f6f9ff]",
  pinRowOutput: "[&_td]:bg-[#f6fff8]",
  pinRowHover: "[&_td]:shadow-[inset_0_0_0_2px_#514097]",
  sandboxGateRow:
    "flex justify-between border-2 border-[#292235] bg-white px-[0.4rem] py-[0.2rem] text-[0.78rem]",
  sandboxKey: "flex flex-wrap gap-[0.4rem] text-[0.75rem]",
  sandboxLinks: "mt-[0.4rem] flex flex-col gap-[0.35rem]",
} as const;
