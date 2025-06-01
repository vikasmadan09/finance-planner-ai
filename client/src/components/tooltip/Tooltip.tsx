import React from "react";
import "./Tooltip.styles.css"; // Assuming you have a CSS file for styling

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  text,
  position = "top",
}) => {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className={`tooltip-text tooltip-${position}`}>{text}</div>
    </div>
  );
};

export default Tooltip;
