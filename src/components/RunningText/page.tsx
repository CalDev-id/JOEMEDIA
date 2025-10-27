"use client";

import { FC } from "react";

interface RunningTextProps {
  text: string;
  speed?: number; // semakin kecil = lebih cepat
  textColor?: string;
}

const RunningText: FC<RunningTextProps> = ({
  text,
  speed = 15,
  textColor = "text-black",
}) => {
  return (
    <div
      className={`bg-slate-100 overflow-hidden whitespace-nowrap ${textColor}  font-medium py-3 rounded-lg`}
    >
      <div
        className="inline-block animate-marquee"
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        <span className="text-red-600 mr-2">Breaking News :</span>
        <span className="mr-8">{text}</span>
        <span className="text-red-600 mr-2">•</span>
        <span className="mr-8">{text}</span>
      </div>
    </div>
  );
};

export default RunningText;
