"use client";

import { FC } from "react";

interface RunningTextProps {
  text: string;
  speed?: number; // semakin kecil = lebih cepat
  bgColor?: string;
  textColor?: string;
}

const RunningText: FC<RunningTextProps> = ({
  text,
  speed = 15,
  bgColor = "bg-[#222222]",
  textColor = "text-slate-200",
}) => {
  return (
    <div
      className={`overflow-hidden whitespace-nowrap ${bgColor} ${textColor} font-medium py-2`}
    >
      <div
        className="inline-block animate-marquee"
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        <span className="text-red-600 mr-2">Breaking News :</span>
        <span className="mr-8">{text}</span>
        <span className="text-red-600 mr-2">Breaking News :</span>
        <span className="mr-8">{text}</span>
      </div>
    </div>
  );
};

export default RunningText;
