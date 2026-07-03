import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClientAuth from "../../services/api-client_auth";
import MessageAlert from "../Shared/MessageAlert";
import InputField from "../Shared/InputField";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get token and email from URL
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");
    const emailParam = params.get("email");

    if (!tokenParam || !emailParam) {
      setError("Invalid reset link");
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await apiClientAuth.post("/reset-password", {
        token,
        email,
        newPassword: password,
        confirmPassword,
      });

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/loginlogout");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
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
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>

        <div className="flex flex-col gap-y-2">
          <label className="text-left">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-200 px-3 py-2 rounded-sm"
            placeholder="Enter new password"
            required
          />
        </div>

        <InputField
          name="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          placeholder="Confirm new password"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
          required={true}
          type="password"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white py-2 rounded-xl hover:bg-green-400 transition-colors disabled:bg-green-300"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {message && <MessageAlert message={message} type="success" />}

        {error && <MessageAlert message={error} type="error" />}
      </form>
    </div>
  );
};

export default ResetPassword;
