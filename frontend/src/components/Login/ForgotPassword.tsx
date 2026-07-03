import React, { useState } from "react";
import apiClientAuth from "../../services/api-client_auth";
import { Link } from "react-router-dom";
import MessageAlert from "../Shared/MessageAlert";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await apiClientAuth.post("/forgot-password", { email });
      setMessage(res.data.message);
      setEmail("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container text-center my-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-4 max-w-md mx-auto"
      >
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>

        <p className="text-gray-600 mb-4">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <div className="flex flex-col gap-y-2">
          <label className="text-left">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-200 px-3 py-2 rounded-sm"
            placeholder="Enter your email"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-400 transition-colors disabled:bg-blue-300"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <Link
          to="/loginlogout"
          className="text-shadow-amber-50 opacity-25 hover:opacity-70 duration-100"
        >
          Back to Login
        </Link>

        {message && <MessageAlert message={message} type="success" />}

        {error && <MessageAlert message={error} type="error" />}
      </form>
    </div>
  );
};

export default ForgotPassword;
