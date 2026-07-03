import React from "react";

// InputField.jsx
const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  type = "text",
  className = "bg-gray-200 px-3 py-2 rounded-sm",
}) => {
  return (
    <div className={`flex flex-col gap-y-2`}>
      {label && (
        <label className={`text-left`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={className}
        placeholder={placeholder || `Enter ${name}`}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};

export default InputField;
