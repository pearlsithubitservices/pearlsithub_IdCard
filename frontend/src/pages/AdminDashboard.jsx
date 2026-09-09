import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch, resolveUrl } from "../config/api";
import MessageDialog from "../components/MessageDialog";
import ConfirmDialog from "../components/ConfirmDialog";

function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState({ isOpen: false, type: "info", title: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, employeeId: null });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await apiFetch("/api/employees");
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError("Server returned an invalid response. It may be starting up.");
        return;
      }
      if (data.success) {
        setEmployees(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Server is taking too long to respond. It may be waking up — try again in a moment.");
      } else {
        setError("Failed to fetch employees. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({ isOpen: true, employeeId: id });
  };

  const confirmDelete = async () => {
    const id = confirmDialog.employeeId;
    setConfirmDialog({ isOpen: false, employeeId: null });
    try {
      const response = await apiFetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchEmployees();
      } else {
        setDialog({ isOpen: true, type: "error", title: "Error", message: data.message || "Failed to delete employee" });
      }
    } catch (err) {
      setDialog({ isOpen: true, type: "error", title: "Error", message: "Failed to delete employee" });
    }
  };

  const downloadQR = async (id, name) => {
    try {
      const response = await apiFetch(`/api/employees/${id}/qrcode`);
      const data = await response.json();
      if (data.success) {
        const link = document.createElement("a");
        link.href = data.data.qrCode;
        link.download = `qr-${name.replace(/\s+/g, "-").toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setDialog({ isOpen: true, type: "error", title: "Error", message: "Failed to download QR code" });
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading employees...</p>
          <p className="text-xs text-slate-400 mt-1">Backend may take a moment to wake up</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Employee ID Card System
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {employees.length} employee{employees.length !== 1 ? "s" : ""} registered
              </p>
            </div>
            <Link
              to="/admin/add"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              + Add Employee
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              onClick={() => { setError(null); setLoading(true); fetchEmployees(); }}
              className="shrink-0 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {employees.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No employees yet</h3>
            <p className="text-sm text-slate-500 mb-5">Get started by adding your first employee.</p>
            <Link
              to="/admin/add"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Employee
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employees.map((employee) => (
              <div
                key={employee._id}
                className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-200"
              >
                {/* Photo / Initials */}
                <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                  {employee.photo ? (
                    <img
                      src={resolveUrl(employee.photo)}
                      alt={employee.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary-400 select-none">
                        {getInitials(employee.name)}
                      </span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-slate-800 truncate">
                    {employee.name}
                  </h3>
                  <p className="text-xs text-primary-600 font-medium truncate">
                    {employee.designation}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {employee.department}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-1.5 mt-3">
                    <Link
                      to={`/employee/${employee._id}`}
                      target="_blank"
                      className="flex-1 text-center bg-slate-100 text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-200 text-xs font-medium transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => downloadQR(employee._id, employee.name)}
                      className="flex-1 bg-blue-50 text-blue-600 px-2 py-1.5 rounded-lg hover:bg-blue-100 text-xs font-medium transition-colors"
                    >
                      QR
                    </button>
                    <Link
                      to={`/admin/edit/${employee._id}`}
                      className="flex-1 text-center bg-amber-50 text-amber-600 px-2 py-1.5 rounded-lg hover:bg-amber-100 text-xs font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="flex-1 bg-red-50 text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-100 text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <MessageDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, employeeId: null })}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
      />
    </div>
  );
}

export default AdminDashboard;
