import { fetchErrorToast, toastify } from "./toast";

declare const self: {
  ai: {
    translator: {
      capabilities: () => Promise<TranslatorCapabilities>;
      create: (options: TranslatorOptions) => Promise<Translator>;
    };
  };
};

export const translator = async (
  language: string,
  text: string
): Promise<string | void> => {
  if (!text || typeof text !== "string") {
    fetchErrorToast("Invalid input text.");
    return;
  }

  if ("ai" in self && "translator" in self.ai) {
    toastify({
      type: "info",
      message: "Translation in progress...",
    });

    try {
      const translatorCapabilities = await self.ai.translator.capabilities();
      const available = translatorCapabilities.languagePairAvailable(
        "en",
        language
      );

      if (available === "no") {
        fetchErrorToast(
          "Translation is not supported for the given language pair."
        );
        return;
      }

      let translator: Translator;
      if (available === "readily") {
        translator = await self.ai.translator.create({
          sourceLanguage: "en",
          targetLanguage: language,
        });
      } else {
        translator = await self.ai.translator.create({
          sourceLanguage: "en",
          targetLanguage: { language },
          monitor(m: ProgressEvent<EventTarget>) {
            m.target?.addEventListener("progress", (event: Event) => {
              const e = event as ProgressEvent<EventTarget>;
              console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
            });
          },
        });
      }

      const translated = await translator.translate(text);
      console.log(translated);
      return translated;
    } catch (error) {
      fetchErrorToast("Failed to translate text.");
      console.error("Failed to translate text:", error);
    }
  } else {
    fetchErrorToast("Translation API is not available.");
  }
};
