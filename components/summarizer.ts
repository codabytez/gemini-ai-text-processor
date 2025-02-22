export const summarize = async (text: string) => {
  // NOTE: Optional
  const options = {
    sharedContext: "This is a scientific article", // Additional shared context that can help the summarizer
    type: "key-points", // key-points (default), tl;dr, teaser, and headline
    format: "markdown", // markdown (default), and plain-text
    length: "short", // short, medium (default), and long
  };
  if ("ai" in self && "summarizer" in self.ai) {
    // The Summarizer API is supported.
    console.log("Summarizer API is supported.");

    const available = (await self.ai.summarizer.capabilities()).available;
    console.log("available");
    let summarizer;
    if (available === "no") {
      // The Summarizer API isn't usable.
      console.log("not usable");
      return;
    }
    if (available === "readily") {
      // The Summarizer API can be used immediately .
      summarizer = await self.ai.summarizer.create(options);

      // const text =
      // "This article is intended for a tech-savvy audience. It covers the latest trends in artificial intelligence and machine learning. The article provides a comprehensive overview of the field, including its history, current applications, and future prospects. The article also discusses the ethical implications of AI and machine learning, and provides recommendations for responsible use of these technologies.";
      const summary = await summarizer.summarize(text, {
        context: "This article is intended for a tech-savvy audience.",
      });
      console.log("summary", summary);
      return summary;
    } else {
      // The Summarizer API can be used after the model is downloaded.
      summarizer = await self.ai.summarizer.create(options);
      summarizer.addEventListener("downloadprogress", (e) => {
        console.log(e.loaded, e.total);
      });
      await summarizer.ready;
    }
    // return test;
  } else {
    // The Summarizer API is not supported.
    console.log("Summarizer API is not supported.");
  }
};
