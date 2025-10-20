"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface CardTasksProps {
  opened: string;
  taskTitle: string;
}

const CardTasks: React.FC<CardTasksProps> = ({ opened, taskTitle }) => {
  const router = useRouter();

  const handleClick = () => {
    // Navigasi ke halaman dummy
    router.push(`/tasks/${taskTitle.replace(/\s+/g, "-").toLowerCase()}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer flex flex-col items-start rounded-xl border border-slate-400 bg-[#dbfcf2] p-4 pb-20 hover:shadow-lg transition"
    >
      <p className="text-sm text-slate-600">{opened}</p>
      <h1 className="font-semibold text-[#23a969]">{taskTitle}</h1>
    </div>
  );
};

export default CardTasks;
