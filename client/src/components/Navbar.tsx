import { NavLink as Link } from "react-router-dom";
import logo from "../assets/logo.png";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ showLinks = true }) {
  return (
    <nav className="flex justify-between items-center max-h-15 p-4 bg-[var(--secondary-200)] ">
      {/* <h1 className="text-xl font-bold">Finance Planner</h1> */}
      <img src={logo} alt="Logo" className="h-13 w-13" />
      {showLinks && (
        <div className="space-x-4">
          <Link
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "p-1 border-b-4 border-indigo-500" : "p-1"
            }
          >
            Dashboard
          </Link>
          <Link
            to="/profile"
            className={({ isActive }) =>
              isActive ? "p-1 border-b-4 border-indigo-500" : "p-1"
            }
          >
            Profile
          </Link>
          <ThemeToggle />
        </div>
      )}
    </nav>
  );
}
