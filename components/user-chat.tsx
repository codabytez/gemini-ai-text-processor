import { useState } from "react";
import { NextPage } from "next";
import { Copy, FileText } from "lucide-react";
import { translator } from "@/components/translator";
import { toastify } from "./toast";

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
  const [loading, setLoading] = useState<boolean>(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleTranslate = async (lang: string, text: string) => {
    setLoading(true);
    if (language !== "en") {
      toastify({
        type: "error",
        message: "Language is not English.",
      });
      setLoading(false);
      return;
    }
    const translation = await translator(lang, text, setLoading);
    setTranslatedText(translation as string);
    setLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toastify({
          type: "success",
          message: "Text copied to clipboard!",
        });
      })
      .catch((err) => {
        toastify({
          type: "error",
          message: "Failed to copy text",
        });
        throw err;
      });
  };

  return (
    <div className="bg-[#fce8e7] p-4 max-w-[300px] sm:max-w-lg rounded-3xl relative">
      <div className="overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="ml-auto text-sm text-[#7d7d7d]">
            {formatTime(timestamp)}
          </span>
        </div>
        <p className="text-[#07090d] mb-3 break-words">{text}</p>
      </div>

      <div className="flex items-center gap-2 mt-2 text-xs">
        <span className="px-2 py-1 rounded bg-[#ff9b9b] text-black/60">
          Language: {language}
        </span>
      </div>

      {translatedText && translatedText.length > 0 && (
        <div className="mt-3 pl-4 border-l-2 border-[#7d7d7d] text-black/40 break-words">
          <p className="text-sm">{translatedText}</p>
        </div>
      )}
      <div className="flex gap-2 absolute -bottom-5 right-5">
        {text.length >= 150 && (
          <button
            className="flex items-center gap-1 px-3 py-1 bg-white rounded-xl text-sm text-[#07090D] border border-[#d3d4d5] w-max"
            onClick={async () => {
              setLoading(true);
              await onSummarize(text);
              setLoading(false);
            }}
            disabled={loading}
          >
            {loading ? (
              <svg
                className="w-4 h-4 animate-spin"
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
              <FileText className="w-4 h-4" />
            )}
            <span className="hidden md:inline-block">Summarize</span>
          </button>
        )}
        <button
          className="flex items-center gap-1 px-3 py-1 bg-white rounded-xl text-sm text-[#07090D] border border-[#d3d4d5] w-max"
          onClick={() => handleCopy(text)}
          disabled={loading}
        >
          <Copy className="w-4 h-4" />
          <span className="hidden md:inline-block">Copy</span>
        </button>
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-1 bg-white rounded-xl text-sm text-[#07090D] border border-[#d3d4d5]"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={loading}
          >
            <option value="en">English</option>
            <option value="pt">Portuguese</option>
            <option value="es">Spanish</option>
            <option value="ru">Russian</option>
            <option value="tr">Turkish</option>
            <option value="fr">French</option>
          </select>
          <button
            className="flex items-center gap-1 px-3 py-1 bg-white rounded-xl text-sm text-[#07090D] border border-[#d3d4d5] w-max"
            onClick={() => handleTranslate(selectedLanguage, text)}
            disabled={loading}
          >
            {loading ? (
              <svg
                className="w-4 h-4 animate-spin"
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
              <svg
                className="w-4 h-4"
                fill="#000000"
                width="800px"
                height="800px"
                viewBox="0 0 52 52"
                data-name="Layer 1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M39,18.67H35.42l-4.2,11.12A29,29,0,0,1,20.6,24.91a28.76,28.76,0,0,0,7.11-14.49h5.21a2,2,0,0,0,0-4H19.67V2a2,2,0,1,0-4,0V6.42H2.41a2,2,0,0,0,0,4H7.63a28.73,28.73,0,0,0,7.1,14.49A29.51,29.51,0,0,1,3.27,30a2,2,0,0,0,.43,4,1.61,1.61,0,0,0,.44-.05,32.56,32.56,0,0,0,13.53-6.25,32,32,0,0,0,12.13,5.9L22.83,52H28l2.7-7.76H43.64L46.37,52h5.22Zm-15.3-8.25a23.76,23.76,0,0,1-6,11.86,23.71,23.71,0,0,1-6-11.86Zm8.68,29.15,4.83-13.83L42,39.57Z" />
              </svg>
            )}
            <span className="hidden md:inline-block">Translate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserChat;
