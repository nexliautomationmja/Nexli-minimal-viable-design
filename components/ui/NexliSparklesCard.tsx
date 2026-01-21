"use client";
import React from "react";
import { SparklesCore } from "../Sparkles";

export const NexliSparklesCard: React.FC = () => {
  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center overflow-hidden relative">
      {/* Sparkles background */}
      <div className="absolute inset-0">
        <SparklesCore
          background="transparent"
          minSize={0.3}
          maxSize={0.8}
          particleCount={40}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      {/* Text */}
      <h1 className="text-2xl font-bold text-center text-white relative z-20">
        NEXLI
      </h1>

      {/* Gradient line below text */}
      <div className="w-16 h-4 relative mt-1">
        <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-[1px] blur-sm" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-px" />
      </div>
    </div>
  );
};

export default NexliSparklesCard;
