import React, { useEffect, useState } from "react";
import axios from "axios";
import { ENV } from "@/core/config";
import { countries } from "@/pages/Login";
import { UserContext } from "@/layouts/DashboardLayout";
import { useNotification } from "@/context/NotificationContext";

export const UserMetadata: React.FC = () => {
  const notify = useNotification();
  const [newCountry, setNewCountry] = useState<string>("");
  const { userMetadataLoading, country } = React.useContext(UserContext);

  const updateCountry = async () => {
    if (!newCountry) {
      notify.info("Please select a country");
      return;
    }
    try {
      const response = await axios.post(
        `${ENV.API_URL}/auth/update-country`,
        { country: newCountry },
        { withCredentials: true }
      );
      if (response.status === 200) {
        window.location.reload();
      } else {
        notify.error("Failed to update country");
      }
    } catch (error) {
      console.error("Error updating country:", error);
      notify.error("An error occurred while updating the country");
    }
  };

  useEffect(() => {
    if (country) {
      setNewCountry(country);
    }
  }, [country, userMetadataLoading]);

  return (
    <>
      <select
        value={newCountry}
        onChange={(e) => setNewCountry(e.target.value)}
        className="w-full p-2 border rounded mb-4 mt-4"
      >
        <option value="">Select Country</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      <button
        onClick={updateCountry}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        Update Country
      </button>
    </>
  );
};
