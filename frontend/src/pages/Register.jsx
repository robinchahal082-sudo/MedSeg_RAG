
import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";
import { apiRequest } from "../services/api";

const today = new Date().toISOString().split("T")[0];

export default function Register() {
  const [role, setRole] = useState("patient");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    date_of_birth: "",
    specialization: "",
    qualification: "",
    registration_number: "",
    password: "",
    confirm_password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle role change
  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setError("");
    setSuccess("");
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Password validation
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      let endpoint;
      let payload;

      if (role === "patient") {
        endpoint = "/auth/register/patient";

        payload = {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          contact_number: formData.contact_number.trim(),
          date_of_birth: formData.date_of_birth,
          password: formData.password,
          confirm_password: formData.confirm_password
        };

      } else {
        endpoint = "/auth/register/doctor";

        payload = {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          contact_number: formData.contact_number.trim(),
          specialization: formData.specialization.trim(),
          qualification: formData.qualification.trim(),
          registration_number: formData.registration_number.trim(),
          password: formData.password,
          confirm_password: formData.confirm_password
        };
      }

      const result = await apiRequest(
        endpoint,
        "POST",
        payload
      );

      if (role === "doctor") {
        setSuccess(
          "Doctor account created successfully! Your verification is pending admin approval."
        );
      } else {
        setSuccess(
          "Patient account created successfully! You can now login."
        );
      }

      console.log("Registration result:", result);

      // Reset form after successful registration
      setFormData({
        full_name: "",
        email: "",
        contact_number: "",
        date_of_birth: "",
        specialization: "",
        qualification: "",
        registration_number: "",
        password: "",
        confirm_password: ""
      });

    } catch (err) {
      setError(
        err.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card !max-w-2xl">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-7">

          <Activity className="text-teal-700" size={28}/>

          <span className="text-xl font-bold text-[#142B45]">
            MedSeg<span className="text-teal-700">-RAG</span>
          </span>

        </Link>

        <h1 className="text-3xl font-bold text-[#142B45]">
          Create Account
        </h1>

        <p className="text-slate-500 mt-2 mb-6">
          Join the MedSeg-RAG platform.
        </p>

        {/* Account Type */}
        <label className="font-semibold text-sm">
          Account Type
        </label>

        <select
          value={role}
          onChange={handleRoleChange}
          className="w-full border p-3 rounded-lg mt-2 mb-5 bg-white"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="text-sm font-semibold">
              Full Name
            </label>

            <input
              required
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full border p-3 rounded-lg mt-2"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold">
              Email
            </label>

            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full border p-3 rounded-lg mt-2"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="text-sm font-semibold">
              Contact Number
            </label>

            <input
              required
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              minLength={10}
              maxLength={15}
              placeholder="Enter phone number"
              className="w-full border p-3 rounded-lg mt-2"
            />
          </div>

          {/* Patient Fields */}
          {role === "patient" ? (

            <div>
              <label className="text-sm font-semibold">
                Date of Birth
              </label>

              <input
                required
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                max={today}
                className="w-full border p-3 rounded-lg mt-2"
              />
            </div>

          ) : (

            /* Doctor Fields */
            <>
              <div>
                <label className="text-sm font-semibold">
                  Specialization
                </label>

                <input
                  required
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. General Medicine"
                  className="w-full border p-3 rounded-lg mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Qualification
                </label>

                <input
                  required
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="e.g. MBBS, MD"
                  className="w-full border p-3 rounded-lg mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Medical Registration Number
                </label>

                <input
                  required
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  placeholder="Registration number"
                  className="w-full border p-3 rounded-lg mt-2"
                />
              </div>
            </>

          )}

          {/* Password */}
          <div>
            <label className="text-sm font-semibold">
              Password
            </label>

            <input
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              placeholder="Minimum 8 characters"
              className="w-full border p-3 rounded-lg mt-2"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-semibold">
              Confirm Password
            </label>

            <input
              required
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full border p-3 rounded-lg mt-2"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
              {success}

              <div className="mt-3">
                <Link
                  to="/login"
                  className="font-semibold underline"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 text-white p-3 rounded-lg font-semibold hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="text-center text-sm mt-6 text-slate-500">
          Already registered?{" "}

          <Link
            to="/login"
            className="text-teal-700 font-semibold"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}
