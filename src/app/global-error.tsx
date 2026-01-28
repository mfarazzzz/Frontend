"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="hi">
      <body>
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-2xl font-bold">गंभीर त्रुटि हुई!</h2>
          <p className="text-muted-foreground">
            एप्लिकेशन लोड करने में समस्या आ रही है।
          </p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => reset()}
          >
            पुनः प्रयास करें
          </button>
        </div>
      </body>
    </html>
  );
}
