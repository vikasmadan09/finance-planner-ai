import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { ENV } from "@/core/config";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { useNotification } from "@/context/NotificationContext";

export const countries = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
  "Ireland",
];

export const Login = () => {
  const notify = useNotification();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    country: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      username,
      password,
      // country
    } = formData;
    setIsLoading(true);
    axios(`${ENV.API_URL}/auth/login`, {
      method: "POST",
      data: {
        email: username,
        password,
        // country,
      },
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    })
      .then(() => {
        notify.success("Login successful");
        setTimeout(() => {
          navigate("/dashboard");
          setIsLoading(false);
        }, 3000);
      })
      .catch(() => {
        setIsLoading(false);
        notify.error("Login failed");
      });
  };

  return (
    <>
      <Navbar showLinks={false} />
      <div className="min-h-screen flex items-center justify-center shadow ">
        <form className="p-8 shadow-md rounded w-80" onSubmit={handleLogin}>
          <h2 className="text-2xl mb-6 text-center font-bold">Login</h2>
          <input
            name="username"
            onChange={handleChange}
            className="mb-4 w-full p-2 border rounded"
            placeholder="Username"
            required
          />
          <div className="relative inline-block w-full">
            <input
              name="password"
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              className="mb-4 w-full p-2 border rounded"
              placeholder="Password"
              required
            />
            <button
              onClick={togglePasswordVisibility}
              type="button"
              className="absolute right-3 top-3"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          {/* <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="mb-4 w-full border rounded p-2"
            required
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select> */}
          <button
            className="w-full bg-[var(--accent-600)] text-white p-2 rounded hover:bg-[var(--accent-700)] cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Login
          </button>
        </form>
      </div>
    </>
  );
};
