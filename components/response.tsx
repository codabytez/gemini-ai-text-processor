import { useState } from "react";
import { NextPage } from "next";
import { Copy } from "lucide-react";
import { translator } from "./translator";
import { languageDetector } from "./language-detector";

const Response: NextPage<Message> = ({ text, timestamp }) => {
  const [translatedText, setTranslatedText] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [loading, setLoading] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleTranslate = async (language: string, text: string) => {
    setLoading(true);
    const res = await languageDetector(text, setLoading);

    if (!res) {
      console.error("Failed to detect language.");
      setLoading(false);
      return;
    }

    if (res && res[0].detectedLanguage !== "en") {
      console.log("Language is not English.");
      setLoading(false);
      return;
    }
    const translation = await translator(language, text, setLoading);
    setTranslatedText(translation as string);
    setLoading(false);
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

  const renderText = (text: string | undefined) => {
    if (!text) {
      return <p className="text-[#07090d] mb-3">No text available</p>;
    }

    const lines = text.split("\n");
    return (
      <ul className="list-disc w-full break-words">
        {lines.map((line, index) => (
          <li key={index} className="text-[#07090d] mb-1 list-none break-words">
            {line.trim()}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-[#d5dae7] rounded-2xl p-4 w-full max-w-3xl relative">
      <div className="overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="ml-auto text-sm text-[#88898a]">
            {formatTime(timestamp)}
          </span>
        </div>
        <div className="text-[#07090d] mb-3 break-words">
          {renderText(text)}
        </div>

        {translatedText && (
          <div className="mt-3 pl-4 border-l-2 border-[#7d7d7d] text-black/40 break-words">
            <p className="text-sm">{translatedText}</p>
          </div>
        )}
      </div>
      <div className="flex gap-2 absolute -bottom-4">
        <button
          className="flex items-center gap-1 px-3 py-1 bg-white rounded-xl text-sm text-[#07090d] border border-[#cdcecf] w-max"
          onClick={() => handleCopy(text)}
          disabled={loading}
        >
          <Copy className="w-4 h-4" />
          <span className="hidden md:inline-block">Copy Text</span>
        </button>

        <div className="flex items-center gap-2">
          <select
            className="px-3 py-1 bg-white rounded-xl text-sm text-[#07090d] border border-[#cdcecf]"
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

export default Response;
