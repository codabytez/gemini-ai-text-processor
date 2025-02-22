import { fetchErrorToast, toastify } from "./toast";

declare const self: {
  ai: {
    summarizer: {
      capabilities: () => Promise<SummarizerCapabilities>;
      create: (options: SummarizerOptions) => Promise<Summarizer>;
    };
  };
};

export const summarize = async (
  text: string,
  setLoading: (loading: boolean) => void
): Promise<string | void> => {
  if (!text || typeof text !== "string") {
    fetchErrorToast("Invalid input text.");
    return;
  }

  const savedOptions = localStorage.getItem("summarizerOptions");
  const options: SummarizerOptions = savedOptions
    ? JSON.parse(savedOptions)
    : {
        sharedContext: "This is a scientific article",
        type: "key-points",
        format: "markdown",
        length: "short",
      };

  if ("ai" in self && "summarizer" in self.ai) {
    toastify({
      type: "info",
      message: "Summarization in progress...",
    });

    setLoading(true);

    try {
      const capabilities = await self.ai.summarizer.capabilities();
      const available = capabilities.available;

      if (available === "no") {
        fetchErrorToast(
          "The Summarization API is available, but your device is unable to run it. Check device requirements in chrome Early Preview Program documentation."
        );
        setLoading(false);
        return;
      }

      let summarizer: Summarizer;
      if (available === "readily") {
        summarizer = await self.ai.summarizer.create(options);
        const summary = await summarizer.summarize(text, {
          context: "This article is intended for a tech-savvy audience.",
        });
        setLoading(false);
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
        setLoading(false);
        return summary;
      }
    } catch (error) {
      fetchErrorToast("Failed to summarize text.");
      console.error("Failed to summarize text:", error);
      setLoading(false);
    }
  } else {
    fetchErrorToast("Summarization API is not available.");
    setLoading(false);
  }
};