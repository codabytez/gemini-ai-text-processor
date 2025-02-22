// Define types for our data structures
interface Message {
  id: string;
  type: "question" | "answer";
  text: string;
  timestamp: string;
  language?: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}
