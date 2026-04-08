'use client';

import './page.module.css';
import { useEffect, useRef } from 'react';

export default function DocsPage() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist@4/swagger-ui.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js';
    script.defer = true;

    script.onload = () => {
      const swaggerWindow = window as unknown as {
        SwaggerUIBundle?: {
          (options: Record<string, unknown>): unknown;
          presets: { apis: unknown };
        };
      };

      if (!ref.current || !swaggerWindow.SwaggerUIBundle) {
        return;
      }

      swaggerWindow.SwaggerUIBundle({
        url: '/api/openapi',
        domNode: ref.current,
        presets: [swaggerWindow.SwaggerUIBundle.presets.apis],
      });
    };

    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        ref={ref}
        className="p-4"
      />
    </div>
  );
}
