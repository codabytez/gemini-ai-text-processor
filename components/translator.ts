export const translator = async (language: string, text: string) => {
  if ("ai" in self && "translator" in self.ai) {
    // The Translator API is supported.
    console.log("Translator API is supported.");

    const translatorCapabilities = await self.ai.translator.capabilities();
    const available = translatorCapabilities.languagePairAvailable("es", "fr");
    let translator;
    if (available === "no") {
      return;
    }
    if (available === "readily") {
      // The Summarizer API can be used immediately .
      // Create a translator that translates from English to French.
      translator = await self.ai.translator.create({
        sourceLanguage: "en",
        targetLanguage: language,
      });

      console.log('translator',translator);

      const translated = await translator.translate(text);
      // "Où est le prochain arrêt de bus, s'il vous plaît ?"
      console.log(translated);
      return translated;
    } else {
      // The Summarizer API can be used after the model is downloaded.
      const translator = await self.ai.translator.create({
        sourceLanguage: "en",
        targetLanguage: { language },
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
        },
      });
    }
    // return test;
  } else {
    // The Translator API is not supported.
    console.log("Translator API is not supported.");
  }
};
