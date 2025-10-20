

"use client";

import { useEffect, useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ReactMarkdown from "react-markdown";
// import { supabase } from "@/lib/supabaseClient";
import { ChatMessage } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";

const HomePage = () => {

  return (
    <p>Welcome to Joe Media, your go-to source for the latest news and updates.</p>
  );
};

export default HomePage;
