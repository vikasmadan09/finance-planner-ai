import React, { createContext, useContext, useState, useCallback } from "react";
import { Notification } from "../components/notification";

const NotificationContext = createContext({
  success: (msg: string) => {},
  error: (msg: string) => {},
  warning: (msg: string) => {},
  info: (msg: string) => {},
});

export const useNotification = () => useContext(NotificationContext);

type NotificationType = {
  id: number;
  type: "success" | "error" | "warning" | "info";
  message: string;
};

export const NotificationProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const removeNotification = (id: number) => {
    setNotifications((n) => n.filter((note) => note.id !== id));
  };

  const notify = useCallback((type: any, message: any) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);

    setTimeout(() => removeNotification(id), 5000);
  }, []);

  const contextValue = {
    success: (msg: string) => notify("success", msg),
    error: (msg: string) => notify("error", msg),
    warning: (msg: string) => notify("warning", msg),
    info: (msg: string) => notify("info", msg),
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="notification-container">
        {notifications.map((note) => (
          <Notification
            key={note.id}
            {...note}
            onClose={() => removeNotification(note.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
