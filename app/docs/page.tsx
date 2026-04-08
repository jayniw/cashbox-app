'use client';

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

    const lightThemeStyle = document.createElement('style');
    lightThemeStyle.textContent = `
      .swagger-ui * {
        color: #0f172a !important;
      }

      .swagger-ui, .swagger-ui .topbar, .swagger-ui .topbar a, .swagger-ui .info, .swagger-ui .responses-wrapper,
      .swagger-ui .opblock, .swagger-ui .opblock-description, .swagger-ui .parameter__name,
      .swagger-ui .tab-content, .swagger-ui .scheme-container, .swagger-ui .json-schema, .swagger-ui .schemes,
      .swagger-ui .parameters, .swagger-ui .response-col_description, .swagger-ui .response-col_status {
        background: #ffffff !important;
        color: #0f172a !important;
      }

      .swagger-ui .topbar {
        background: #f8fafc !important;
        border-bottom: 1px solid #e2e8f0 !important;
      }

      .swagger-ui .opblock {
        border-color: #e2e8f0 !important;
      }

      .swagger-ui .btn, .swagger-ui .try-out, .swagger-ui .execute, .swagger-ui .opblock-summary-control {
        background: #f1f5f9 !important;
        color: #0f172a !important;
      }

      .swagger-ui .opblock.opblock-get .opblock-summary-method,
      .swagger-ui .opblock.opblock-post .opblock-summary-method,
      .swagger-ui .opblock.opblock-put .opblock-summary-method,
      .swagger-ui .opblock.opblock-delete .opblock-summary-method {
        color: #0f172a !important;
      }

      .swagger-ui .markdown p, .swagger-ui .markdown pre, .swagger-ui .markdown code {
        color: #0f172a !important;
      }
    `;

    document.head.appendChild(lightThemeStyle);

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
      document.head.removeChild(lightThemeStyle);
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
