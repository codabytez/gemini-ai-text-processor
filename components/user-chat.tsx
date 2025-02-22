import { useState } from "react";
import { NextPage } from "next";
import { Volume2, Heart, Copy, Pencil, FileText } from "lucide-react";
import { translator } from "@/components/translator";

interface UserChatProps extends Message {
  onSummarize: (text: string) => void;
}

const UserChat: NextPage<UserChatProps> = ({
  timestamp,
  text,
  language,
  onSummarize,
}) => {
  const [translatedText, setTranslatedText] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleTranslate = async (language: string, text: string) => {
    const translation = await translator(language, text);
    setTranslatedText(translation as string);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Text copied to clipboard!");
        // NOTE: replace this with a toast notification for better UX
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="bg-[#fce8e7] p-4 max-w-lg rounded-3xl relative">
      <div className="overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Volume2 className="w-4 h-4 text-[#07090D]" />
          <Heart className="w-4 h-4 text-[#07090D]" />
          <span className="ml-auto text-sm text-[#7d7d7d]">
            {formatTime(timestamp)}
          </span>
        </div>
        <p className="text-[#07090d] mb-3">{text}</p>
      </div>

      <div className="flex items-center gap-2 mt-2 text-xs">
        <span className="px-2 py-1 rounded bg-[#ff9b9b] text-black/60">
          Language: {language}
        </span>
      </div>

      {translatedText && translatedText.length > 0 && (
        <div className="mt-3 pl-4 border-l-2 border-[#7d7d7d] text-black/40">
          <p className="text-sm">{translatedText}</p>
        </div>
      )}
      <div className="flex gap-2 absolute -bottom-5 right-5">
        {text.length >= 150 && (
          <button
            className="flex items-center gap-1 px-3 py-1 bg-white rounded-xl text-sm text-[#07090D] border border-[#d3d4d5] w-max"
            onClick={() => onSummarize(text)}
          >
            <FileText className="w-4 h-4" />
            Summarize
          </button>
        )}
        <button
          className="flex items-center gap-1 px-3 py-1 bg-white rounded-xl text-sm text-[#07090D] border border-[#d3d4d5] w-max"
          onClick={() => handleCopy(text)}
        >
          <Copy className="w-4 h-4" />
          Copy
        </button>
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-1 bg-white rounded-xl text-sm text-[#07090D] border border-[#d3d4d5]"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="en">English (en)</option>
            <option value="pt">Portuguese (pt)</option>
            <option value="es">Spanish (es)</option>
            <option value="ru">Russian (ru)</option>
            <option value="tr">Turkish (tr)</option>
            <option value="fr">French (fr)</option>
          </select>
          <button
            className="flex items-center gap-1 px-3 py-1 bg-white rounded-xl text-sm text-[#07090D] border border-[#d3d4d5] w-max"
            onClick={() => handleTranslate(selectedLanguage, text)}
          >
            <Pencil className="w-4 h-4" />
            Translate
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserChat;
