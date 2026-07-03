// components/Shared/SuccessAlert.jsx (نسخه بسیار ملایم)
import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

const SuccessAlert = ({ message, onClose, redirectDelay = 0 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (redirectDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, redirectDelay);

      return () => clearTimeout(timer);
    }
  }, [redirectDelay]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* پس زمینه تار ملایم */}
      <div className="fixed inset-0 backdrop-blur-sm bg-white/20 z-50 flex items-center justify-center p-4 animate-fade-in">
        {/* مودال موفقیت - طراحی مینیمال */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg max-w-md w-full mx-4 overflow-hidden animate-scale-up border border-emerald-100">
          {/* هدر سبز بسیار ملایم */}
          <div className="bg-emerald-50 p-6 text-center border-b border-emerald-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-3">
              <CheckCircle size={36} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-emerald-700">Success!</h2>
          </div>

          {/* محتوای اصلی */}
          <div className="p-6 text-center">
            <p className="text-gray-600 text-base mb-6 leading-relaxed">
              {message}
            </p>

            {/* دکمه OK - طراحی مینیمال */}
            <button
              onClick={handleClose}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200"
            >
              OK
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleUp {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scale-up {
          animation: scaleUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default SuccessAlert;
