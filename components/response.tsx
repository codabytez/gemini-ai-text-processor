import {useState} from 'reactimport { NextPage } from "next";

import {
  Volume2,
  Heart,
  ThumbsUp,
  Copy,
  ThumbsDown,
  Redo2,
  Pencil,
} from "lucide-react";
import {translator} from './translator'

interface ResponseProps extends Message{
  onSummarize:(text:string) =>void;
}

const Response: NextPage<ResponseProps> = ({ text, timestamp, onSummarize }) => {
  const [translatedText, setTranslatedText] = useState("")
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };


  
    const handleTranslate = async (language: string, text: string) => {
      const translation = await translator(language, text);
      setTranslatedText(translation);
      console.log("fr", translation);
    };
  
    const handleCopy = (text: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log("Text copied to clipboard!");
          // You can replace this with a toast notification for better UX
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
      <ul className="list-disc">
        {lines.map((line, index) => (
          <li key={index} className="text-[#07090d] mb-1 list-none">
            {line.trim()}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-[#d5dae7] rounded-2xl p-4 max-w-3xl relative">
      <div className="overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Volume2 className="w-4 h-4 text-[#07090d]" />
          <Heart className="w-4 h-4 text-[#07090d]" />
          <span className="ml-auto text-sm text-[#88898a]">
            {formatTime(timestamp)}
          </span>
        </div>
        <div className="text-[#07090d] mb-3">{renderText(text)}</div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button className="p-1 text-[#07090d]">
              <ThumbsUp className="w-5 h-5" />
            </button>
            <button className="p-1 text-[#07090d]">
              <ThumbsDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-2 absolute -bottom-4">
        <button className="flex items-center gap-1 px-3 py-1 bg-white rounded-xl text-sm text-[#07090d] border border-[#cdcecf] w-max" onClick={()=>handleCopy(text)}>
          <Copy className="w-4 h-4" />
          Copy Text
        </button>
        <button className="flex items-center gap-1 px-3 py-1 bg-white rounded-xl text-sm text-[#07090d] border border-[#cdcecf] w-max">
          <Redo2 className="w-4 h-4" />
          Regenerate
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1 bg-white rounded-xl text-sm text-[#07090D] border border-[#d3d4d5] w-max"
          onClick={() => handleTranslate("fr", text)}
        >
          <Pencil className="w-4 h-4" />
          Translate
        </button>
      </div>
    </div>
  );
};

export default Response;
