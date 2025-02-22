export const languageDetector = async (text: string) => {
  if ("ai" in self && "languageDetector" in self.ai) {
    console.log("Language Detector API is available.");

    const languageDetectorCapabilities =
      await self.ai.languageDetector.capabilities();
    const canDetect = languageDetectorCapabilities.capabilities;

    if (canDetect === "no") {
      return;
    }

    if (canDetect === "readily") {
      const res = await detectLanguage(text);
      return res;
    } else {
      const res = await downloadAndUseLanguageDetector(text);
      return res;
    }
  } else {
    console.log("Language Detector API is not available.");
  }
};

const detectLanguage = async (text: string) => {
  console.log("running");
  const detector = await self.ai.languageDetector.create();
  const results = await detector.detect(text);

  return results;
};

const downloadAndUseLanguageDetector = async (text: string) => {
  const detector = await self.ai.languageDetector.create({
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
      });
    },
  });
  await detector.ready;
  const results = await detectLanguage(text);
  return results;
};
