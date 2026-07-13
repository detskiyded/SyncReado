import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


export function Reader(){
  const [numPages, setNumPages] = useState<number>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  function onDocumentLoadSuccess(numPages: number){
    setNumPages(numPages);
  }

  function onDocumentLoadError(error: string){
    setErrorMsg(error);
    console.log(numPages);
  }

return (
  <div className="reader-container">
    {/* Верхняя панель */}
    <div className="reader-header">
      <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
        ← Назад
      </button>
      
      <div className="reader-title">
        {/* Здесь можно вывести название книги, если мы его загрузили */}
        Просмотр PDF
      </div>

      <div className="reader-controls">
        <button className="btn-secondary" onClick={handlePrevPage} disabled={pageNumber <= 1}>
          ← Пред.
        </button>
        
        <span className="page-counter">
          {pageNumber} / {numPages || '?'}
        </span>
        
        <button className="btn-secondary" onClick={handleNextPage} disabled={!numPages || pageNumber >= numPages}>
          След. →
        </button>
      </div>
    </div>

    {/* Область с книгой */}
    <div className="pdf-wrapper">
      <Document 
        file={fileUrl} 
        onLoadSuccess={() => onDocumentLoadSuccess}
        onLoadError={() => onDocumentLoadError}
        className="pdf-document" /* Можно добавить для отступа, если нужно */
      >
        <Page pageNumber={pageNumber} width={800} renderTextLayer={true} />
      </Document>
    </div>
  </div>
)

}