import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ENV } from "@/core/config";
import { UserMetadata } from "@/components/UserMetadata";
import { useNotification } from "@/context/NotificationContext";

export default function Profile() {
  const navigate = useNavigate();
  const notify = useNotification();

  const handleLogout = async () => {
    await axios.post(
      `${ENV.API_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );
    localStorage.removeItem("splashShown");
    navigate("/");
  };

  const updatePassword = async () => {
    const newPassword = (
      document.querySelector("input[type='password']") as HTMLInputElement
    ).value;
    if (!newPassword) {
      notify.warning("Please enter a new password");
      return;
    }
    try {
      const response = await axios.post(
        `${ENV.API_URL}/auth/update-password`,
        { password: newPassword },
        { withCredentials: true }
      );
      if (response.status === 200) {
        notify.success("Password updated successfully");
        navigate("/");
      } else {
        notify.error("Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      notify.error("An error occurred while updating the password");
    }
  };

  return (
    <div>
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Profile</h2>
        <input
          type="password"
          className="w-full p-2 border rounded mb-4"
          placeholder="New Password"
        />
        <button
          onClick={updatePassword}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Update Password
        </button>
        <UserMetadata />
        <button
          onClick={handleLogout}
          className="w-full bg-gray-600 text-white p-2 rounded mt-4"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
