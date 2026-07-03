import React, { FormEvent, useState } from "react";
import apiClientAuth from "../../services/api-client_auth";
import { Link } from "react-router-dom";
import MessageAlert from "../Shared/MessageAlert";
import InputField from "../Shared/InputField";

interface LoginForm {
  username: string;
  password: string;
}

const Login = () => {
  const [form, setForm] = useState<LoginForm>({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const res = await apiClientAuth.post("/login", {
        username: form.username,
        password: form.password,
      });

      setMessage(res.data.message);

      // پاک کردن فرم
      setForm({
        username: "",
        password: "",
      });

      // مهم: بعد از 1 ثانیه به صفحه اصلی هدایت کن
      setTimeout(() => {
        window.location.href = "/"; // رفرش کامل صفحه
      }, 1000);
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.message || "Login Error");
    }
  };

  return (
    <div className="container text-center my-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-4 max-w-md mx-auto"
      >
        <InputField
          name="username"
          label="Username"
          value={form.username}
          onChange={handleChange}
          required={true}
        />

        <InputField
          name="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          required={true}
          type="password"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-400 transition-colors"
        >
          OK
        </button>

        <Link
          to="/register"
          className="text-shadow-amber-50 opacity-25 hover:opacity-70 duration-100"
        >
          do not have an acount? create...
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

export default Login;
