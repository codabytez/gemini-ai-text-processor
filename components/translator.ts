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
    console.error("Invalid input text.");
    return;
  }

  if ("ai" in self && "translator" in self.ai) {
    console.log("Translator API is supported.");

    try {
      const translatorCapabilities = await self.ai.translator.capabilities();
      const available = translatorCapabilities.languagePairAvailable(
        "es",
        "fr"
      );

      if (available === "no") {
        console.error(
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
      console.error("Failed to translate text:", error);
    }
  } else {
    console.error("Translator API is not supported.");
  }
};
