import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees");
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(`/api/employees/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
          fetchEmployees();
        } else {
          alert(data.message);
        }
      } catch (err) {
        alert("Failed to delete employee");
      }
    }
  };

  const downloadQR = async (id, name) => {
    try {
      const response = await fetch(`/api/employees/${id}/qrcode`);
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
      alert("Failed to download QR code");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-800">
              Employee ID Card System
            </h1>
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {employees.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500">
              No employees found. Add your first employee!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employees.map((employee) => (
              <div
                key={employee._id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Employee Photo */}
                <div className="h-32 bg-slate-100">
                  {employee.photo ? (
                    <img
                      src={employee.photo}
                      alt={employee.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg
                        className="w-12 h-12"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Employee Info */}
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
    </div>
  );
}

export default AdminDashboard;
