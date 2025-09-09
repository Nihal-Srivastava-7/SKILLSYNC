import React, { useEffect, useState } from "react";
import Loader from "../common/Loader";
import { getUsers, getAdminResumes } from "../../services/userService";
import { useToast } from "../common/Toast";
import { useAuth } from "../../hooks/useAuth";

/* Admin Panel - fetch users and resumes, show analytics */
export default function AdminPanel() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [uRes, rRes] = await Promise.all([getUsers(), getAdminResumes()]);
        setUsers(uRes.data || []);
        setResumes(rRes.data || []);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to load admin data";
        setError(msg);
        showToast({ message: msg, type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!user) return null;
  if (loading) return <Loader />;

  const totalUsers = users.length;
  const totalResumes = resumes.length;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      {error && <div className="mb-3 text-red-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-gray-500">Total users</div>
          <div className="text-2xl font-semibold">{totalUsers}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Total resumes</div>
          <div className="text-2xl font-semibold">{totalResumes}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Quick actions</div>
          <div className="mt-2">
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={() =>
                showToast({
                  message: "Export not implemented yet",
                  type: "info",
                })
              }
            >
              Export (TBD)
            </button>
          </div>
        </div>
      </div>

      <section className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-600">
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id || u.email} className="border-t">
                  <td className="py-2 px-3">{u.name || "-"}</td>
                  <td className="py-2 px-3 break-all">{u.email}</td>
                  <td className="py-2 px-3">{u.role || "user"}</td>
                  <td className="py-2 px-3">
                    {new Date(
                      u.createdAt || u._createdAt || Date.now()
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Resumes</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-600">
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Template</th>
                <th className="py-2 px-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {resumes.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="py-2 px-3">
                    {r.user?.name || r.personal?.fullName || "-"}
                  </td>
                  <td className="py-2 px-3 break-all">
                    {r.user?.email || r.personal?.email || "-"}
                  </td>
                  <td className="py-2 px-3">{r.template || "-"}</td>
                  <td className="py-2 px-3">
                    {new Date(r.updatedAt || r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
