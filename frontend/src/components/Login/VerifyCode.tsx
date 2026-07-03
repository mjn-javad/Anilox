import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClientAuth from "../../services/api-client_auth";
import MessageAlert from "../Shared/MessageAlert";
import InputField from "../Shared/InputField";

const VerifyCode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes

  // Get email from state or localStorage
  useEffect(() => {
    let userEmail = "";

    // Method 1: Get from state (preferred)
    if (location.state?.email) {
      userEmail = location.state.email;
      setEmail(userEmail);
      if (location.state.message) {
        setMessage(location.state.message);
      }
    }
    // Method 2: Get from localStorage (fallback)
    else {
      const storedEmail = localStorage.getItem("tempEmail");
      if (storedEmail) {
        userEmail = storedEmail;
        setEmail(storedEmail);
        setMessage("Verification code sent to your email");
      } else {
        setError("Email not found. Please register again");
        setTimeout(() => navigate("/register"), 2000);
        return;
      }
    }

    // Only auto-resend if explicitly instructed and not initial load
    // Remove automatic resend on page load - this was causing the error
  }, [location, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await apiClientAuth.post("/verify-code", {
        email: email,
        code: code,
      });

      setMessage(res.data.message || "Email verified successfully");

      // Clear temporary email from localStorage
      localStorage.removeItem("tempEmail");
      localStorage.removeItem("tempName");

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/", {
          state: {
            user: res.data.user,
            success: "Registration completed successfully",
          },
        });
      }, 1500);
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  // Format time to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container text-center my-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-4 max-w-md mx-auto"
      >
        <h2 className="text-2xl font-bold mb-4">Verify Code</h2>

        <p className="text-gray-600">
          Verification code sent to <strong>{email}</strong>.
          <br />
          Please enter the 6-digit code.
        </p>

        <InputField
          name="code"
          label="Verification Code"
          placeholder="123456"
          value={code}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCode(e.target.value.replace(/[^0-9]/g, ""))
          }
          required={true}
        />

        <div className="text-center text-sm text-gray-500">
          Time remaining: {formatTime(timer)}
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="bg-green-500 text-white py-2 rounded-xl hover:bg-green-400 transition-colors disabled:bg-green-300"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/register")}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back to Registration
        </button>

        {message && <MessageAlert message={message} type="success" />}

        {error && <MessageAlert message={error} type="error" />}
      </form>
    </div>
  );
};

export default VerifyCode;
