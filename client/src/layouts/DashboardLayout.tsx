import React, { useState, useEffect, createContext } from "react";
import axios from "axios";
import { ENV } from "@/core/config";
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";
import SplashScreen from "@/components/splash/Splash";
import {
  NotificationProvider,
  useNotification,
} from "@/context/NotificationContext";

interface UserContextType {
  country: string;
  userMetadataLoading: boolean;
}

export const UserContext = createContext<UserContextType>({
  country: "",
  userMetadataLoading: true,
});

export default function DashboardLayout() {
  const notify = useNotification();
  const [showSplash, setShowSplash] = useState(
    () => !localStorage.getItem("splashShown")
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      localStorage.setItem("splashShown", "true");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const [country, setCountry] = useState("");
  const [userMetadataLoading, setUserMetadataLoading] = useState(true);

  const getUserMetadata = async () => {
    try {
      setUserMetadataLoading(true);
      const response = await axios.get(`${ENV.API_URL}/auth/user-metadata`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        const { data } = response.data;
        setCountry(data.country || "");
        setUserMetadataLoading(false);
      } else {
        setUserMetadataLoading(false);
        console.error("Failed to fetch user metadata");
      }
    } catch (error) {
      setUserMetadataLoading(false);
      console.error("Error fetching user metadata:", error);
      notify.error("An error occurred while fetching user metadata");
    }
  };

  useEffect(() => {
    getUserMetadata();
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <UserContext.Provider value={{ country, userMetadataLoading }}>
      <div>
        <Navbar />
        <main>
          <Outlet /> {/* This is where child routes will be rendered */}
        </main>
      </div>
    </UserContext.Provider>
  );
}
