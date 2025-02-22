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

interface ToastOptions {
  message: string;
  type?: "info" | "success" | "warning" | "error" | "default";
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  autoClose?: number | false | undefined;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  theme?: Theme;
  toastId?: number | string;
  onClose?: (reason?: boolean | string) => void;
  onOpen?: (reason?: boolean | string) => void;
  updateId?: string;
  progress?: number;
  ariaLabel?: string;
  delay?: number | undefined;
  isLoading?: boolean | undefined;
  pauseOnFocusLoss?: boolean | undefined;
  transition?:
    | React.FC<ToastTransitionProps>
    | React.ComponentClass<ToastTransitionProps>;
}

interface SummarizerCapabilities {
  available: string;
}

interface SummarizerOptions {
  sharedContext: string;
  type: string;
  format: string;
  length: string;
}

interface Summarizer {
  summarize: (text: string, options?: { context: string }) => Promise<string>;
  addEventListener: (
    event: string,
    callback: (e: ProgressEvent<EventTarget>) => void
  ) => void;
  ready?: Promise<void>;
}

interface LanguageDetectorCapabilities {
  capabilities: string;
}

interface LanguageDetector {
  capabilities: () => Promise<LanguageDetectorCapabilities>;
  create: (options?: {
    monitor?: (m: ProgressEvent<EventTarget>) => void;
  }) => Promise<Detector>;
}

interface Detector {
  detect: (text: string) => Promise<DetectionResult[]>;
  ready?: Promise<void>;
}

interface DetectionResult {
  detectedLanguage: string;
  confidence: number;
}


interface TranslatorCapabilities {
  languagePairAvailable: (source: string, target: string) => string;
}

interface Translator {
  translate: (text: string) => Promise<string>;
}

interface TranslatorOptions {
  sourceLanguage: string;
  targetLanguage: string | { language: string };
  monitor?: (m: ProgressEvent<EventTarget>) => void;
}