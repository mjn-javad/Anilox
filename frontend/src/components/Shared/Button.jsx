import React from "react";

const Button = ({
  text,
  bgColor = "bg-gray-900",
  textColor = "text-white",
  handelOrderPopup = () => {},
  disabled = false,
  type = "button",
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={handelOrderPopup}
      disabled={disabled}
      className={`
        ${bgColor} 
        ${textColor}
        ${className}
        px-8
        py-3
        rounded-full
        font-medium
        hover:${bgColor === "bg-gray-900" ? "bg-gray-700" : "hover:brightness-90"}
        transition-all
        duration-400
        shadow-md
        hover:shadow-lg
        transform
        hover:scale-105
        cursor-pointer
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-gray-500
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:scale-100
        disabled:hover:shadow-md
      `}
    >
      {text}
    </button>
  );
};

export default Button;
