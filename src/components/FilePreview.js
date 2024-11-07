import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import FileInfo from "./FileInfo";
import "pdfjs-dist/web/pdf_viewer.css";
import { pdfjs } from "react-pdf";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css"; // Import default styles for the PDF viewer

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;

const FilePreview = (props) => {
  const {
    files,
    setFiles,
    textContent,
    fileContent,
    tableData,
    searchTerm,
    pptSlides,
    filteredData,
    pdfFile,
    showTextPreview,
    showPPTPreview,
    showWordPreview,
    showExcelPreview,
    showPdfPreview,
  } = props;

  const getHighlightedText = (text, highlight) => {
    if (!highlight.trim() || !text) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.toString().split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
  };
  const removeFile = (name) => {
    setFiles((files) => files.filter((file) => file.name !== name));
  };
  return (
    <>
      <ul className="grid grid-cols-1 ">
        {files.map((file) => (
          <li key={file.name} className="relative rounded-md shadow-lg">
            {console.log("Accdpteggg==>PDF", file, pdfFile)}
            {showPdfPreview && file.type === "application/pdf" && (
              <div className="mt-2 bg-gray-300 p-2 rounded whitespace-pre-wrap">
                <button
                  type="button"
                  className="w-7 h-7 border border-secondary-400 bg-red-400  rounded-full flex justify-center items-center absolute -top-3 -right-3 hover:bg-white transition-colors"
                  onClick={() => removeFile(file.name)}
                >
                  <XMarkIcon className="w-5 h-5 hover:fill-secondary-400 transition-colors text-white rounded-full hover:text-black" />
                </button>
                <h3 className="font-bold">PDF Content:</h3>
                <div className="overflow-y-auto mt-2 h-full bg-gray-50 p-2 rounded">
                  <a
                    href={file.preview}
                    target="_blank"
                    className="mt-2 text-neutral-500 text-[12px] font-medium cursor-pointer"
                  >
                    <Worker
                      workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}
                    >
                      <Viewer fileUrl={URL.createObjectURL(pdfFile)} />
                    </Worker>
                  </a>
                </div>

                <div className="p-1 rounded-full">
                  <FileInfo label="Name" value={file.name} />
                  <FileInfo label="Size" value={file.size} />
                  <FileInfo label="Type" value={file.name.split(".").pop()} />
                </div>
              </div>
            )}

            {/* Word DOCX Preview */}
            {showWordPreview && file.name.endsWith(".docx") && fileContent && (
              <div className="mt-2 bg-gray-300 p-2 rounded whitespace-pre-wrap">
                <button
                  type="button"
                  className="w-7 h-7 border border-secondary-400 bg-red-400  rounded-full flex justify-center items-center absolute -top-3 -right-3 hover:bg-white transition-colors"
                  onClick={() => removeFile(file.name)}
                >
                  <XMarkIcon className="w-5 h-5 hover:fill-secondary-400 transition-colors text-white rounded-full hover:text-black" />
                </button>
                <h3 className="font-bold">Document Content:</h3>
                <div className="overflow-y-auto mt-2 bg-gray-50 p-2 rounded ">
                  <a
                    href={file.preview}
                    target="_blank"
                    className="mt-2 text-neutral-500 text-[12px] font-medium cursor-pointer"
                  >
                    <p>{getHighlightedText(fileContent, searchTerm)}</p>
                  </a>
                </div>
                <div className="p-1 rounded-full">
                  <FileInfo label="Name" value={file.name} />
                  <FileInfo label="Size" value={file.size} />
                  <FileInfo label="Type" value={file.name.split(".").pop()} />
                </div>
              </div>
            )}

            {/* Excel XLSX/XLS Preview */}
            {showExcelPreview &&
              (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) &&
              tableData.length > 0 && (
                <div className="excel-content mt-2 bg-gray-300 p-2 rounded whitespace-pre-wrap ">
                  <button
                    type="button"
                    className="w-7 h-7 border border-secondary-400 bg-red-400  rounded-full flex justify-center items-center absolute -top-3 -right-3 hover:bg-white transition-colors"
                    onClick={() => removeFile(file.name)}
                  >
                    <XMarkIcon className="w-5 h-5 hover:fill-secondary-400 transition-colors text-white rounded-full hover:text-black" />
                  </button>
                  <h3 className="font-bold">Excel Content:</h3>
                  <div className="overflow-y-auto mt-2 bg-gray-50 p-2 rounded">
                    <a
                      href={file.preview}
                      target="_blank"
                      className="mt-2 text-neutral-500 text-[12px] font-medium cursor-pointer"
                    >
                      <table className=" excel-table mt-2 border-collapse border border-gray-300 ">
                        <thead>
                          <tr>
                            {tableData[0].map((header, index) => (
                              <th
                                key={index}
                                className="border border-gray-300 p-1"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="border border-gray-300 p-1 "
                                >
                                  {getHighlightedText(cell, searchTerm)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </a>
                  </div>
                  <div className="p-1 rounded-full">
                    <FileInfo label="Name" value={file.name} />
                    <FileInfo label="Size" value={file.size} />
                    <FileInfo label="Type" value={file.name.split(".").pop()} />
                  </div>
                </div>
              )}
            {/* PowerPoint PPTX Preview */}
            {showPPTPreview &&
              file.name.endsWith(".pptx") &&
              pptSlides.length > 0 && (
                <div className="bg-gray-300 p-2 rounded">
                  <button
                    type="button"
                    className="w-7 h-7 border border-secondary-400 bg-red-400  rounded-full flex justify-center items-center absolute -top-3 -right-3 hover:bg-white transition-colors"
                    onClick={() => removeFile(file.name)}
                  >
                    <XMarkIcon className="w-5 h-5 hover:fill-secondary-400 transition-colors text-white rounded-full hover:text-black" />
                  </button>
                  <div className="ppt-preview mt-2 ">
                    <h3 className="font-bold">PowerPoint Slides:</h3>
                    <div className="overflow-y-auto mt-2 bg-gray-50 p-2 rounded">
                      <a
                        href={file.preview}
                        target="_blank"
                        className="mt-2 text-neutral-500 text-[12px] font-medium cursor-pointer"
                      >
                        {pptSlides.map((slide, index) => (
                          <div key={index} className="slide mt-2">
                            <p>
                              <strong>Slide {index + 1}:</strong>
                            </p>
                            <p>{getHighlightedText(slide, searchTerm)}</p>
                          </div>
                        ))}
                      </a>
                    </div>
                  </div>
                  <div className="p-1 rounded-full">
                    <FileInfo label="Name" value={file.name} />
                    <FileInfo label="Size" value={file.size} />
                    <FileInfo label="Type" value={file.name.split(".").pop()} />
                  </div>
                </div>
              )}

            {/* Plain Text Preview */}
            {showTextPreview && file.type === "text/plain" && textContent && (
              <div className="text-preview mt-2 bg-gray-300 p-2 rounded whitespace-pre-wrap">
                <button
                  type="button"
                  className="w-7 h-7 border border-secondary-400 bg-red-400  rounded-full flex justify-center items-center absolute -top-3 -right-3 hover:bg-white transition-colors"
                  onClick={() => removeFile(file.name)}
                >
                  <XMarkIcon className="w-5 h-5 hover:fill-secondary-400 transition-colors text-white rounded-full hover:text-black" />
                </button>
                <h3 className="font-bold ">Text Content:</h3>
                <div className="overflow-y-auto mt-2 bg-gray-50 p-2 rounded">
                  <a
                    href={file.preview}
                    target="_blank"
                    className="mt-2 text-neutral-500 text-[12px] font-medium cursor-pointer"
                  >
                    <p>{getHighlightedText(textContent, searchTerm)}</p>{" "}
                  </a>
                </div>
                <div className="p-1 rounded-full">
                  <FileInfo label="Name" value={file.name} />
                  <FileInfo label="Size" value={file.size} />
                  <FileInfo label="Type" value={file.name.split(".").pop()} />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default FilePreview;
