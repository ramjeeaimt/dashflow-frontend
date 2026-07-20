import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Point pdf.js at its worker (bundled by Vite as a URL)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Custom, brand-styled PDF viewer. Renders each page to a canvas with our own
 * controls (page nav, zoom) instead of the browser's native PDF chrome.
 *
 * Props:
 *  - blob | url : source (Blob preferred; url also works)
 *  - className  : wrapper classes
 */
const PdfViewer = ({ blob, url, className = '' }) => {
  const canvasRef = useRef(null);
  const pdfRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the document whenever the source changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPage(1);

    (async () => {
      try {
        const data = blob
          ? new Uint8Array(await blob.arrayBuffer())
          : undefined;
        const doc = await pdfjsLib.getDocument(data ? { data } : url).promise;
        if (cancelled) return;
        pdfRef.current = doc;
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('PdfViewer load error:', err);
        setError('Could not render this document.');
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (pdfRef.current) {
        pdfRef.current.destroy?.();
        pdfRef.current = null;
      }
    };
  }, [blob, url]);

  // Render the current page
  const renderPage = useCallback(async () => {
    const doc = pdfRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;

    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
      const pdfPage = await doc.getPage(page);
      const dpr = window.devicePixelRatio || 1;
      const viewport = pdfPage.getViewport({ scale });
      const ctx = canvas.getContext('2d');

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const task = pdfPage.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;
      renderTaskRef.current = null;
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('PdfViewer render error:', err);
      }
    }
  }, [page, scale]);

  useEffect(() => {
    if (!loading && !error) renderPage();
  }, [loading, error, renderPage]);

  const zoomIn = () => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(2)));

  return (
    <div className={`flex flex-col h-full bg-muted/40 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-card/70 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-muted-foreground tabular-nums min-w-[68px] text-center">
            {loading ? '—' : `Page ${page} / ${numPages}`}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={page >= numPages || loading}
            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={loading}
            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-muted-foreground tabular-nums w-11 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={loading}
            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 size={26} className="animate-spin" />
            <p className="text-sm">Rendering payslip…</p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-6">
            <AlertCircle size={26} className="text-error" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="shadow-sm bg-white rounded-sm h-fit"
          />
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
