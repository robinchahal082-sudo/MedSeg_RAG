
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ShieldCheck } from "lucide-react";
import { checkBackend, apiRequest } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check backend connection
  useEffect(() => {
    checkBackend()
      .then(() => setBackendStatus("Connected"))
      .catch(() => setBackendStatus("Unavailable"));
  }, []);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await apiRequest(
        "/auth/login",
        "POST",
        {
          email: email.trim(),
          password: password
        }
      );

      // Verify selected account role
      if (result.user.role !== role) {
        throw new Error(
          `This account belongs to the ${result.user.role} role. Please select the correct role.`
        );
      }

      // Store JWT token
      sessionStorage.setItem(
        "access_token",
        result.access_token
      );

      // Store user information
      sessionStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      console.log("Logged-in user:", result.user);

      // Redirect according to user role
      if (result.user.role === "patient") {
        navigate("/patient/dashboard", { replace: true });

      } else if (result.user.role === "doctor") {
        navigate("/doctor/dashboard", { replace: true });

      } else if (result.user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });

      } else {
        throw new Error("Invalid account role.");
      }

    } catch (err) {
      setError(
        err.message || "Login failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center p-5">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 mb-8">

          <div className="bg-teal-700 text-white p-2 rounded-xl">
            <Activity size={24}/>
          </div>

          <span className="font-bold text-xl text-[#142B45]">
            MedSeg<span className="text-teal-700">-RAG</span>
          </span>

        </Link>

        {/* HEADING */}
        <h1 className="text-3xl font-bold text-[#142B45]">
          Welcome Back!
        </h1>

        <p className="text-slate-500 mt-2 mb-7">
          Login to access your medical document workspace.
        </p>

        {/* ROLE SELECTION */}
        <label className="font-semibold text-sm">
          Login as
        </label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded-lg p-3 mt-2 mb-5 bg-white"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Administrator</option>
        </select>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin}>

          {/* EMAIL */}
          <label className="text-sm font-semibold">
            Email Address
          </label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border rounded-lg p-3 mt-2 mb-5 outline-teal-600"
          />

          {/* PASSWORD */}
          <label className="text-sm font-semibold">
            Password
          </label>

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full border rounded-lg p-3 mt-2 mb-4 outline-teal-600"
          />

          {/* FORGOT PASSWORD */}
          <div className="text-right mb-6">

            <button
              type="button"
              className="text-teal-700 text-sm font-semibold"
              onClick={() =>
                setError("Forgot password functionality is coming soon.")
              }
            >
              Forgot Password?
            </button>

          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {success && (
            <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 mb-4 text-sm">
              {success}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 text-white p-3 rounded-lg font-semibold hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* REGISTER LINK */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}

          <Link
            to="/register"
            className="text-teal-700 font-semibold"
          >
            Register
          </Link>
        </p>

        {/* BACKEND STATUS */}
        <div className="mt-6 border-t pt-4 flex justify-between items-center text-xs">

          <span className="flex gap-2 items-center text-slate-500">
            <ShieldCheck size={16}/>
            Backend status
          </span>

          <span
            className={
              backendStatus === "Connected"
                ? "text-green-600"
                : "text-amber-600"
            }
          >
            {backendStatus}
          </span>

        </div>

      </div>

    </div>
  );
}
