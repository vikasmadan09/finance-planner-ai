import React from "react";
import "./Notification.css";

const typeStyles = {
  success: "notification success",
  error: "notification error",
  warning: "notification warning",
  info: "notification info",
};

export interface NotificationProps {
  id: number;
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  message,
  onClose,
}) => {
  return (
    <div className={typeStyles[type]}>
      <span>{message}</span>
      <button onClick={onClose}>&times;</button>
    </div>
  );
};
