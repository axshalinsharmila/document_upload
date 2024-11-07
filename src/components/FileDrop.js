// src/components/FileDrop.js
import React from "react";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import mammoth from "mammoth";
import { read, utils } from "xlsx";
import JSZip from "jszip";
import FilePreview from "./FilePreview";

const FileDrop = () => {
  const [files, setFiles] = useState([]);
  const [fileContent, setFileContent] = useState("");
  const [textContent, setTextContent] = useState("");
  const [tableData, setTableData] = useState([]);
  const [pptSlides, setPptSlides] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageDisplay, setErrorMessageDisplay] = useState(false);
  const [fileType, setFileType] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const [showPPTPreview, setShowPPTPreview] = useState(false);
  const [showWordPreview, setShowWordPreview] = useState(false);
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const previewRef = useRef(null);

  const supportedFileTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "application/vnd.ms-powerpoint", // .ppt
    "text/plain", // .txt
  ];

  const processFile = async (file) => {
    const fileExtension = file.name.split(".").pop();

    try {
      if (file.type === "application/pdf") {
        setPdfFile(file);
        setFileType(file);
        toast.success("PDF Uploaded Successfully");
      } else if (fileExtension === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setFileContent(result.value);
        toast.success("DOCX Uploaded Successfully");
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const data = await file.arrayBuffer();
        const workbook = read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = utils.sheet_to_json(firstSheet, { header: 1 });
        setTableData(sheetData.slice(0, 10));
        setFilteredData(sheetData.slice(0, 10));
        setData(sheetData);
        toast.success("Excel File Uploaded Successfully");
      } else if (fileExtension === "pptx") {
        const zip = await JSZip.loadAsync(await file.arrayBuffer());
        const slides = [];
        await zip
          .folder("ppt/slides")
          .forEach(async (relativePath, slideFile) => {
            const xmlText = await slideFile.async("text");
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "application/xml");
            const textNodes = Array.from(xmlDoc.getElementsByTagName("a:t"));
            slides.push(textNodes.map((node) => node.textContent).join(" "));
          });
        setPptSlides(slides);
        toast.success("PPTX Uploaded Successfully");
      } else if (file.type === "text/plain") {
        const text = await file.text();
        setTextContent(text);
        toast.success("Text File Uploaded Successfully");
      } else {
        toast.error("Unsupported file type.");
      }
    } catch (error) {
      toast.error("An error occurred during file processing.");
    }
  };

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      console.log("Accepted Files==>", acceptedFiles);
      console.log("Rejected Files==>", rejectedFiles);

      const validAcceptedFiles = [];
      const newlyRejectedFiles = [];

      acceptedFiles.forEach((file) => {
        if (supportedFileTypes.includes(file.type)) {
          // Add to valid accepted files and process it
          const fileWithPreview = Object.assign(file, {
            preview: URL.createObjectURL(file),
          });
          validAcceptedFiles.push(fileWithPreview);

          if (file.type === "application/pdf") {
            setPdfFile(fileWithPreview);
            setFileType(fileWithPreview);
          }
          setFileType(fileWithPreview);
          processFile(fileWithPreview);
        } else {
          // Treat as rejected if not a supported type
          const errorMessage = `${file.type} is not a supported file type.`;
          const fileWithPreview = Object.assign(file, {
            preview: URL.createObjectURL(file),
            errorMessage,
          });
          newlyRejectedFiles.push(fileWithPreview);
          toast.error(errorMessage);
        }
      });

      const formattedRejectedFiles = rejectedFiles.map((file) => {
        const errorMessage = file.errors
          .map((error) => {
            if (error.code === "file-invalid-type") {
              return `${file.file.type} is not a supported file type.`;
            }
            if (error.code === "file-too-large") {
              return `File size exceeds the 10 MB limit.`;
            }
            return "File rejected for unknown reasons.";
          })
          .join(" ");
        const fileWithPreview = Object.assign(file.file, {
          preview: URL.createObjectURL(file.file),
          errorMessage,
        });
        return fileWithPreview;
      });

      setFiles((prevFiles) => [...prevFiles, ...validAcceptedFiles]);
      
    },
    [setFiles, processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: supportedFileTypes.join(","),
    maxSize: 10485760,
    onDrop,
  });

  const removeAll = () => {
    setFiles([]);
  };

  const handleSearchChange = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    if (searchValue === "") {
      setFilteredData(tableData);
      setErrorMessage("");
      setErrorMessageDisplay(false);
      return;
    }

    let matchingRows = [];
console.log("FILETYPE",fileType, textContent)
    if (fileType?.type === "text/plain" && textContent) {
      if (textContent.toLowerCase().includes(searchValue)) {
        matchingRows.push(["Text File", textContent]);
      }
    }
    if (fileType?.type === "application/pdf"  && textContent) {
      if (textContent.toLowerCase().includes(searchValue)) {
        matchingRows.push(["PDF File", textContent]);
      }
    }
    if (fileType?.name?.endsWith(".pptx") && pptSlides.length > 0) {
      const matchedSlides = pptSlides.filter((slide) =>
        slide.toLowerCase().includes(searchValue)
      );
      if (matchedSlides.length > 0) {
        matchingRows.push(["PowerPoint Slides", matchedSlides.join("\n")]);
      }
    }

    if (
      (fileType?.name?.endsWith(".xlsx") || fileType.name.endsWith(".xls")) &&
      tableData.length > 0
    ) {
      const matchedRows = data.filter((row) =>
        row.some(
          (cell) => cell && cell.toString().toLowerCase().includes(searchValue)
        )
      );

      if (matchedRows.length > 0) {
        matchingRows = [...matchingRows, ...matchedRows];
        setFilteredData(matchingRows);
      }
    }

    if (fileType?.name?.endsWith(".docx") && fileContent) {
      if (fileContent.toLowerCase().includes(searchValue)) {
        matchingRows.push(["Word Document", fileContent]);
      }
    }

    if (matchingRows.length === 0) {
      setErrorMessage(`No matches found for "${searchValue}"`);
      setErrorMessageDisplay(true);
      setFilteredData([]);
    } else {
      setErrorMessage("");
      setFilteredData(matchingRows);
    }
  };

  const handlePreviewFile = (file, index) => {
    setActiveFileIndex(index);
    
    const previewStates = {
      "text/plain": { showTextPreview: true },
      ".pptx": { showPPTPreview: true },
      ".xlsx": { showExcelPreview: true },
      ".xls": { showExcelPreview: true },
      ".docx": { showWordPreview: true },
      "application/pdf": { showPdfPreview: true }
    };
    const matchedState = previewStates[file.type] || previewStates[file.name.slice(file.name.lastIndexOf("."))];
    setShowTextPreview(!!matchedState?.showTextPreview);
    setShowPPTPreview(!!matchedState?.showPPTPreview);
    setShowExcelPreview(!!matchedState?.showExcelPreview);
    setShowWordPreview(!!matchedState?.showWordPreview);
    setShowPdfPreview(!!matchedState?.showPdfPreview);
  };
  

  return (
    <form>
      <div className="box  max-w-6xl mx-auto p-4">
        <h1 className="header title text-3xl font-bold text-blue-300">
          Upload Files
        </h1>

        <div
          {...getRootProps()}
          className={`w-full border-2 border-dashed rounded-lg p-8 transition-all  ${
            isDragActive
              ? "bg-blue-100 border-blue-500"
              : "bg-gray-50 border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4 ">
            <ArrowUpTrayIcon className="w-12 h-12 text-blue-500" />
            <p className="text-lg text-gray-600">
              {isDragActive
                ? "Drop files here..."
                : "Drag & drop files here, or click to select"}
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, Word, Excel, PowerPoint, TXT (Max 10MB)
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}

      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search in document..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setScale((prev) => Math.max(0.5, prev - 0.1));
                }}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                -
              </button>
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setScale((prev) => Math.min(2, prev + 0.1));
                }}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>
          {errorMessageDisplay && <div>
            <p className="text-red-700 mb-4">{errorMessage}</p>
          </div>}

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4   ">
            <div className="col-span-1 space-y-2">
              {files.map((file, index) => (
                <div
                  key={file.name}
                  className={`
                    p-3 rounded-lg cursor-pointer
                    ${
                      index === activeFileIndex
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }
                  `}
                  onClick={() => handlePreviewFile(file, index)}
                >
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)}KB
                  </p>
                </div>
              ))}
            </div>

            <div className="col-span-3">
              <div
                ref={previewRef}
                className="border rounded-lg p-4 min-h-[400px] overflow-auto"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                {/* Preview content goes here - implement based on file type */}
                <FilePreview
                  files={files}
                  removeAll={removeAll}
                  fileContent={fileContent}
                  setFiles={setFiles}
                  textContent={textContent}
                  tableData={tableData}
                  searchTerm={searchTerm}
                  pptSlides={pptSlides}
                  filteredData={filteredData}
                  pdfFile={pdfFile}
                  scale={scale}
                  setScale={setScale}
                  showTextPreview={showTextPreview}
                  showPPTPreview={showPPTPreview}
                  showWordPreview={showWordPreview}
                  showExcelPreview={showExcelPreview}
                  showPdfPreview={showPdfPreview}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default FileDrop;
