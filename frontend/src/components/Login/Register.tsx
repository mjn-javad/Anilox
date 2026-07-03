import React, { FormEvent, useState } from "react";
import apiClientAuth from "../../services/api-client_auth";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../Shared/InputField";
import MessageAlert from "../Shared/MessageAlert";

interface RegisterForm {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Send registration request
      const res = await apiClientAuth.post("/register", {
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      // Save email in localStorage for use in verification page
      localStorage.setItem("tempEmail", form.email);
      localStorage.setItem("tempName", form.name);

      setMessage(
        res.data.message ||
          "Registration successful. Sending verification code...",
      );

      // Redirect to verification page after 1 second
      setTimeout(() => {
        navigate("/verify", {
          state: {
            email: form.email,
            message: "Verification code has been sent to your email",
          },
        });
      }, 1500);
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.message || "Registration error");
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
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <InputField
          name="name"
          label="Name"
          value={form.name}
          onChange={handleChange}
          required={true}
        />
        <InputField
          name="username"
          label="Username"
          value={form.username}
          onChange={handleChange}
          required={true}
        />
        <InputField
          name="email"
          label="Email"
          value={form.email}
          onChange={handleChange}
          required={true}
          type="email"
        />
        <InputField
          name="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          required={true}
          type="password"
        />
        <InputField
          name="password"
          label="Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required={true}
          type="password"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-400 transition-colors disabled:bg-blue-300"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <Link
          to="/loginlogout"
          className="text-shadow-amber-50 opacity-25 hover:opacity-70 duration-100"
        >
          Already have an account? Login...
        </Link>

        <Link
          to="/forgot-password"
          className="text-shadow-amber-50 opacity-25 hover:opacity-70 duration-100"
        >
          Did you forgot ypur password? Recover...
        </Link>

        {message && <MessageAlert message={message} type="success" />}

        {error && <MessageAlert message={error} type="error" />}
      </form>
    </div>
  );
};

export default Register;
