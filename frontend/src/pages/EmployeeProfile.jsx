import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch, resolveUrl } from "../config/api";
import MessageDialog from "../components/MessageDialog";

function EmployeeProfile() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });
  const profileRef = useRef(null);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await apiFetch(`/api/employees/${id}`);
      const data = await response.json();
      if (data.success) {
        setEmployee(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch employee details");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: employee.name,
      text: `${employee.name} - ${employee.designation}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setDialog({
          isOpen: true,
          type: "success",
          title: "Success",
          message: "Link copied to clipboard!",
        });
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setDialog({
          isOpen: true,
          type: "error",
          title: "Error",
          message: "Failed to share",
        });
      }
    }
  };

  const handleDownload = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(profileRef.current, {
        backgroundColor: "#E8E0F0",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `${employee.name.replace(/\s+/g, "-").toLowerCase()}-id-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      setDialog({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to download card",
      });
    }
  };

  const handleQRClick = async () => {
    try {
      const response = await apiFetch(`/api/employees/${id}/qrcode`);
      const data = await response.json();
      if (data.success) {
        setQrCodeUrl(data.data.qrCode);
        setShowQRModal(true);
      }
    } catch (err) {
      setDialog({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to load QR code",
      });
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.download = `qr-${employee.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E0F0] flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-[#E8E0F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600 mb-4">
            {error || "Employee not found"}
          </p>
          <Link
            to="/"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E0F0] flex flex-col items-center py-8 px-4">
      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white p-3 rounded-xl border border-slate-100 mb-3">
                <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Scan to view profile
              </p>
              <button
                onClick={handleDownloadQR}
                className="w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-900 transition-colors font-medium text-sm"
              >
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div
        ref={profileRef}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Logo Section */}
        <div className="py-6 justify-center flex bg-gradient-to-r from-primary-50 to-primary-100">
          <img
            src="/logo.png"
            alt="Pearls IT Hub"
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Employee Details */}
          <div className="mb-6 text-center">
            {employee.employeeId && (
              <p className="text-xs font-medium text-slate-400 mb-1">
                ID: {employee.employeeId}
              </p>
            )}
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              {employee.designation}
            </p>
            <h1 className="text-3xl font-bold text-primary-700">
              {employee.name}
            </h1>
          </div>

          {/* Photo */}
          <div className="mb-6">
            <div className="w-48 h-56 rounded-xl overflow-hidden shadow-md mx-auto ring-4 ring-primary-100">
              {employee.photo ? (
                <img
                  src={resolveUrl(employee.photo)}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-slate-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Department & Education */}
          <div className="text-center mb-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
              {employee.department}
            </h2>
            {employee.education && (
              <p className="text-sm text-slate-500 uppercase">
                {employee.education}
              </p>
            )}
            {(employee.monthFrom ||
              employee.yearFrom ||
              employee.monthTo ||
              employee.yearTo) && (
              <p className="text-sm text-slate-400 mt-1">
                {employee.monthFrom && employee.yearFrom
                  ? `${employee.monthFrom} ${employee.yearFrom}`
                  : employee.yearFrom || ""}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200 mb-4"></div>

          {/* Contact Links */}
          <div className="space-y-0 mb-6">
            {employee.linkedin && (
              <a
                href={employee.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors px-2 rounded-lg"
              >
                <span className="text-sm font-medium text-slate-700 uppercase tracking-wider">
                  LinkedIn
                </span>
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}

            {employee.portfolio && (
              <a
                href={employee.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors px-2 rounded-lg"
              >
                <span className="text-sm font-medium text-slate-700 uppercase tracking-wider">
                  Portfolio
                </span>
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}

            {employee.email && (
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center justify-between py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors px-2 rounded-lg"
              >
                <span className="text-sm font-medium text-slate-700 uppercase tracking-wider">
                  Email
                </span>
                <svg
                  className="w-4 h-4 text-slate-400"
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
              </a>
            )}

            {employee.phone && (
              <a
                href={`tel:${employee.phone}`}
                className="flex items-center justify-between py-3 hover:bg-slate-50 transition-colors px-2 rounded-lg"
              >
                <span className="text-sm font-medium text-slate-700 uppercase tracking-wider">
                  Phone
                </span>
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </a>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all text-slate-600 text-xs font-medium"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all text-slate-600 text-xs font-medium"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </button>
            <button
              onClick={handleQRClick}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all text-slate-600 text-xs font-medium whitespace-nowrap"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              QR Code
            </button>
          </div>
        </div>
      </div>

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

export default EmployeeProfile;
