"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-bold">कुछ गलत हो गया!</h2>
      <p className="text-muted-foreground">
        क्षमा करें, हम इस पृष्ठ को लोड नहीं कर सके।
      </p>
      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          onClick={() => reset()}
        >
          पुनः प्रयास करें
        </button>
        <button
          className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          onClick={() => (window.location.href = "/")}
        >
          होमपेज पर जाएं
        </button>
      </div>
    </div>
  );
}
