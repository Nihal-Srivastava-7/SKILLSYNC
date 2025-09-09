import React from "react";
export default function Footer() {
  return (
    <footer className="bg-[#1E3A8A] text-gray-200 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-8">
        <h1 className="text-2xl font-bold text-sky-500 tracking-wide">
          SkillSync
        </h1>
        <p className="text-gray-300 mt-2 text-sm">
          Smarter Resumes • Better Jobs • Brighter Future
        </p>
        <div className="flex flex-col md:flex-row md:space-x-12 space-y-4 md:space-y-0 items-center">
          <a href="#" className="hover:text-sky-400 transition">
            About
          </a>
          <a href="#" className="hover:text-sky-400 transition">
            Features
          </a>
          <a href="#" className="hover:text-sky-400 transition">
            Pricing
          </a>
          <a href="#" className="hover:text-sky-400 transition">
            Contact
          </a>
        </div>
        <div className="h-[1px] bg-gray-600 w-full max-w-4xl"></div>
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} SkillSync. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
