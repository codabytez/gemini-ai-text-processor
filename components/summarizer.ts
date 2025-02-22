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

declare const self: {
  ai: {
    summarizer: {
      capabilities: () => Promise<SummarizerCapabilities>;
      create: (options: SummarizerOptions) => Promise<Summarizer>;
    };
  };
};

export const summarize = async (text: string): Promise<string | void> => {
  if (!text || typeof text !== "string") {
    console.error("Invalid input text.");
    return;
  }

  const options: SummarizerOptions = {
    sharedContext: "This is a scientific article", // Additional shared context that can help the summarizer
    type: "key-points", // key-points (default), tl;dr, teaser, and headline
    format: "markdown", // markdown (default), and plain-text
    length: "short", // short, medium (default), and long
  };

  if ("ai" in self && "summarizer" in self.ai) {
    console.log("Summarizer API is supported.");

    try {
      const capabilities = await self.ai.summarizer.capabilities();
      const available = capabilities.available;

      if (available === "no") {
        console.error("Summarizer API is not usable.");
        return;
      }

      let summarizer: Summarizer;
      if (available === "readily") {
        summarizer = await self.ai.summarizer.create(options);
        const summary = await summarizer.summarize(text, {
          context: "This article is intended for a tech-savvy audience.",
        });
        console.log("summary", summary);
        return summary;
      } else {
        summarizer = await self.ai.summarizer.create(options);
        summarizer.addEventListener(
          "downloadprogress",
          (e: ProgressEvent<EventTarget>) => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          }
        );
        if (summarizer.ready) {
          await summarizer.ready;
        }
        const summary = await summarizer.summarize(text, {
          context: "This article is intended for a tech-savvy audience.",
        });
        console.log("summary", summary);
        return summary;
      }
    } catch (error) {
      console.error("Failed to summarize text:", error);
    }
  } else {
    console.error("Summarizer API is not supported.");
  }
};
