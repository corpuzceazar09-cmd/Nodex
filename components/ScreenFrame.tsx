import type { ReactNode } from "react";

/**
 * The shared wireframe "screen": white outer card, thick blue frame,
 * optional red title bar — mirrors the frames in the wireframe document.
 */
export default function ScreenFrame({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`wf-screen ${className}`}>
      <div className="wf-screen-frame">
        {title ? <div className="wf-titlebar">{title}</div> : null}
        <div className="wf-content">{children}</div>
      </div>
    </div>
  );
}