"use client";

import { useState, useRef, useEffect } from "react";
import { streamChatRequest } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { BsRobot, BsSend, BsTrash } from "react-icons/bs";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "How do I prepare for a system design interview?",
  "What's the best way to negotiate salary?",
  "How should I follow up after an interview?",
  "What are common React interview questions?",
  "How do I explain a gap in my resume?",
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    // Add user message
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // empty assistant message to fill with chunks
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      await streamChatRequest(
        messages, // history except the new message
        text,
        (chunk) => {
          // Append chunk to last message
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: updated[updated.length - 1].content + chunk,
            };
            return updated;
          });
        },
        () => {
          setLoading(false);
        },
      );
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return updated;
      });
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BsRobot className="w-5 h-5 text-slate-700" />
          <h1 className="text-xl font-bold text-slate-900">
            AI Job Search Assistant
          </h1>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-slate-400 hover:text-red-500"
          >
            <BsTrash className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="scrollbar-thin flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 ? (
          // Empty state with suggestions
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BsRobot className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-700">
                Your Job Search Assistant
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Ask me anything about interviews, resumes, or career advice
              </p>
            </div>

            {/* Suggested prompts */}
            <div className="grid grid-cols-1 gap-2 w-full max-w-lg">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left text-sm px-4 py-2.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-slate-600"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Assistant avatar */}
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <BsRobot className="w-4 h-4 text-slate-600" />
                </div>
              )}

              <Card
                className={`max-w-[80%] px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="text-sm prose prose-sm prose-slate max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {/* Blinking cursor while streaming */}
                    {loading &&
                      index === messages.length - 1 &&
                      msg.content && (
                        <span className="inline-block w-2 h-4 bg-slate-400 animate-pulse ml-0.5" />
                      )}
                  </div>
                )}
              </Card>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t pt-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your job search... (Enter to send, Shift+Enter for new line)"
            className="resize-none min-h-12 max-h-32"
            disabled={loading}
            rows={1}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            size="sm"
            className="h-10 px-4 w-full sm:w-auto flex-shrink-0"
          >
            <BsSend className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Messages are not saved - chat history clears on refresh
        </p>
      </div>
    </div>
  );
}
