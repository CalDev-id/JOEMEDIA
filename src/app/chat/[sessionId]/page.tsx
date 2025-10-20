
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // ambil param dari URL
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabaseClient";
import { ChatMessage } from "@/types/chat";

const ChatPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>(); // dapet "session2" dll

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState<string | null>(null);

  // Fetch history + agent
  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("id", { ascending: true });

      if (!error && data) {
        setMessages(data as ChatMessage[]);

        if (data.length > 0) {
          setAgent(data[0].agent); // ambil agent dari pesan pertama
        }
      }
    };

    fetchHistory();

    // Realtime listener
    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          if (newMsg.session_id === sessionId) {
            setMessages((prev) => [...prev, newMsg]);

            if (!agent && newMsg.agent) {
              setAgent(newMsg.agent);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, agent]);

// Send message
  const sendMessage = async () => {
    if (!input.trim() || !sessionId || !agent) return;

    setLoading(true);
    const userText = input;
    setInput("");

    try {
      await fetch(agent, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          prompt: userText,
        }),
      });
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <DefaultLayout>
      <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-4 px-4 py-8 bg-gray-100">
          <div className="flex w-full max-w-2xl flex-col space-y-2 pb-32">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-full break-words rounded-xl px-4 py-2 text-sm ${
                    msg.sender === "user"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  <ReactMarkdown>{msg.message}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="animate-pulse rounded-xl bg-gray-100 px-4 py-2 text-sm text-gray-500">
                  HCSP-AI sedang mengetik...
                </div>
              </div>
            )}
          </div>

        {/* Input */}
        <div className="w-full max-w-2xl mt-4 fixed bottom-0 bg-white rounded-xl">
          <div className="flex items-center rounded-xl border border-gray-300 p-4 shadow-sm">
            <input
              type="text"
              placeholder="Ask HCSP-AI anything"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow bg-transparent text-gray-800 placeholder-gray-400 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="rounded-full bg-green-500 p-2 text-white transition hover:bg-green-600 disabled:opacity-50"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m0 0l-6-6m6 6l-6 6"
                />
              </svg>
            </button>
          </div>
          <div className="bg-gray-100 h-20">
            
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ChatPage;
