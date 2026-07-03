// components/Admin/ShoeManagement/MessageAlert.jsx
import React from "react";

const MessageAlert = ({ message, type = "error" }) => {
  if (!message) return null;

  const styles = {
    error: "bg-red-100 text-red-700 border-red-400",
    success: "bg-green-100 text-green-700 border-green-400",
  };

  return (
    <div className={`mb-4 p-4 rounded-lg border ${styles[type]}`}>
      {message}
    </div>
  );
};

export default MessageAlert;
