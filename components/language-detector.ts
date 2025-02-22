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

declare const self: {
  ai: {
    languageDetector: LanguageDetector;
  };
};

export const languageDetector = async (text: string) => {
  if (!text || typeof text !== "string") {
    console.error("Invalid input text.");
    return;
  }

  if ("ai" in self && "languageDetector" in self.ai) {
    console.log("Language Detector API is available.");

    try {
      const languageDetectorCapabilities =
        await self.ai.languageDetector.capabilities();
      const canDetect = languageDetectorCapabilities.capabilities;

      if (canDetect === "no") {
        console.error("Language detection is not supported.");
        return;
      }

      if (canDetect === "readily") {
        const res = await detectLanguage(text);
        return res;
      } else {
        const res = await downloadAndUseLanguageDetector(text);
        return res;
      }
    } catch (error) {
      console.error("Failed to detect language:", error);
      throw error;
    }
  } else {
    console.error("Language Detector API is not available.");
  }
};

const detectLanguage = async (text: string): Promise<DetectionResult[]> => {
  console.log("running");
  try {
    const detector = await self.ai.languageDetector.create();
    const results = await detector.detect(text);
    return results;
  } catch (error) {
    console.error("Failed to detect language:", error);
    throw error;
  }
};

const downloadAndUseLanguageDetector = async (
  text: string
): Promise<DetectionResult[]> => {
  try {
    const detector = await self.ai.languageDetector.create({
      monitor(m: ProgressEvent<EventTarget>) {
        m.target?.addEventListener("progress", (event: Event) => {
          const e = event as ProgressEvent<EventTarget>;
          console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
        });
      },
    });
    if (detector.ready) {
      await detector.ready;
    }
    const results = await detectLanguage(text);
    return results;
  } catch (error) {
    console.error("Failed to download and use language detector:", error);
    throw error;
  }
};
