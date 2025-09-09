import { useState, useEffect } from "react";
export function useAuth() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");
    return token && name && email ? { name, email, role } : null;
  });

  useEffect(() => {
    const syncUser = () => {
      const token = localStorage.getItem("token");
      const name = localStorage.getItem("userName");
      const email = localStorage.getItem("userEmail");
      const role = localStorage.getItem("userRole");
      setUser(token && name && email ? { name, email, role } : null);
    };
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  return { user, setUser };
}
