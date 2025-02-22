"use client";
import React, { useState, FormEvent, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import UserChat from "@/components/user-chat";
import Response from "@/components/response";
import { summarize } from "@/components/summarizer";
import { languageDetector } from "@/components/language-detector";

const ChatInterface = () => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");

  const [chats, setChats] = useState<Chat[]>(() => {
    if (typeof window !== "undefined") {
      const savedChats = localStorage.getItem("chats");
      return savedChats
        ? JSON.parse(savedChats)
        : [
            {
              id: "1",
              title: "New Chat",
              messages: [],
              createdAt: new Date().toISOString(),
            },
          ];
    }
  });

  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    return chats[0]?.id || "";
  });

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

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

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  // Create a new chat
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

  // Switch between chats
  const switchChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  // Handle message submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const res = await languageDetector(inputText);
    console.log("res", res[0]);

    const newQuestion: Message = {
      id: Date.now().toString(),
      type: "question",
      text: inputText,
      timestamp: new Date().toISOString(),
      language: res[0].detectedLanguage,
    };

    // const newAnswer: Message = {
    //   id: (Date.now() + 1).toString(),
    //   type: "answer",
    //   text: `Here is the response to: ${inputText}`,
    //   timestamp: new Date().toISOString(),
    // };

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
  };

  const handleSummarizer = async (text: string, messageId: string) => {
    const summary = await summarize(text);

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
  };

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  return (
    <div className="flex flex-col bg-white max-w-5xl mx-auto rounded-3xl overflow-hidden w-full h-screen">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">Design Thinking</h1>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col-reverse"
      >
        <div className="flex flex-col space-y-12">
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

      {/* Input Area */}
      <div className="pt-4 pb-[2px] px-[1px] bg-[#d5dae7] m-6 rounded-2xl overflow-hidden">
        <div className="h-11 bg-transparent" />
        <form
          onSubmit={handleSubmit}
          className="relative bg-white rounded-b-2xl overflow-hidden"
        >
          <div className="flex gap-2 justify-center items-center rounded-3xl">
            <div className="flex-1 bg-white rounded-xl flex items-center relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Me anything ...."
                className="flex-1 outline-none px-2 min-h-20 pr-20 resize-none"
              />
            </div>
            <button
              type="submit"
              className="p-3 bg-gray-200 rounded-xl hover:bg-gray-300 absolute right-10 cursor-pointer"
              disabled={!inputText.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
