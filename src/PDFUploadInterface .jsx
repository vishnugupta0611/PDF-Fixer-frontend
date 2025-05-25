import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, File, CheckCircle, Loader, X } from 'lucide-react';
import axios from 'axios';

const PDFUploadInterface = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processedFile, setProcessedFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const uploadAreaRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await axios.post('http://localhost:3000/process-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'
      });

      // Create download URL for the processed PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
      setProcessedFile({
        name: `processed_${file.name}`,
        url: url
      });
      
      setIsProcessing(false);
      setIsComplete(true);
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(err.response?.data?.error || 'Failed to process PDF');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedFile) {
      const a = document.createElement('a');
      a.href = processedFile.url;
      a.download = processedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const resetState = () => {
    setFile(null);
    setIsProcessing(false);
    setIsComplete(false);
    setProcessedFile(null);
    setDownloadUrl('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clean up the object URL
    if (downloadUrl) {
      window.URL.revokeObjectURL(downloadUrl);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up the object URL when component unmounts
      if (downloadUrl) {
        window.URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">PDF</span> Processor
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Upload your PDF and get processed MCQs with answers
          </p>
        </motion.div>

        {/* Main Interface */}
        <div className="upload-container max-w-3xl mx-auto">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 mb-6 text-red-100"
            >
              <p className="font-medium">Error: {error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!file && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 md:p-8 border border-white/10 shadow-lg"
              >
                <div
                  ref={uploadAreaRef}
                  className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-300 ${
                    isDragOver 
                      ? 'border-blue-400 bg-blue-400/10' 
                      : 'border-gray-500 hover:border-blue-400 hover:bg-blue-400/5'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <motion.div
                    animate={{ 
                      scale: isDragOver ? 1.1 : 1,
                      y: isDragOver ? -5 : 0
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Upload className="w-12 h-12 md:w-14 md:h-14 text-blue-400 mx-auto mb-4" />
                  </motion.div>
                  
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                    Drag & Drop your PDF
                  </h3>
                  <p className="text-gray-400 mb-6">
                    or click to browse your files
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 5px 20px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md"
                  >
                    Select File
                  </motion.button>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    Supported format: .pdf (max 50MB)
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </motion.div>
            )}

            {file && !isProcessing && !isComplete && (
              <motion.div
                key="process"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 shadow-lg"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                      <File className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <h4 className="text-lg font-medium text-white truncate">
                        {file.name}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 w-full md:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetState}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex-1 md:flex-none"
                    >
                      <X className="w-4 h-4 inline mr-2" />
                      Cancel
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 5px 20px rgba(16, 185, 129, 0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleProcess}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md flex-1 md:flex-none"
                    >
                      Process
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {isProcessing && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 shadow-lg text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-6"
                >
                  <Loader className="w-12 h-12 text-blue-400" />
                </motion.div>
                
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">
                  Processing your document
                </h3>
                <p className="text-gray-400 mb-6">
                  Extracting and formatting MCQs from your PDF...
                </p>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mt-6 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            )}

            {isComplete && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 shadow-lg text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-6" />
                </motion.div>
                
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">
                  Processing Complete!
                </h3>
                <p className="text-gray-400 mb-6">
                  Your MCQ PDF is ready for download
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 5px 20px rgba(16, 185, 129, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Download PDF
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetState}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-white/20"
                  >
                    Process Another
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Features */}
        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {[
            { 
              title: "MCQ Extraction", 
              desc: "Automatically extracts multiple choice questions from your PDFs",
              icon: <File className="w-6 h-6 text-blue-400" />
            },
            { 
              title: "Answer Identification", 
              desc: "Identifies and marks correct answers from the questions",
              icon: <CheckCircle className="w-6 h-6 text-blue-400" />
            },
            { 
              title: "Formatted Output", 
              desc: "Generates clean, organized PDF with questions and answers",
              icon: <Download className="w-6 h-6 text-blue-400" />
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10 hover:border-blue-400/30 transition-all duration-200"
            >
              <div className="bg-blue-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h4 className="text-lg font-medium text-white mb-2">{feature.title}</h4>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PDFUploadInterface;