"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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
        <Button onClick={() => reset()}>पुनः प्रयास करें</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          होमपेज पर जाएं
        </Button>
      </div>
    </div>
  );
}
