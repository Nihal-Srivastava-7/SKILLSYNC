import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./home.css";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../common/Loader";
import { useAuth } from "../../hooks/useAuth";
const logo = "/assets/logo.png";

const images = [
  "/assets/hero-img.png",
  "/assets/hero-img-3.png",
  "/assets/hero-img-2.png",
];

const overlayTexts = [
  {
    heading: "Build Smart Resumes",
    description: "Use AI to optimize your resume instantly and stand out.",
    button: "Start Now",
  },
  {
    heading: "Find Your Dream Job",
    description: "Get personalized job matches powered by real-time data.",
    button: "Explore Jobs",
  },
  {
    heading: "Track & Improve",
    description: "Monitor applications, get suggestions, and grow faster.",
    button: "Learn More",
  },
];

const Home = () => {
  const [loading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Prevent navigation to protected routes before login
  const handleProtectedNav = (route) => {
    if (!user) {
      // redirect to login and pass a message and target route
      navigate("/login", {
        state: {
          from: route,
          message: "Please login to access this section.",
        },
      });
      return;
    }
    navigate(route);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="SkillSync Logo"
              className="h-10 w-10 rounded-full"
            />
            <span className="text-white font-bold text-xl tracking-wide hidden sm:block">
              SkillSync
            </span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            {user ? (
              <>
                <button
                  className="text-white hover:text-blue-300 font-medium transition bg-transparent border-none"
                  onClick={() => handleProtectedNav("/resume")}
                >
                  Resume
                </button>
                <button
                  className="text-white hover:text-blue-300 font-medium transition bg-transparent border-none"
                  onClick={() => handleProtectedNav("/jobs")}
                >
                  Jobs
                </button>
                <Link
                  to="/profile"
                  className="text-white font-semibold hover:text-blue-300"
                >
                  {user.name}
                </Link>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userName");
                    localStorage.removeItem("userEmail");
                    window.location.reload();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-blue-300 font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-white hover:text-blue-300 font-medium transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main>
        {loading && <Loader />}
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4000 }}
          loop
          className="main-container"
        >
          {images.map((img, index) => {
            const overlay = overlayTexts[index] || {};
            const heading =
              typeof overlay.heading === "string" ? overlay.heading : "";
            const description =
              typeof overlay.description === "string"
                ? overlay.description
                : "";
            const buttonText =
              typeof overlay.button === "string" ? overlay.button : "";

            // Only allow navigation to protected routes if logged in
            let buttonRoute = "/";
            let buttonHandler = undefined;
            if (buttonText === "Start Now") {
              buttonRoute = user ? "/resume" : "#";
              buttonHandler = () => handleProtectedNav("/resume");
            }
            if (buttonText === "Explore Jobs") {
              buttonRoute = user ? "/jobs" : "#";
              buttonHandler = () => handleProtectedNav("/jobs");
            }
            if (buttonText === "Learn More") {
              buttonRoute = "/about";
              buttonHandler = true;
            }

            return (
              <SwiperSlide key={index}>
                <div className="hero-section">
                  <img src={img} alt={`Slide ${index}`} className="hero-img" />
                  <div className="hero-overlay">
                    <h2 className="overlay-heading">{heading}</h2>
                    <p className="overlay-description">{description}</p>
                    {buttonHandler ? (
                      <button
                        className="overlay-button"
                        onClick={buttonHandler}
                        disabled={!user && buttonText !== "Learn More"}
                      >
                        {buttonText}
                      </button>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </main>
      <footer className="footer">
        <div className="footer__content">
          <div>
            <img src={logo} alt="Logo" className="footer__logo" />
            <p className="footer__tagline">Empowering your job journey.</p>
          </div>
          <ul className="footer__links">
            <li>
              <a href="#">About</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Terms</a>
            </li>
          </ul>
          <div className="footer__socials">
            <p>Follow Us</p>
            <span>[FB] [X] [IN]</span>
          </div>
        </div>
        <p className="footer__copy">© 2025 SkillSync. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Home;
