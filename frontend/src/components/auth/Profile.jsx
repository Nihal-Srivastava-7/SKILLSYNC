import React from "react";
import { useAuth } from "../../hooks/useAuth";
export default function Profile() {
  const { user } = useAuth();
  if (!user) return <div className="text-center py-10">Please login.</div>;
  return (
    <main className="max-w-2xl mx-auto px-2 sm:px-4 py-8">
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <span className="bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-3xl mb-2">
          {user.name ? user.name[0].toUpperCase() : "U"}
        </span>
        <div className="font-semibold text-lg">{user.name}</div>
        <div className="text-gray-500">{user.email}</div>
        {/* ...add more profile info and update form here... */}
      </div>
    </main>
  );
}
