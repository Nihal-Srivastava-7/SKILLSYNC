import React, { useState } from "react";
import logo from "../../public/assets/logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/userService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [infoMessage, setInfoMessage] = useState(location.state?.message || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser({ email, password });

      setError("");

      // Save token and user info
      const data = response.data;
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      if (data.role) localStorage.setItem("userRole", data.role);

      // Redirect to the appropriate page based on role
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/resume");
      }
    } catch (err) {
      console.error(
        "[FRONTEND LOGIN] Error:",
        err.response?.data?.message || err.message
      );
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <>
      <header className="navbar">
        <nav className="navbar__nav">
          <img src={logo} alt="SkillSync Logo" className="navbar__logo" />

          <div className="navbar__buttons">
            <Link to="/" className="navbar__btn">
              Home
            </Link>
            <Link to="/signup" className="navbar__btn">
              Register
            </Link>
          </div>
        </nav>
      </header>
      <main className="login-section">
        <div className="login-box">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Login to continue your journey</p>

          {infoMessage && (
            <div className="mb-3 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
              {infoMessage}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="btn-primary">
              Login
            </button>
          </form>

          <p className="login-footer-text">
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
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

export default Login;
