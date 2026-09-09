import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../config/api";
import MessageDialog from "../components/MessageDialog";

function AddEmployee() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    designation: "",
    department: "",
    team: "",
    education: "",
    monthFrom: "",
    yearFrom: "",
    monthTo: "",
    yearTo: "",
    linkedin: "",
    portfolio: "",
    email: "",
    phone: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [dialog, setDialog] = useState({ isOpen: false, type: "info", title: "", message: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      // Append photo if selected
      if (photo) {
        formDataToSend.append("photo", photo);
      }

      const response = await apiFetch("/api/employees", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        navigate("/");
      } else {
        setDialog({ isOpen: true, type: "error", title: "Error", message: data.message || "Failed to add employee" });
      }
    } catch (err) {
      setDialog({ isOpen: true, type: "error", title: "Error", message: "Failed to add employee. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-base font-semibold text-slate-800">
                Add New Employee
              </h1>
            </div>
            <div className="flex gap-2">
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                form="employee-form"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <form id="employee-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Photo & Basic */}
            <div className="lg:col-span-1 space-y-4">
              {/* Photo Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <label className="block text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">
                  Photo
                </label>
                <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 relative group">
                  {photoPreview ? (
                    <>
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          Change Photo
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="w-10 h-10 mx-auto text-slate-300 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs text-slate-400">
                        Upload photo
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full mt-3 text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                />
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-4">
              {/* Quick Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <label className="block text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">
                  Quick Info
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="px-3 py-2.5 bg-slate-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400"
                      placeholder="ID Number"
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="px-3 py-2.5 bg-slate-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400 col-span-3"
                      placeholder="Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      required
                      className="px-3 py-2.5 bg-slate-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400"
                      placeholder="Designation"
                    />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      className="px-3 py-2.5 bg-slate-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400"
                      placeholder="Department"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <input
                      type="text"
                      name="monthFrom"
                      value={formData.monthFrom}
                      onChange={handleChange}
                      className="px-3 py-2.5 bg-slate-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400"
                      placeholder="Month"
                    />
                    <input
                      type="text"
                      name="yearFrom"
                      value={formData.yearFrom}
                      onChange={handleChange}
                      className="px-3 py-2.5 bg-slate-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400"
                      placeholder="Year"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Contact
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      Portfolio
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <MessageDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
      />
    </div>
  );
}

export default AddEmployee;
