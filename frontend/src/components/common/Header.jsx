import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const logo = "/assets/logo.png";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const adminEmail = "nihalsrivastava2323@gmail.com";
  const role = user?.role || localStorage.getItem("userRole");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    navigate("/");
    window.location.reload();
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { to: "/resume", label: "Resume" },
    { to: "/jobs", label: "Jobs" },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md bg-gradient-to-r from-[#1E3A8A] via-[#1E40AF] to-[#1F2937] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <nav className="h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="SkillSync Logo"
              className="h-10 w-10 rounded-full shadow-md"
            />
            <span className="text-white font-bold text-lg tracking-wide hidden sm:block">
              SkillSync
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `font-medium transition-colors duration-200 ${
                    isActive ? "text-white" : "text-gray-300 hover:text-sky-300"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Admin Link - Only for Admins */}
            {(user?.role === "admin" ||
              (user?.email || localStorage.getItem("userEmail")) ===
                adminEmail) && (
              <NavLink
                to="/admin"
                className="font-medium text-white hover:text-yellow-300"
              >
                Admin
              </NavLink>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 focus:outline-none"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
              >
                <div className="flex items-center gap-2">
                  <img
                    src="https://ui-avatars.com/api/?name=Profile&background=1e3a8a&color=fff"
                    alt="Profile Avatar"
                    className="h-9 w-9 rounded-full border-2 border-sky-400 shadow-md"
                  />
                  <span className="text-white font-medium hidden sm:inline">
                    Profile
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-200 ml-1 transform transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-lg shadow-xl py-2 z-50 ring-1 ring-black/5">
                  <NavLink
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                  >
                    Profile
                  </NavLink>
                  <NavLink
                    to="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                  >
                    Settings
                  </NavLink>
                  <button
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-blue-50"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-100 focus:outline-none"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1E3A8A]/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-4 space-y-3">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block font-medium transition-colors ${
                    isActive ? "text-white" : "text-gray-300 hover:text-sky-300"
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}

            {(user?.role === "admin" ||
              (user?.email || localStorage.getItem("userEmail")) ===
                adminEmail) && (
              <NavLink
                to="/admin"
                className="block font-medium text-yellow-300 hover:text-yellow-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </NavLink>
            )}

            <hr className="border-blue-800 my-2" />

            <NavLink
              to="/profile"
              className="block text-gray-200 hover:text-sky-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </NavLink>
            <NavLink
              to="/settings"
              className="block text-gray-200 hover:text-sky-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </NavLink>
            <button
              className="mt-2 text-red-400 hover:text-red-300"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
