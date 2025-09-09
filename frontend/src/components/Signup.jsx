import React, { useState } from "react";
import logo from "../../public/assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { createUser } from "../services/userService";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    status: "student",
  });
  const [error, setError] = useState("");

  const Navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    createUser(form)
      .then((response) => {
        setError("");
        alert("Signup successful!");

        Navigate("/login");
      })
      .catch((error) => {
        setError(error.response.data.message);
      });
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
            <Link to="/login" className="navbar__btn">
              Login
            </Link>
          </div>
        </nav>
      </header>

      <main className="signup">
        <form className="signup__form" onSubmit={handleSubmit}>
          <h2 className="signup__heading">Create Your Account</h2>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="signup__input"
            required
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="signup__input"
            required
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="signup__input"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="signup__input"
            required
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="signup__select"
          >
            <option value="student">Student / Fresher</option>
            <option value="working">Working Professional</option>
          </select>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn-primary signup__submit">
            Sign Up
          </button>

          <p className="signup__login-link">
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>
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

export default Signup;
