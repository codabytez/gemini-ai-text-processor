import { fetchErrorToast, toastify } from "./toast";

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
    fetchErrorToast("Invalid input text.");
    return;
  }

  const options: SummarizerOptions = {
    sharedContext: "This is a scientific article", // Additional shared context that can help the summarizer
    type: "key-points", // key-points (default), tl;dr, teaser, and headline
    format: "markdown", // markdown (default), and plain-text
    length: "short", // short, medium (default), and long
  };

  if ("ai" in self && "summarizer" in self.ai) {
    toastify({
      type: "info",
      message: "Summarization in progress...",
    });

    try {
      const capabilities = await self.ai.summarizer.capabilities();
      const available = capabilities.available;

      if (available === "no") {
        fetchErrorToast(
          "The Summarization API is available, but your device is unable to run it. Check device requirements in chrome Early Preview Program documentation."
        );
        return;
      }

      let summarizer: Summarizer;
      if (available === "readily") {
        summarizer = await self.ai.summarizer.create(options);
        const summary = await summarizer.summarize(text, {
          context: "This article is intended for a tech-savvy audience.",
        });
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
        return summary;
      }
    } catch (error) {
      fetchErrorToast("Failed to summarize text.");
      console.error("Failed to summarize text:", error);
    }
  } else {
    fetchErrorToast("Summarization API is not available.");
  }
};
