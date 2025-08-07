'use client';

import React, { useState, ChangeEvent, JSX, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Upload,
  FileText,
  User,
  GraduationCap,
  Hash,
  Calendar,
  MapPin,
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader,
  CreditCard
} from 'lucide-react';
import { useWeb3 } from '@/app/context/Web3Context';
import { UploadToIPFS } from '@/app/utils/uploadToIPFS';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Suspense } from 'react';

interface FormData {
  studentAddress: string;
  certificateId: string;
  studentName: string;
  course: string;
  rollNo: string;
  issueDate: string;
  ipfsHash: string;
}

interface StoredData {
  formData: FormData;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileDataUrl?: string; // Store file as base64 data URL
}

interface InputField {
  name: keyof FormData;
  label: string;
  placeholder: string;
  icon: JSX.Element;
  type: string;
}

const UploadPageContent: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    studentAddress: '',
    certificateId: '',
    studentName: '',
    course: '',
    rollNo: '',
    issueDate: '',
    ipfsHash: '',
  });

  const { isPremium } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [file, setFile] = useState<File | null>(null);
  const [uploadingToPinata, setUploadingToPinata] = useState<boolean>(false);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [connectingWallet, setConnectingWallet] = useState<boolean>(false);
  const [paymentProcessed, setPaymentProcessed] = useState<boolean>(false);

  const { contractInstance, address, connectWallet } = useWeb3();

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Convert data URL back to File object
  const dataUrlToFile = (dataUrl: string, fileName: string, fileType: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || fileType;
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  // Load data from localStorage first (including file)
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedItem = localStorage.getItem("certificateData");
        if (storedItem) {
          const parsed: StoredData = JSON.parse(storedItem);

          // Load form data
          setFormData(parsed.formData);

          // Restore file if it exists
          if (parsed.fileName && parsed.fileDataUrl && parsed.fileType) {
            const restoredFile = dataUrlToFile(parsed.fileDataUrl, parsed.fileName, parsed.fileType);
            setFile(restoredFile);
          }
        }
      } catch (error) {
        console.error('Error loading stored certificate data:', error);
        // Clear corrupted data
        localStorage.removeItem("certificateData");
      } finally {
        setDataLoaded(true);
      }
    };

    loadStoredData();
  }, []);

  // Handle payment result only after data is loaded
  useEffect(() => {
    const handlePaymentResult = async () => {
      // Wait for data to be loaded before processing payment result
      if (!dataLoaded || !sessionId || paymentProcessed) return;

      setProcessingPayment(true);
      setPaymentProcessed(true); // Prevent multiple processing

      try {
        const response = await fetch('https://veridoc.onrender.com/api/payment/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
          credentials: 'include',
        });

        const result = await response.json();

        if (result.success && result.paymentStatus === 'paid') {
          toast.success('Payment successful! Connecting wallet and starting upload...');

          // Connect wallet first if not connected
          if (!address) {
            setConnectingWallet(true);
            try {
              await connectWallet();
              toast.success('Wallet connected successfully!');
            } catch (error) {
              toast.error('Failed to connect wallet. Please connect manually.');
              console.log("error : ", error)
              setProcessingPayment(false);
              return;
            } finally {
              setConnectingWallet(false);
            }
          }

          // Wait a moment for wallet connection to settle
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Start upload process
          await startUploadProcess();
        } else {
          toast.error('Payment failed or cancelled. Please try again.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('Payment verification failed. Please try again.');
      } finally {
        setProcessingPayment(false);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handlePaymentResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, dataLoaded, address]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name as keyof FormData]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.studentAddress) newErrors.studentAddress = 'Student wallet address is required';
    if (!formData.certificateId) newErrors.certificateId = 'Certificate ID is required';
    if (!formData.studentName) newErrors.studentName = 'Student name is required';
    if (!formData.course) newErrors.course = 'Course name is required';
    if (!formData.rollNo) newErrors.rollNo = 'Roll number is required';
    if (!formData.issueDate) newErrors.issueDate = 'Issue date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCertificateId = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CERT-${new Date().getFullYear()}-${timestamp.toUpperCase()}-${random.toUpperCase()}`;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only PNG, JPG, and PDF files are allowed');
        return;
      }

      setFile(selectedFile);
    }
  };

  const saveDataToLocalStorage = async (currentFormData: FormData, currentFile: File | null) => {
    try {
      const dataToStore: StoredData = {
        formData: currentFormData,
      };

      // Store file data if file exists
      if (currentFile) {
        dataToStore.fileName = currentFile.name;
        dataToStore.fileSize = currentFile.size;
        dataToStore.fileType = currentFile.type;
        dataToStore.fileDataUrl = await fileToDataUrl(currentFile);
      }

      localStorage.setItem("certificateData", JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      toast.error('Failed to save form data');
    }
  };

  const handleStripePayment = async (): Promise<void> => {
    // Save current form data and file before redirecting to payment
    await saveDataToLocalStorage(formData, file);

    const stripe = await loadStripe("pk_test_51QEn8vD5MY0XuWE68E1BY1X1EiSaEAVROhJF5OoIbDV9f8S4b9NJ9RJMVXC2W0dYnu598qpKIq7H4ustwfls8zdc003AEUjMiJ");

    try {
      setProcessingPayment(true);

      const response = await fetch('https://veridoc.onrender.com/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: "Certificate Upload",
          amount: 250,
          successUrl: `${window.location.origin}/university/upload`,
          cancelUrl: `${window.location.origin}/university/upload`,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const session = await response.json();

      const result = await stripe?.redirectToCheckout({
        sessionId: session.id,
      });

      if (result?.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setProcessingPayment(false);
    }
  };

  const startUploadProcess = async (): Promise<void> => {
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    const { studentAddress, certificateId, studentName, course, rollNo, issueDate, ipfsHash } = formData;

    try {
      setLoading(true);

      // Get the current contract instance or connect wallet
      let currentContract = contractInstance;

      if (!address || !currentContract) {
        toast('Connecting wallet and loading contract...');

        try {
          // connectWallet now returns the contract instance
          currentContract = await connectWallet();

          if (!currentContract) {
            toast.error("Failed to load contract after wallet connection");
            return;
          }
        } catch (error) {
          console.error('Wallet connection error:', error);
          toast.error(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return;
        }
      }

      let finalIpfsHash = ipfsHash;

      if (file) {
        try {
          setUploadingToPinata(true);
          toast('Uploading file to IPFS...');
          finalIpfsHash = await UploadToIPFS(file) || ipfsHash;
          setUploadingToPinata(false);
          setFormData(prev => ({ ...prev, ipfsHash: finalIpfsHash }));
          toast.success('File uploaded to IPFS successfully!');
        } catch (error: unknown) {
          setUploadingToPinata(false);
          if (error instanceof Error) {
            toast.error('Failed to upload file to IPFS: ' + error.message);
          } else {
            toast.error('Failed to upload file to IPFS');
          }
          return;
        }
      }

      toast('Submitting transaction to blockchain...');

      // Use the currentContract instance (not the state variable)
      const tx = await currentContract.issueDegree(
        studentAddress,
        certificateId,
        studentName,
        course,
        rollNo,
        issueDate,
        finalIpfsHash
      );

      toast.success('Transaction submitted. Waiting for confirmation...');
      await tx.wait();

      toast.success('Certificate issued successfully!');

      // Reset form
      setFormData({
        studentAddress: '',
        certificateId: '',
        studentName: '',
        course: '',
        rollNo: '',
        issueDate: '',
        ipfsHash: '',
      });
      setFile(null);
      localStorage.removeItem("certificateData");
      setPaymentProcessed(false);

    } catch (err: unknown) {
      console.error(err);
      if (typeof err === 'object' && err !== null) {
        const errorObj = err as { reason?: string; message?: string; code?: number };

        if (errorObj.code === 4001) {
          toast.error('Transaction rejected by user');
        } else {
          toast.error(errorObj.reason || errorObj.message || 'Transaction failed');
        }
      } else {
        toast.error('Transaction failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (isPremium) {
      await startUploadProcess();
    } else {
      await handleStripePayment();
    }
  };

  const inputFields: InputField[] = [
    {
      name: 'studentAddress',
      label: 'Student Wallet Address',
      placeholder: '0x742d35Cc4Bf3Ccedf4...',
      icon: <Wallet className="w-5 h-5" />,
      type: 'text'
    },
    {
      name: 'certificateId',
      label: 'Certificate ID',
      placeholder: 'CERT-2024-001',
      icon: <Hash className="w-5 h-5" />,
      type: 'text'
    },
    {
      name: 'studentName',
      label: 'Student Name',
      placeholder: 'Ram Ji',
      icon: <User className="w-5 h-5" />,
      type: 'text'
    },
    {
      name: 'course',
      label: 'Course Name',
      placeholder: 'Bachelor of Computer Science',
      icon: <GraduationCap className="w-5 h-5" />,
      type: 'text'
    },
    {
      name: 'rollNo',
      label: 'Roll Number',
      placeholder: 'CS2024001',
      icon: <FileText className="w-5 h-5" />,
      type: 'text'
    },
    {
      name: 'issueDate',
      label: 'Issue Date',
      placeholder: '',
      icon: <Calendar className="w-5 h-5" />,
      type: 'date'
    },
  ];

  if (processingPayment || connectingWallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {processingPayment ? 'Processing Payment...' : 'Connecting Wallet...'}
          </h2>
          <p className="text-gray-600">
            {processingPayment
              ? 'Please wait while we verify your payment and prepare for upload.'
              : 'Please approve the wallet connection in your wallet app.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-xl">
            <Upload className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl cursor-pointer font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Issue Certificate
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload and verify student certificates on the blockchain. Ensure authenticity and permanent record keeping.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">University Portal</span>
              </div>
              {address ? (
                <div className="flex items-center space-x-2 bg-white/20 rounded-xl px-4 py-2">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inputFields.map((field) => (
                field.name === 'certificateId' ? (
                  <div key={field.name} className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <span className="text-blue-600">{field.icon}</span>
                      <span>{field.label}</span>
                    </label>

                    <div className="flex gap-2">
                      <div className="relative group flex-1">
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData?.[field.name]}
                          onChange={handleChange}
                          readOnly
                          placeholder={field.placeholder}
                          className={`w-full px-4 py-4 pl-12 text-black rounded-xl border-2 transition-all duration-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors[field.name]
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-500 group-hover:border-gray-300'
                            }`}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200">
                          {field.icon}
                        </div>
                        {formData?.[field.name] && !errors[field.name] && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, certificateId: generateCertificateId() }))}
                        className="px-4 cursor-pointer py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-sm whitespace-nowrap"
                      >
                        Generate ID
                      </button>
                    </div>

                    {errors[field.name] && (
                      <div className="flex items-center space-x-2 text-red-500 text-sm mt-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors[field.name]}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div key={field.name} className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <span className="text-blue-600">{field.icon}</span>
                      <span>{field.label}</span>
                    </label>

                    <div className="relative group">
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData?.[field.name] || ''}

                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className={`w-full px-4 py-4 pl-12 text-black rounded-xl border-2 transition-all duration-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors[field.name]
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-blue-500 group-hover:border-gray-300'
                          }`}
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200">
                        {field.icon}
                      </div>
                      {formData?.[field.name] && !errors[field.name] && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {errors[field.name] && (
                      <div className="flex items-center space-x-2 text-red-500 text-sm mt-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors[field.name]}</span>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <span className="text-blue-600"><FileText className="w-5 h-5" /></span>
                <span>Certificate Document</span>
                {uploadingToPinata && (
                  <span className="text-blue-600 text-xs">(Uploading to IPFS...)</span>
                )}
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200 bg-gray-50/30 cursor-pointer">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="certificate-upload"
                />
                <label htmlFor="certificate-upload" className="cursor-pointer">
                  {uploadingToPinata ? (
                    <div className="flex flex-col items-center">
                      <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                      <p className="text-blue-600 font-semibold">Uploading to IPFS...</p>
                    </div>
                  ) : file ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-green-600 font-semibold mb-2">File Selected: {file.name}</p>
                      <p className="text-xs text-gray-500">Click to change file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Drop your certificate file here or</p>
                      <span className="text-blue-600 hover:text-blue-700 font-semibold underline cursor-pointer">
                        browse files
                      </span>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG, PDF up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>

              {file && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">{file.name}</p>
                        <p className="text-xs text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => saveDataToLocalStorage(formData, file)}
                className="flex-1 px-6 py-4 border-2 cursor-pointer border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || uploadingToPinata || processingPayment || connectingWallet}
                className="flex-1 bg-gradient-to-r from-blue-600 cursor-pointer to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center space-x-2"
              >
                {loading || uploadingToPinata ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>
                      {uploadingToPinata ? 'Uploading to IPFS...' : 'Issuing Certificate...'}
                    </span>
                  </>
                ) : isPremium ? (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Issue Certificate</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pay ₹250 & Upload</span>
                  </>
                )}
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
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

              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Instant Verification</h3>
                <p className="text-xs text-gray-600 mt-1">Real-time certificate validation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UploadCertificate() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadPageContent />
    </Suspense>
  );
}