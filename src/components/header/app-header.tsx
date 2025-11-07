import React from "react";

export const AppHeader: React.FC = () => (
  <div className="bg-white py-6 px-4 border-b border-gray-200">
    <div className="text-center">
      <h1 
        className="text-3xl sm:text-4xl text-gray-800 mb-1 sm:mb-2"
        style={{ 
          fontFamily: "'Sacramento', cursive",
          fontWeight: 400
        }}
      >
        LaminaTone
      </h1>
      <p className="text-sm sm:text-base text-gray-600">
        Layered Color Palette Generator
      </p>
    </div>
  </div>
);