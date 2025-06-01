import { useState, useEffect } from "react";
import axios from "axios";
import { ENV } from "@/core/config";
import "./MovingBanner.css";

interface Forecast {
  next_month: string;
  next_six_month: string;
  next_year: string;
}

const MovingBanner = () => {
  const [forecast, setForecast] = useState<Forecast | undefined>();

  useEffect(() => {
    const fetchForeCaste = async () => {
      try {
        const response = await axios.get(`${ENV.API_URL}/forecast/monthly`, {
          withCredentials: true,
        });
        const { data } = response;
        setForecast(data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchForeCaste();
  }, []);

  return (
    <div className="banner-wrapper">
      <div className="banner-track">
        <div className="banner-item">
          <span className="banner-text">
            🔮 next month’s expenses — estimated at {forecast?.next_month}{" "}
            &nbsp;&nbsp;&nbsp; 📈 Your next 6-month spending could reach{" "}
            {forecast?.next_six_month} &nbsp;&nbsp;&nbsp; 🧾 Plan ahead! You
            might spend {forecast?.next_year} in the next year
            &nbsp;&nbsp;&nbsp; ⏳ Don’t overspend
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovingBanner;
