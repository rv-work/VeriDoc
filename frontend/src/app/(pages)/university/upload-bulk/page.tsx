'use client';

import React, { useState, ChangeEvent, useRef } from 'react';
import {
  Upload,
  MapPin,
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader,
  Download,
  FileSpreadsheet,
  Plus,
  Trash2,
  Eye,
  Users
} from 'lucide-react';
import { useWeb3 } from '@/app/context/Web3Context';
import { UploadToIPFS } from '@/app/utils/uploadToIPFS';
import toast from 'react-hot-toast';
import JSZip from 'jszip';

interface CertificateData {
  studentAddress: string;
  certificateId: string;
  studentName: string;
  course: string;
  rollNo: string;
  issueDate: string;
  ipfsHash: string;
  file?: File;
}

interface BulkUploadProgress {
  total: number;
  current: number;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  currentStep: string;
}

const BulkUploadCertificate: React.FC = () => {

  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [uploadMethod, setUploadMethod] = useState<'csv' | 'manual' | 'naming'>('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [csvUploadMethod, setCsvUploadMethod] = useState<'csv-only' | 'csv-zip' | 'naming-convention'>('csv-only');
  const [extractedFiles, setExtractedFiles] = useState<{ [key: string]: File }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<BulkUploadProgress>({
    total: 0,
    current: 0,
    status: 'idle',
    currentStep: ''
  });
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { contractInstance, address } = useWeb3();

  // Generate certificate ID
  const generateCertificateId = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CERT-${new Date().getFullYear()}-${timestamp.toUpperCase()}-${random.toUpperCase()}`;
  };

  // Handle CSV file upload
  const handleCsvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size should be less than 5MB');
      return;
    }

    setCsvFile(file);
    parseCsvFile(file);
  };

  // Parse CSV file
  const parseCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        toast.error('CSV file should have at least a header and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['studentaddress', 'studentname', 'course', 'rollno', 'issuedate'];

      // Check if filename column exists for CSV+ZIP method
      const hasFilename = headers.includes('filename');
      if (csvUploadMethod === 'csv-zip' && !hasFilename) {
        toast.error('CSV+ZIP method requires "filename" column in CSV');
        return;
      }

      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
        return;
      }

      const newCertificates: CertificateData[] = [];
      const newErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());

        if (values.length !== headers.length) {
          newErrors.push(`Row ${i + 1}: Column count mismatch`);
          continue;
        }

        const cert: CertificateData & { filename?: string } = {
          studentAddress: '',
          certificateId: generateCertificateId(),
          studentName: '',
          course: '',
          rollNo: '',
          issueDate: '',
          ipfsHash: ''
        };

        headers.forEach((header, index) => {
          switch (header) {
            case 'studentaddress':
              cert.studentAddress = values[index];
              break;
            case 'studentname':
              cert.studentName = values[index];
              break;
            case 'course':
              cert.course = values[index];
              break;
            case 'rollno':
              cert.rollNo = values[index];
              break;
            case 'issuedate':
              cert.issueDate = values[index];
              break;
            case 'filename':
              cert.filename = values[index];
              break;
          }
        });

        // Validate required fields
        if (!cert.studentAddress || !cert.studentName || !cert.course || !cert.rollNo || !cert.issueDate) {
          newErrors.push(`Row ${i + 1}: Missing required data`);
          continue;
        }

        newCertificates.push(cert);
      }

      let finalCertificates = newCertificates;

      // If CSV+ZIP method and we have extracted files, match them
      if (csvUploadMethod === 'csv-zip' && Object.keys(extractedFiles).length > 0) {
        finalCertificates = matchFilesWithCsv(newCertificates, extractedFiles);
      }

      setCertificates(finalCertificates);
      setErrors(newErrors);
      setShowPreview(true);

      if (finalCertificates.length > 0) {
        toast.success(`Loaded ${finalCertificates.length} certificates`);
      }
    };

    reader.readAsText(file);
  };

  const extractZipFile = async (zipFile: File): Promise<{ [key: string]: File }> => {
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipFile);
      const extractedFiles: { [key: string]: File } = {};

      for (const [filename, fileData] of Object.entries(contents.files)) {
        if (!fileData.dir && (filename.endsWith('.pdf') || filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg'))) {
          const blob = await fileData.async('blob');
          const file = new File([blob], filename, { type: blob.type });
          extractedFiles[filename] = file;
        }
      }

      return extractedFiles;
    } catch (error) {
      console.error('Error extracting ZIP file:', error);
      toast.error('Failed to extract ZIP file');
      return {};
    }
  };

  // Handle ZIP file upload
  const handleZipUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast.error('Please upload a ZIP file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('ZIP file size should be less than 50MB');
      return;
    }

    setZipFile(file);
    const extracted = await extractZipFile(file);
    setExtractedFiles(extracted);
    toast.success(`Extracted ${Object.keys(extracted).length} files from ZIP`);
  };

  const matchFilesWithCsv = (certificates: CertificateData[], extractedFiles: { [key: string]: File }): CertificateData[] => {
    return certificates.map(cert => {
      if (cert.file) return cert;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filename = (cert as any).filename;
      if (filename && extractedFiles[filename]) {
        return { ...cert, file: extractedFiles[filename] };
      }

      const rollNoFile = Object.keys(extractedFiles).find(name =>
        name.toLowerCase().includes(cert.rollNo.toLowerCase())
      );
      if (rollNoFile) {
        return { ...cert, file: extractedFiles[rollNoFile] }; { }
      }

      return cert;
    });
  };

  const addManualCertificate = () => {
    setCertificates([...certificates, {
      studentAddress: '',
      certificateId: generateCertificateId(),
      studentName: '',
      course: '',
      rollNo: '',
      issueDate: '',
      ipfsHash: ''
    }]);
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const updateCertificate = (index: number, field: keyof CertificateData, value: string) => {
    const updated = [...certificates];
    updated[index] = { ...updated[index], [field]: value };
    setCertificates(updated);
  };

  const handleFileUpload = (index: number, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PNG, JPG, and PDF files are allowed');
      return;
    }

    const updated = [...certificates];
    updated[index] = { ...updated[index], file };
    setCertificates(updated);
  };

  const validateCertificates = (): boolean => {
    const newErrors: string[] = [];

    certificates.forEach((cert, index) => {
      if (!cert.studentAddress) newErrors.push(`Certificate ${index + 1}: Missing student address`);
      if (!cert.studentName) newErrors.push(`Certificate ${index + 1}: Missing student name`);
      if (!cert.course) newErrors.push(`Certificate ${index + 1}: Missing course`);
      if (!cert.rollNo) newErrors.push(`Certificate ${index + 1}: Missing roll number`);
      if (!cert.issueDate) newErrors.push(`Certificate ${index + 1}: Missing issue date`);
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const uploadFilesToIPFS = async (): Promise<CertificateData[]> => {
    const updatedCertificates = [...certificates];

    for (let i = 0; i < updatedCertificates.length; i++) {
      if (updatedCertificates[i].file) {
        setProgress(prev => ({
          ...prev,
          currentStep: `Uploading file ${i + 1} to IPFS...`
        }));

        try {
          const ipfsHash = await UploadToIPFS(updatedCertificates[i].file!);
          updatedCertificates[i].ipfsHash = ipfsHash || '';
        } catch (error) {
          console.error(`Failed to upload file for certificate ${i + 1}:`, error);
          updatedCertificates[i].ipfsHash = '';
        }
      }
    }

    return updatedCertificates;
  };

  const handleBulkSubmit = async () => {
    if (!validateCertificates()) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    if (!contractInstance) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setProgress({
        total: certificates.length,
        current: 0,
        status: 'uploading',
        currentStep: 'Starting bulk upload process...'
      });

      const updatedCertificates = await uploadFilesToIPFS();

      setProgress(prev => ({
        ...prev,
        status: 'processing',
        currentStep: 'Submitting to blockchain...'
      }));

      const studentAddresses = updatedCertificates.map(cert => cert.studentAddress);
      const certificateIds = updatedCertificates.map(cert => cert.certificateId);
      const studentNames = updatedCertificates.map(cert => cert.studentName);
      const courses = updatedCertificates.map(cert => cert.course);
      const rollNos = updatedCertificates.map(cert => cert.rollNo);
      const issueDates = updatedCertificates.map(cert => cert.issueDate);
      const ipfsHashes = updatedCertificates.map(cert => cert.ipfsHash);

      const tx = await contractInstance.issueDegreesBulk(
        studentAddresses,
        certificateIds,
        studentNames,
        courses,
        rollNos,
        issueDates,
        ipfsHashes
      );

      setProgress(prev => ({
        ...prev,
        currentStep: 'Waiting for blockchain confirmation...'
      }));

      await tx.wait();

      setProgress({
        total: certificates.length,
        current: certificates.length,
        status: 'completed',
        currentStep: 'All certificates issued successfully!'
      });

      toast.success(`Successfully issued ${certificates.length} certificates!`);

      setCertificates([]);
      setCsvFile(null);
      setShowPreview(false);
      setErrors([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err: unknown) {
      console.error(err);
      setProgress(prev => ({ ...prev, status: 'error' }));

      if (typeof err === 'object' && err !== null) {
        const errorObj = err as { reason?: string; message?: string };
        toast.error(errorObj.reason || errorObj.message || 'Bulk upload failed');
      } else {
        toast.error('Bulk upload failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    let csvContent = '';

    switch (csvUploadMethod) {
      case 'csv-only':
      case 'naming-convention':
        csvContent = 'studentAddress,studentName,course,rollNo,issueDate\n0x742d35Cc4Bf3Ccedf4...,John Doe,Bachelor of Computer Science,CS2024001,2024-12-01\n0x852e46Dd5Cf4Ddeff5...,Jane Smith,Master of Business Administration,MBA2024002,2024-12-01';
        break;
      case 'csv-zip':
        csvContent = 'studentAddress,studentName,course,rollNo,issueDate,filename\n0x742d35Cc4Bf3Ccedf4...,John Doe,Bachelor of Computer Science,CS2024001,2024-12-01,john_certificate.pdf\n0x852e46Dd5Cf4Ddeff5...,Jane Smith,Master of Business Administration,MBA2024002,2024-12-01,jane_certificate.pdf';
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate_template_${csvUploadMethod}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-xl">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Bulk Certificate Upload
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Upload multiple certificates at once using CSV files or manual entry. Streamline your certificate issuance process.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">Bulk Upload Portal</span>
                {certificates.length > 0 && (
                  <span className="bg-white/20 rounded-full px-3 py-1 text-sm">
                    {certificates.length} certificates ready
                  </span>
                )}
              </div>
              {address && (
                <div className="flex items-center space-x-2 bg-white/20 rounded-xl px-4 py-2">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-mono">{address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-8">

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Upload Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${uploadMethod === 'csv'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setUploadMethod('csv')}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <FileSpreadsheet className={`w-6 h-6 ${uploadMethod === 'csv' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <h4 className="font-semibold text-gray-800">CSV Upload</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Upload certificates using CSV with multiple options</p>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-500">Multiple Methods</span>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${uploadMethod === 'manual'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setUploadMethod('manual')}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Plus className={`w-6 h-6 ${uploadMethod === 'manual' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <h4 className="font-semibold text-gray-800">Manual Entry</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Add certificates one by one manually</p>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-500">Full Control</span>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${uploadMethod === 'naming'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setUploadMethod('naming')}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Upload className={`w-6 h-6 ${uploadMethod === 'naming' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <h4 className="font-semibold text-gray-800">File Naming</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Upload files using naming convention</p>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-500">Auto-Match</span>
                  </div>
                </div>
              </div>
            </div>

            {uploadMethod === 'csv' && (
              <div className="mb-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">CSV Upload Methods</h3>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Template</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${csvUploadMethod === 'csv-only' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    onClick={() => setCsvUploadMethod('csv-only')}
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">CSV Only</h4>
                    <p className="text-sm text-gray-600">Upload CSV, then add files individually</p>
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${csvUploadMethod === 'csv-zip' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    onClick={() => setCsvUploadMethod('csv-zip')}
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">CSV + ZIP</h4>
                    <p className="text-sm text-gray-600">Upload CSV with filename column + ZIP file</p>
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${csvUploadMethod === 'naming-convention' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    onClick={() => setCsvUploadMethod('naming-convention')}
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">Auto-Match</h4>
                    <p className="text-sm text-gray-600">Auto-match files by roll number</p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200 bg-gray-50/30">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    {csvFile ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <p className="text-green-600 font-semibold mb-2">CSV File: {csvFile.name}</p>
                        <p className="text-xs text-gray-500">Click to change file</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Drop your CSV file here or</p>
                        <span className="text-blue-600 hover:text-blue-700 font-semibold underline">
                          browse files
                        </span>
                        <p className="text-xs text-gray-500 mt-2">CSV files up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>

                {csvUploadMethod === 'csv-zip' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors duration-200 bg-purple-50/30">
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleZipUpload}
                      className="hidden"
                      id="zip-upload"
                    />
                    <label htmlFor="zip-upload" className="cursor-pointer">
                      {zipFile ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                          <p className="text-green-600 font-semibold mb-2">ZIP File: {zipFile.name}</p>
                          <p className="text-xs text-gray-500">
                            Extracted {Object.keys(extractedFiles).length} files
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Drop your ZIP file here or</p>
                          <span className="text-purple-600 hover:text-purple-700 font-semibold underline">
                            browse files
                          </span>
                          <p className="text-xs text-gray-500 mt-2">ZIP files up to 50MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    {csvUploadMethod === 'csv-only' && 'CSV Only Format:'}
                    {csvUploadMethod === 'csv-zip' && 'CSV + ZIP Format:'}
                    {csvUploadMethod === 'naming-convention' && 'Auto-Match Format:'}
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {csvUploadMethod === 'csv-only' && (
                      <>
                        <li>• Required columns: studentAddress, studentName, course, rollNo, issueDate</li>
                        <li>• Files will be added individually after CSV import</li>
                      </>
                    )}
                    {csvUploadMethod === 'csv-zip' && (
                      <>
                        <li>• Required columns: studentAddress, studentName, course, rollNo, issueDate, filename</li>
                        <li>• ZIP file should contain all certificate files mentioned in CSV</li>
                        <li>• Filename in CSV should match exact file name in ZIP</li>
                      </>
                    )}
                    {csvUploadMethod === 'naming-convention' && (
                      <>
                        <li>• Required columns: studentAddress, studentName, course, rollNo, issueDate</li>
                        <li>• Files will be auto-matched by roll number in filename</li>
                        <li>• Example: CS2024001.pdf matches rollNo &quot;CS2024001&quot;</li>
                      </>
                    )}
                    <li>• Date format: YYYY-MM-DD (e.g., 2024-12-01)</li>
                    <li>• Student address should be a valid Ethereum address</li>
                  </ul>
                </div>
              </div>
            )}




            {uploadMethod === 'manual' && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Manual Certificate Entry</h3>
                  <button
                    onClick={addManualCertificate}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Certificate</span>
                  </button>
                </div>

                {certificates.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No certificates added yet. Click &quot;Add Certificate&quot; to start.</p>
                  </div>
                )}

              </div>
            )}

            {certificates.length > 0 && uploadMethod === 'manual' && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Certificate Preview ({certificates.length} certificates)
                  </h3>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
                  </button>
                </div>

                {showPreview && (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {certificates.map((cert, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-800">Certificate #{index + 1}</h4>
                          <button
                            onClick={() => removeCertificate(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Student Address</label>
                            <input
                              type="text"
                              value={cert.studentAddress}
                              onChange={(e) => updateCertificate(index, 'studentAddress', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="0x742d35Cc4Bf3..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Student Name</label>
                            <input
                              type="text"
                              value={cert.studentName}
                              onChange={(e) => updateCertificate(index, 'studentName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="John Doe"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                            <input
                              type="text"
                              value={cert.course}
                              onChange={(e) => updateCertificate(index, 'course', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="Bachelor of Computer Science"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Roll Number</label>
                            <input
                              type="text"
                              value={cert.rollNo}
                              onChange={(e) => updateCertificate(index, 'rollNo', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="CS2024001"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Issue Date</label>
                            <input
                              type="date"
                              value={cert.issueDate}
                              onChange={(e) => updateCertificate(index, 'issueDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Certificate File</label>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(index, file);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            {cert.file && (
                              <p className="text-xs text-green-600 mt-1">✓ {cert.file.name}</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                          Certificate ID: {cert.certificateId}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {errors.length > 0 && (
              <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Validation Errors ({errors.length})
                </h4>
                <ul className="text-sm text-red-800 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}


            {uploadMethod === 'naming' && (
              <div className="mb-8 space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">File Naming Convention Upload</h3>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">How it works:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Upload multiple certificate files at once</li>
                    <li>• Files should be named with student roll numbers</li>
                    <li>• Example: CS2024001.pdf, MBA2024002.jpg, etc.</li>
                    <li>• System will create certificate entries based on filenames</li>
                  </ul>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors duration-200 bg-green-50/30">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;

                      const newCertificates = files.map(file => {
                        const today = new Date().toISOString().split('T')[0];
                        const [studentAddress, studentName, course, rollNoWithExt] = file.name.split('-');
                        const rollNo = rollNoWithExt.split('.')[0]; 
                      
                        return {
                          studentAddress: studentAddress || '',
                          studentName: studentName || '',
                          course: course || '',
                          rollNo: rollNo || '',
                          certificateId: generateCertificateId(),
                          issueDate: today,
                          ipfsHash: '',
                          file: file
                        };
                      });

                      setCertificates(newCertificates);
                      setShowPreview(true);
                      toast.success(`Loaded ${files.length} certificates from filenames`);
                    }}
                    className="hidden text-black"
                    id="naming-upload"
                  />
                  <label htmlFor="naming-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Drop your certificate files here or</p>
                      <span className="text-green-600 hover:text-green-700 font-semibold underline">
                        browse files
                      </span>
                      <p className="text-xs text-gray-500 mt-2">Select multiple PNG, JPG, or PDF files</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {certificates.length > 0 && uploadMethod === 'naming' && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Certificate Preview ({certificates.length} certificates)
                  </h3>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
                  </button>
                </div>

                {showPreview && (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {certificates.map((cert, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-800">Certificate #{index + 1}</h4>
                          <button
                            onClick={() => removeCertificate(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Student Address</label>
                            <input
                              type="text"
                              value={cert.studentAddress}
                              onChange={(e) => updateCertificate(index, 'studentAddress', e.target.value)}
                              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="0x742d35Cc4Bf3..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Student Name</label>
                            <input
                              type="text"
                              value={cert.studentName}
                              onChange={(e) => updateCertificate(index, 'studentName', e.target.value)}
                              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="John Doe"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                            <input
                              type="text"
                              value={cert.course}
                              onChange={(e) => updateCertificate(index, 'course', e.target.value)}
                              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="Bachelor of Computer Science"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Roll Number</label>
                            <input
                              type="text"
                              value={cert.rollNo}
                              onChange={(e) => updateCertificate(index, 'rollNo', e.target.value)}
                              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="CS2024001"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Issue Date</label>
                            <input
                              type="date"
                              value={cert.issueDate}
                              onChange={(e) => updateCertificate(index, 'issueDate', e.target.value)}
                              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Certificate File</label>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,.pdf"
                              value={cert.file}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(index, file);
                              }}
                              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            {cert.file && (
                              <p className="text-xs  text-green-600 mt-1">✓ {cert.file.name}</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                          Certificate ID: {cert.certificateId}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {errors.length > 0 && (
              <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Validation Errors ({errors.length})
                </h4>
                <ul className="text-sm text-red-800 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {loading && (
              <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                  <h4 className="font-semibold text-blue-900">
                    {progress.status === 'uploading' && 'Uploading Files to IPFS...'}
                    {progress.status === 'processing' && 'Processing Blockchain Transaction...'}
                    {progress.status === 'completed' && 'Upload Completed!'}
                    {progress.status === 'error' && 'Upload Failed'}
                  </h4>
                </div>

                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>

                <p className="text-sm text-blue-700">{progress.currentStep}</p>

                {progress.total > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {progress.current} / {progress.total} completed
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => {
                  setCertificates([]);
                  setCsvFile(null);
                  setZipFile(null);
                  setExtractedFiles({});
                  setShowPreview(false);
                  setErrors([]);
                  setCsvUploadMethod('csv-only');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                disabled={loading}
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={loading || certificates.length === 0 || errors.length > 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>
                      {progress.status === 'uploading' && 'Uploading to IPFS...'}
                      {progress.status === 'processing' && 'Processing on Blockchain...'}
                      {progress.status === 'completed' && 'Completed!'}
                      {progress.status === 'error' && 'Failed'}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Issue {certificates.length} Certificates</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Bulk Processing</h3>
                <p className="text-xs text-gray-600 mt-1">Handle multiple certificates at once</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Blockchain Verified</h3>
                <p className="text-xs text-gray-600 mt-1">Immutable and tamper-proof</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">IPFS Storage</h3>
                <p className="text-xs text-gray-600 mt-1">Decentralized file storage</p>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileSpreadsheet className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">CSV Support</h3>
                <p className="text-xs text-gray-600 mt-1">Easy bulk data import</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="font-semibold text-gray-800 mb-4">How to Use Bulk Upload</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">CSV Upload Method:</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Download the CSV template</li>
                <li>2. Fill in student details (address, name, course, roll no, date)</li>
                <li>3. Upload the CSV file</li>
                <li>4. Review and upload individual certificate files</li>
                <li>5. Submit to blockchain</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">Manual Entry Method:</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Click &quot;Add Certificate&quot; to create entries</li>
                <li>2. Fill in student details manually</li>
                <li>3. Upload certificate files for each student</li>
                <li>4. Review all entries in preview mode</li>
                <li>5. Submit all certificates at once</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadCertificate;













