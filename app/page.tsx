"use client";
import React, { useState, FormEvent, useRef, useEffect } from "react";
import { Send, Plus, Trash, Settings, Menu } from "lucide-react";
import UserChat from "@/components/user-chat";
import Response from "@/components/response";
import { summarize } from "@/components/summarizer";
import { languageDetector } from "@/components/language-detector";
import { fetchErrorToast } from "@/components/toast";

const ChatInterface = () => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [chatMenuIsOpen, setChatMenuIsOpen] = useState<boolean>(false);
  const [summarizerOptions, setSummarizerOptions] = useState<SummarizerOptions>(
    {
      sharedContext: "This is a scientific article",
      type: "key-points",
      format: "markdown",
      length: "short",
    }
  );

  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedChats = localStorage.getItem("chats");
      const savedOptions = localStorage.getItem("summarizerOptions");
      if (savedChats) {
        setChats(JSON.parse(savedChats));
      }
      if (savedOptions) {
        setSummarizerOptions(JSON.parse(savedOptions));
      }
    }
  }, []);

  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    return chats[0]?.id || "";
  });

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(
      "summarizerOptions",
      JSON.stringify(summarizerOptions)
    );
  }, [summarizerOptions]);

  // Function to maintain scroll position when new messages are added
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const currentScroll = container.scrollTop;
      const newHeight = container.scrollHeight;
      const previousHeight = container.dataset.previousHeight
        ? parseInt(container.dataset.previousHeight)
        : 0;
      const heightDifference = newHeight - previousHeight;

      // Only adjust scroll if we're adding new content
      if (heightDifference > 0) {
        container.scrollTop = currentScroll + heightDifference;
      }

      // Store the new height for future comparison
      container.dataset.previousHeight = newHeight.toString();
    }
  }, [chats]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(newChat.id);
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId && chats.length > 1) {
      setCurrentChatId(chats[0].id);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    const res = await languageDetector(inputText, setLoading);

    if (!res) {
      fetchErrorToast("Failed to detect language.");
      setLoading(false);
      return;
    }
    const newQuestion: Message = {
      id: Date.now().toString(),
      type: "question",
      text: inputText,
      timestamp: new Date().toISOString(),
      language: res[0].detectedLanguage,
    };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, newQuestion],
            title:
              chat.messages.length === 0 ? inputText.slice(0, 30) : chat.title,
          };
        }
        return chat;
      })
    );

    setInputText("");
    setLoading(false);
  };

  const handleSummarizer = async (text: string, messageId: string) => {
    setLoading(true);
    const summary =
      (await summarize(text, setLoading)) || "Summary not available.";

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          // Find the index of the message that was summarized
          const messageIndex = chat.messages.findIndex(
            (msg) => msg.id === messageId
          );

          if (messageIndex !== -1) {
            // Check if there's already a summary response after this message
            const nextMessage = chat.messages[messageIndex + 1];
            const hasSummary = nextMessage && nextMessage.type === "answer";

            if (hasSummary) {
              // Update existing summary
              const updatedMessages = chat.messages.map((msg, index) => {
                if (index === messageIndex + 1) {
                  return {
                    ...msg,
                    text: summary,
                    timestamp: new Date().toISOString(),
                  };
                }
                return msg;
              });

              return {
                ...chat,
                messages: updatedMessages,
              };
            } else {
              // Create new summary if none exists
              const summaryResponse: Message = {
                id: Date.now().toString(),
                type: "answer",
                text: summary,
                timestamp: new Date().toISOString(),
              };

              // Insert new summary after the original message
              const newMessages = [
                ...chat.messages.slice(0, messageIndex + 1),
                summaryResponse,
                ...chat.messages.slice(messageIndex + 1),
              ];

              return {
                ...chat,
                messages: newMessages,
              };
            }
          }
        }
        return chat;
      })
    );
    setLoading(false);
  };

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  return (
    <div className="flex flex-col bg-white max-w-5xl mx-auto rounded-3xl overflow-hidden w-full h-screen relative">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            className="md:hidden flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-xl text-sm text-[#07090d] border border-[#cdcecf] w-max transition-transform transform hover:scale-105 relative z-20"
            onClick={() => setChatMenuIsOpen(!chatMenuIsOpen)}
          >
            <Menu className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold">Text Processor</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-xl text-sm text-[#07090d] border border-[#cdcecf] w-max transition-transform transform hover:scale-105"
            onClick={createNewChat}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline-block">New Chat</span>
          </button>
          <button
            className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-xl text-sm text-[#07090d] border border-[#cdcecf] w-max transition-transform transform hover:scale-105"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline-block">Settings</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Chat List */}
        <div
          className={`absolute inset-y-0 left-0 bg-gray-100 p-4 overflow-y-auto transition-transform transform ${
            chatMenuIsOpen ? "translate-x-0" : "-translate-x-full"
          } w-[200px] md:relative md:translate-x-0 md:w-1/4 z-10`}
        >
          <h2 className="text-lg font-semibold mb-4">Chats</h2>
          <ul className="space-y-2">
            {chats.map((chat) => (
              <li
                key={chat.id}
                className={`p-2 rounded-lg cursor-pointer transition-colors duration-300 ${
                  chat.id === currentChatId ? "bg-gray-300" : "bg-white"
                }`}
                onClick={() => {
                  setCurrentChatId(chat.id);
                  setChatMenuIsOpen(false);
                }}
              >
                <div className="flex justify-between items-center">
                  <span>{chat.title}</span>
                  <button
                    className="text-red-500 transition-transform transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 flex flex-col-reverse transition-all duration-300 ease-in-out"
        >
          <div className="flex flex-col space-y-12 w-full">
            {currentChat?.messages.map((message) => (
              <React.Fragment key={message.id}>
                {message.type === "question" ? (
                  <div className="justify-items-end">
                    <UserChat
                      {...message}
                      onSummarize={(text) => handleSummarizer(text, message.id)}
                    />
                  </div>
                ) : (
                  <div className="w-max">
                    <Response {...message} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="pt-4 pb-[2px] px-[1px] bg-[#d5dae7] sm:m-6 mb-10 rounded-2xl overflow-hidden">
        <div className="h-11 bg-transparent hidden sm:block" />
        <form
          onSubmit={handleSubmit}
          className="relative bg-white rounded-b-2xl overflow-hidden"
        >
          <div className="flex gap-2 justify-center items-center rounded-3xl">
            <div className="flex-1 bg-white rounded-xl flex items-center relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as FormEvent);
                  }
                }}
                placeholder="Ask Me anything ...."
                className="flex-1 outline-none px-2 min-h-20 pr-10 sm:pr-20 resize-none"
                disabled={loading}
              />
            </div>
            <div className="text-xs text-gray-500 absolute bottom-2 left-2">
              Press Enter to send, Shift+Enter for new line
            </div>
            <button
              type="submit"
              className="p-3 bg-gray-200 rounded-xl hover:bg-gray-300 absolute right-2 sm:right-10 cursor-pointer disabled:cursor-not-allowed transition-transform transform hover:scale-105"
              disabled={!inputText.trim() || loading}
            >
              {loading ? (
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Settings Drawer */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end transition-opacity duration-300 ease-in-out">
          <div className="bg-white w-80 p-4 transition-transform transform translate-x-0">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shared Context
                </label>
                <input
                  type="text"
                  value={summarizerOptions.sharedContext}
                  onChange={(e) =>
                    setSummarizerOptions((prev) => ({
                      ...prev,
                      sharedContext: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={summarizerOptions.type}
                  onChange={(e) =>
                    setSummarizerOptions((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="key-points">Key Points</option>
                  <option value="tl;dr">TL;DR</option>
                  <option value="teaser">Teaser</option>
                  <option value="headline">Headline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Format
                </label>
                <select
                  value={summarizerOptions.format}
                  onChange={(e) =>
                    setSummarizerOptions((prev) => ({
                      ...prev,
                      format: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="markdown">Markdown</option>
                  <option value="plain-text">Plain Text</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Length
                </label>
                <select
                  value={summarizerOptions.length}
                  onChange={(e) =>
                    setSummarizerOptions((prev) => ({
                      ...prev,
                      length: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </div>
            <button
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md transition-transform transform hover:scale-105"
              onClick={() => setSettingsOpen(false)}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
