

"use client";

import { useEffect, useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ReactMarkdown from "react-markdown";
// import { supabase } from "@/lib/supabaseClient";
import { ChatMessage } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";

const HomePage = () => {

  return (
    <DefaultLayout>
      <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-4 px-4 py-8">
        <h1 className="text-4xl font-bold">Welcome to the Home Page</h1>
        <p className="text-lg text-gray-600">
          This is a sample home page using the DefaultLayout component.
        </p>
      </div>
    </DefaultLayout>
  );
};

export default HomePage;
