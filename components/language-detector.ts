import { fetchErrorToast, toastify } from "./toast";

declare const self: {
  ai: {
    languageDetector: LanguageDetector;
  };
};

export const languageDetector = async (
  text: string,
  setLoading: (loading: boolean) => void
): Promise<DetectionResult[] | void> => {
  if (!text || typeof text !== "string") {
    fetchErrorToast("Invalid input text.");
    return;
  }

  if ("ai" in self && "languageDetector" in self.ai) {
    toastify({
      type: "info",
      message: "Language detection in progress...",
    });

    setLoading(true);

    try {
      const languageDetectorCapabilities =
        await self.ai.languageDetector.capabilities();
      const canDetect = languageDetectorCapabilities.capabilities;

      if (canDetect === "no") {
        fetchErrorToast("Language detection is not supported.");
        setLoading(false);
        return;
      }

      let res: DetectionResult[];
      if (canDetect === "readily") {
        res = await detectLanguage(text);
      } else {
        res = await downloadAndUseLanguageDetector(text);
      }
      setLoading(false);
      return res;
    } catch (error) {
      fetchErrorToast("Failed to detect language.");
      console.error("Failed to detect language:", error);
      setLoading(false);
      throw error;
    }
  } else {
    fetchErrorToast("Language Detector API is not available.");
    setLoading(false);
  }
};

const detectLanguage = async (text: string): Promise<DetectionResult[]> => {
  try {
    const detector = await self.ai.languageDetector.create();
    const results = await detector.detect(text);
    return results;
  } catch (error) {
    fetchErrorToast("Failed to detect language:");
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
    fetchErrorToast("Failed to download and use language detector:");
    console.error("Failed to download and use language detector:", error);
    throw error;
  }
};
