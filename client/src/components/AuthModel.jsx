import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Auth from "../pages/Auth.jsx";
import Icon from "./Icons.jsx";

function AuthModel({ onClose }) {
  const { userData } = useSelector((state) => state.user);
  useEffect(() => {
    if (userData) onClose();
  }, [userData, onClose]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-8 right-5 text-gray-800 hover:text-black text-xl z-10 transition"
        >
          <Icon name="cross" size={18} />
        </button>
        <Auth isModel={true} />
      </div>
    </div>
  );
}

export default AuthModel;
