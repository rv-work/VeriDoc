// Chrome-optimized version with localStorage certificate verification tracking

"use client"

import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import {
  Shield,
  User,
  GraduationCap,
  Calendar,
  Hash,
  CheckCircle,
  XCircle,
  Building2,
  Copy,
  ExternalLink,
  AlertCircle,
  Award,
  FileCheck,
  Globe,
  Clock,
  Loader,
  CreditCard,
  Trash2,
  RefreshCw,
  Wallet, WifiOff,
} from "lucide-react";
import { useWeb3 } from "@/app/context/Web3Context";
import { useParams } from "next/navigation";
import axios from "axios";
import UniversityDisplay from "@/app/components/UniversityDetails";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

interface CertificateData {
  studentName: string;
  course: string;
  rollNo: string;
  issueDate: string;
  ipfsHash: string;
  isValid: boolean;
  issuedBy: string;
  universityName?: string;
}

interface VerifiedCertificate {
  certificateId: string;
  universityAddress: string;
  studentAddress: string;
  timestamp: number;
  paymentSessionId?: string;
}

const STORAGE_KEY = 'verifiedCertificates';
const VERIFICATION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

const CertificateVerification: React.FC = () => {
  const params = useParams();

  const { contractInstance, connectWallet } = useWeb3();

  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const universityAddress = params?.instituteId as string | undefined;
  const studentAddress = params?.studentId as string | undefined;
  const certificateId = params?.certificateId as string | undefined;

  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string>("");
  const [issuedBy, setIssuedBy] = useState(null);
  const [hash, setHash] = useState("");
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [paymentProcessed, setPaymentProcessed] = useState<boolean>(false);
  const [canVerify, setCanVerify] = useState<boolean>(false);
  const [verifiedCertificates, setVerifiedCertificates] = useState<VerifiedCertificate[]>([]);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState<boolean>(false);

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);

  const { isPremium } = useAuth();

  // Load verified certificates from localStorage
  const loadVerifiedCertificates = (): VerifiedCertificate[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const certificates: VerifiedCertificate[] = JSON.parse(stored);
      const now = Date.now();

      // Filter out expired certificates
      const validCertificates = certificates.filter(cert =>
        (now - cert.timestamp) < VERIFICATION_EXPIRY
      );

      // Update storage if any certificates were expired
      if (validCertificates.length !== certificates.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validCertificates));
      }

      return validCertificates;
    } catch (error) {
      console.error('Error loading verified certificates:', error);
      return [];
    }
  };

  // Save verified certificate to localStorage
  const saveVerifiedCertificate = (cert: VerifiedCertificate) => {
    try {
      const existing = loadVerifiedCertificates();
      const updated = existing.filter(c =>
        !(c.certificateId === cert.certificateId &&
          c.universityAddress === cert.universityAddress &&
          c.studentAddress === cert.studentAddress)
      );
      updated.push(cert);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setVerifiedCertificates(updated);
    } catch (error) {
      console.error('Error saving verified certificate:', error);
      toast.error('Failed to save verification status');
    }
  };

  // Check if current certificate is already verified
  const checkIfAlreadyVerified = (): boolean => {
    if (!certificateId || !universityAddress || !studentAddress) return false;

    const certificates = loadVerifiedCertificates();
    return certificates.some(cert =>
      cert.certificateId === certificateId &&
      cert.universityAddress.toLowerCase() === universityAddress.toLowerCase() &&
      cert.studentAddress.toLowerCase() === studentAddress.toLowerCase()
    );
  };

  // Clear specific certificate verification
  const clearCertificateVerification = () => {
    if (!certificateId || !universityAddress || !studentAddress) return;

    try {
      const certificates = loadVerifiedCertificates();
      const updated = certificates.filter(cert =>
        !(cert.certificateId === certificateId &&
          cert.universityAddress.toLowerCase() === universityAddress.toLowerCase() &&
          cert.studentAddress.toLowerCase() === studentAddress.toLowerCase())
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setVerifiedCertificates(updated);
      setIsAlreadyVerified(false);
      setCanVerify(false);

      toast.success('Certificate verification cleared. You can now pay again if needed.');
    } catch (error) {
      console.error('Error clearing certificate verification:', error);
      toast.error('Failed to clear verification status');
    }
  };

  // Clear all verified certificates
  const clearAllVerifications = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setVerifiedCertificates([]);
      setIsAlreadyVerified(false);
      setCanVerify(isPremium || false);

      toast.success('All certificate verifications cleared.');
    } catch (error) {
      console.error('Error clearing all verifications:', error);
      toast.error('Failed to clear all verifications');
    }
  };

  useEffect(() => {
    if (contractInstance) {
      setIsWalletConnected(true);
    } else {
      setIsWalletConnected(false);
    }
  }, [contractInstance]);

  const handleConnectWallet = async () => {
    try {
      setConnectingWallet(true);
      await connectWallet();
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setConnectingWallet(false);
    }
  };

  // Initialize verification status
  useEffect(() => {
    const certificates = loadVerifiedCertificates();
    setVerifiedCertificates(certificates);

    const alreadyVerified = checkIfAlreadyVerified();
    setIsAlreadyVerified(alreadyVerified);

    if (isPremium || alreadyVerified) {
      setCanVerify(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificateId, universityAddress, studentAddress, isPremium]);





  const handleView = async (add: string, hash: string) => {
    try {
      const res = await axios.post("http://localhost:5000/api/student/view",
        { add }, { withCredentials: true });
      setIssuedBy(res.data.university);
      setHash(hash);
      window.scrollTo({ top: 1200, behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching university details:', error);
      toast.error('Failed to load university details');
    }
  };

  const handleStripePayment = async (): Promise<void> => {
    const stripe = await loadStripe("pk_test_51QEn8vD5MY0XuWE68E1BY1X1EiSaEAVROhJF5OoIbDV9f8S4b9NJ9RJMVXC2W0dYnu598qpKIq7H4ustwfls8zdc003AEUjMiJ");

    try {
      setProcessingPayment(true);

      const response = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: "Certificate Verification",
          amount: 250,
          successUrl: `${window.location.origin}/student/certificates/${universityAddress}/${studentAddress}/${certificateId}`,
          cancelUrl: `${window.location.origin}/student/certificates/${universityAddress}/${studentAddress}/${certificateId}`,
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

  // Handle payment result on page load
  useEffect(() => {
    const handlePaymentResult = async () => {
      if (!sessionId || paymentProcessed) return;

      setProcessingPayment(true);
      setPaymentProcessed(true);

      try {
        const response = await fetch('http://localhost:5000/api/payment/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
          credentials: 'include',
        });

        const result = await response.json();

        if (result.success && result.paymentStatus === 'paid') {
          toast.success('Payment successful! You can now verify the certificate.');

          // Save verification status to localStorage
          if (certificateId && universityAddress && studentAddress) {
            const verificationRecord: VerifiedCertificate = {
              certificateId,
              universityAddress,
              studentAddress,
              timestamp: Date.now(),
              paymentSessionId: sessionId
            };
            saveVerifiedCertificate(verificationRecord);
          }

          setCanVerify(true);
          setIsAlreadyVerified(true);
        } else {
          toast.error('Payment failed or cancelled. Please try again.');
          setCanVerify(false);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('Payment verification failed. Please try again.');
        setCanVerify(false);
      } finally {
        setProcessingPayment(false);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handlePaymentResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, paymentProcessed, certificateId, universityAddress, studentAddress]);

  // Enhanced certificate fetching
  useEffect(() => {
    const fetchCertificate = async () => {
      if (!contractInstance || !universityAddress || !studentAddress || !certificateId || !canVerify || !isWalletConnected) {
        if (!canVerify && !processingPayment) {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Enhanced error checking for parameters
        if (!universityAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error('Invalid university address format');
        }
        if (!studentAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error('Invalid student address format');
        }

        console.log("Fetching certificate with params:", {
          universityAddress,
          studentAddress,
          certificateId
        });

        let certificateData;

        try {
          // Try to get certificate using verifyDegree first
          const verificationData = await contractInstance.verifyDegree(
            universityAddress,
            studentAddress,
            certificateId
          );

          // Cross-check with getStudentCertificates for accurate isValid status
          let actualIsValid = verificationData[5];

          try {
            const studentCerts = await contractInstance.getStudentCertificates(studentAddress);
            const matchingCert = studentCerts.find((cert: { certificateId: string; issuedBy: string; }) =>
              cert.certificateId === certificateId &&
              cert.issuedBy.toLowerCase() === universityAddress.toLowerCase()
            );

            if (matchingCert) {
              actualIsValid = matchingCert.isValid;
              console.log("Cross-verified isValid status:", actualIsValid);
            }
          } catch (crossCheckError) {
            console.warn("Could not cross-check with student certificates:", crossCheckError);
          }

          certificateData = {
            studentName: verificationData[0],
            course: verificationData[1],
            rollNo: verificationData[2],
            issueDate: verificationData[3],
            ipfsHash: verificationData[4],
            isValid: actualIsValid,
            issuedBy: verificationData[6],
          };

        } catch (verifyError) {
          console.error("verifyDegree failed:", verifyError);

          // Fallback to getStudentCertificates
          const studentCerts = await contractInstance.getStudentCertificates(studentAddress);
          const matchingCert = studentCerts.find((cert: { certificateId: string; issuedBy: string; }) =>
            cert.certificateId === certificateId &&
            cert.issuedBy.toLowerCase() === universityAddress.toLowerCase()
          );

          if (!matchingCert) {
            throw new Error('Certificate not found');
          }

          certificateData = matchingCert;
        }

        // Validate certificate data
        if (!certificateData.studentName || !certificateData.course) {
          throw new Error('Invalid certificate data received');
        }

        setCertificateData(certificateData);
        setError(null);

      } catch (err: unknown) {
        console.error('Error fetching certificate:', err);

        let errorMessage = "Certificate verification failed.";

        if (typeof err === "object" && err !== null) {
          const errorObj = err as { message?: string; code?: string };
          if (errorObj.message?.includes('Invalid university address')) {
            errorMessage = "Invalid university address format.";
          } else if (errorObj.message?.includes('Invalid student address')) {
            errorMessage = "Invalid student address format.";
          } else if (errorObj.message?.includes('Certificate not found')) {
            errorMessage = "Certificate not found. Please check the URL parameters.";
          } else if (errorObj.message?.includes('execution reverted')) {
            errorMessage = "Certificate does not exist or has been removed.";
          } else if (errorObj.message?.includes('network')) {
            errorMessage = "Network error. Please check your internet connection.";
          } else if (errorObj.code === 'NETWORK_ERROR') {
            errorMessage = "Unable to connect to blockchain. Please try again.";
          }
        }

        setError(errorMessage);
        setCertificateData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractInstance, universityAddress, studentAddress, certificateId, canVerify, isWalletConnected]);

  // Chrome-optimized clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid Date';
    }
  };

  const openIpfsLink = (ipfsHash: string) => {
    try {
      const cleanHash = ipfsHash.replace("ipfs://", "");
      const url = `https://ipfs.io/ipfs/${cleanHash}`;
      console.log("Opening IPFS URL:", url);

      const newWindow = window.open(url, "_blank");
      if (newWindow) {
        newWindow.opener = null;
      }
    } catch (err) {
      console.error('Error opening IPFS link:', err);
      toast.error('Failed to open IPFS link');
    }
  };

  // Show payment processing screen
  if (processingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Processing Payment...
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your payment and prepare certificate verification.
          </p>
        </div>
      </div>
    );
  }

  // Show payment required screen for non-premium users who haven't verified this certificate
  if (!canVerify && !isPremium && !isAlreadyVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Certificate Verification
            </h1>
            <p className="text-gray-600 text-lg">
              Blockchain-powered credential verification system
            </p>
          </header>

          {/* Verification Status Info */}
          {verifiedCertificates.length > 0 && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-semibold">Previously Verified Certificates</span>
                  </div>
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    {verifiedCertificates.length} certificate(s)
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={clearAllVerifications}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Verifications</span>
                  </button>
                </div>
                <p className="text-center text-gray-600 text-sm mt-3">
                  Clear previous verifications if you want to verify them again
                </p>
              </div>
            </div>
          )}

          {/* Payment Required Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-center text-white">
                <div className="text-center">
                  <CreditCard className="w-12 h-12 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold">Payment Required</h2>
                  <p className="text-white/90 mt-1">
                    Verify certificates with blockchain security
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Premium Verification Service
                </h3>
                <p className="text-gray-600 mb-6">
                  Get instant access to blockchain-verified certificate data with our secure verification service.
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100 mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">₹250</div>
                  <div className="text-gray-600">One-time verification fee per certificate</div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Instant blockchain verification</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Tamper-proof certificate validation</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Access to IPFS stored documents</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>30-day verification validity</span>
                </div>
              </div>

              <button
                onClick={handleStripePayment}
                disabled={processingPayment}
                className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>Pay ₹250 & Verify Certificate</span>
              </button>

              <p className="text-center text-gray-500 text-sm mt-4">
                Secure payment powered by Stripe • Your data is protected
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contractInstance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Connect Wallet
            </h1>
            <p className="text-gray-600 text-lg">
              Connect your wallet to access certificate verification
            </p>
          </header>

          {/* Wallet Connection Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-center text-white">
                <div className="text-center">
                  <Wallet className="w-12 h-12 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold">Wallet Required</h2>
                  <p className="text-white/90 mt-1">
                    Connect your Web3 wallet to view certificate details
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <WifiOff className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Wallet Not Connected
                </h3>
                <p className="text-gray-600 mb-6">
                  You have successfully paid for certificate verification. Now connect your wallet to access the blockchain and view certificate details.
                </p>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100 mb-6">
                  <div className="text-lg font-semibold text-amber-800 mb-2">Payment Verified ✓</div>
                  <div className="text-amber-700 text-sm">Your payment has been processed successfully</div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Secure wallet connection</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Access to blockchain verification</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>View complete certificate details</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>No additional charges</span>
                </div>
              </div>

              <button
                onClick={handleConnectWallet}
                disabled={connectingWallet}
                className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center space-x-2"
              >
                {connectingWallet ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Connecting Wallet...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>

              <p className="text-center text-gray-500 text-sm mt-4">
                We support MetaMask and other Web3 wallets
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Certificate Verification
          </h1>
          <p className="text-gray-600 text-lg">
            Blockchain-powered credential verification system
          </p>
        </header>

        {/* Verification Status & Controls */}
        {isAlreadyVerified && !isPremium && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">Certificate Already Verified</span>
                </div>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  Premium Access
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={clearCertificateVerification}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Clear This Verification</span>
                </button>
                <button
                  onClick={clearAllVerifications}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Verifications</span>
                </button>
              </div>
              <p className="text-center text-gray-600 text-sm mt-3">
                You can clear verification status if you want to pay again or test the payment flow
              </p>
            </div>
          </div>
        )}



        <main className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-6">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Verifying Certificate
              </h3>
              <p className="text-gray-600">
                Verifying certificate on blockchain...
              </p>
              <div className="mt-6 w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          ) : error ? (
            error.includes('Certificate not found') ? (
              // Certificate Not Found Screen
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                  <header className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl shadow-lg mb-4">
                      <XCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      Certificate Not Found
                    </h1>
                    <p className="text-gray-600 text-lg">
                      The requested certificate could not be found
                    </p>
                  </header>

                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                    <div className="p-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <FileCheck className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-red-800 mb-2">
                        Certificate Not Found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        The certificate with the provided details does not exist on the blockchain or may have been removed.
                      </p>

                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <div className="text-left space-y-2 text-sm">
                          <div><strong>Certificate ID:</strong> {certificateId}</div>
                          <div><strong>University:</strong> {universityAddress?.slice(0, 8)}...{universityAddress?.slice(-6)}</div>
                          <div><strong>Student:</strong> {studentAddress?.slice(0, 8)}...{studentAddress?.slice(-6)}</div>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm text-gray-600 mb-6">
                        <p>• Please verify the URL parameters are correct</p>
                        <p>• The certificate may have been revoked by the institution</p>
                        <p>• Contact the issuing institution for assistance</p>
                      </div>

                      <button
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // General Error Screen  
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">
                  Verification Failed
                </h3>
                <div className="bg-red-100 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2 max-w-md mx-auto">
                  <AlertCircle className="text-red-500" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  aria-label="Retry verification"
                >
                  Try Again
                </button>
              </div>
            )
          ) : certificateData ? (
            <>
              {/* Validity Status Banner */}
              <section
                className={`p-6 ${certificateData.isValid
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-gradient-to-r from-red-500 to-pink-600"
                  } text-white`}
              >
                <div className="flex items-center justify-center space-x-3">
                  {certificateData.isValid ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">
                      {certificateData.isValid
                        ? "Certificate Verified ✓"
                        : "Certificate Revoked by Institute ✗"}
                    </h2>
                    <p className="text-white/90 mt-1">
                      {certificateData.isValid
                        ? "This certificate is authentic and verified on blockchain"
                        : "This certificate has been revoked by the issuing institution"}
                    </p>
                  </div>
                </div>
              </section>



              {/* Certificate Details */}
              <section className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Student Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Student Details
                      </h3>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <User className="text-gray-600" />
                          <span className="font-medium text-gray-700">
                            Student Name:
                          </span>
                          <span className="text-gray-900 font-semibold">
                            {certificateData.studentName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="text-gray-600" />
                          <span className="font-medium text-gray-700">
                            Roll Number:
                          </span>
                          <span className="text-gray-900 font-semibold">
                            {certificateData.rollNo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="text-gray-600" />
                        <span className="font-medium text-gray-700">Course:</span>
                        <span className="text-gray-900 font-semibold">
                          {certificateData.course}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Institution & Verification */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Institution Details
                      </h3>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-100">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="text-gray-600" />
                          <span className="font-medium text-gray-700">
                            Issued By:
                          </span>
                          <span className="text-gray-900 font-semibold truncate">
                            {certificateData.issuedBy}
                          </span>
                          <button
                            onClick={() => copyToClipboard(certificateData.issuedBy)}
                            aria-label="Copy issuer address"
                          >
                            <Copy
                              className={`w-4 h-4 ${copied === certificateData.issuedBy
                                ? "text-green-500"
                                : "text-gray-400"
                                } cursor-pointer hover:text-gray-600 transition-colors`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="text-gray-600" />
                          <span className="font-medium text-gray-700">
                            Issue Date:
                          </span>
                          <span className="text-gray-900 font-semibold">
                            {formatDate(certificateData.issueDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
                      <div className="flex items-center gap-2">
                        <FileCheck className="text-gray-600" />
                        <span className="font-medium text-gray-700">
                          Certificate ID:
                        </span>
                        <span className="text-gray-900 font-semibold font-mono text-sm truncate">
                          {certificateId}
                        </span>
                        <button
                          onClick={() => copyToClipboard(certificateId!)}
                          aria-label="Copy certificate ID"
                        >
                          <Copy
                            className={`w-4 h-4 ${copied === certificateId
                              ? "text-green-500"
                              : "text-gray-400"
                              } cursor-pointer hover:text-gray-600 transition-colors`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IPFS Hash Section */}
                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Blockchain Verification
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Hash className="text-gray-600 flex-shrink-0" />
                      <span className="font-medium text-gray-700">IPFS Hash:</span>
                      <code className="bg-white px-3 py-1 rounded-lg text-sm font-mono text-gray-800 border break-all">
                        {certificateData.ipfsHash}
                      </code>
                      <button
                        onClick={() => copyToClipboard(certificateData.ipfsHash)}
                        aria-label="Copy IPFS hash"
                      >
                        <Copy
                          className={`w-4 h-4 ${copied === certificateData.ipfsHash
                            ? "text-green-500"
                            : "text-gray-400"
                            } cursor-pointer hover:text-gray-600 transition-colors flex-shrink-0`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Building2 className="text-gray-600 flex-shrink-0" />
                      <span className="font-medium text-gray-700">
                        University Address:
                      </span>
                      <code className="bg-white px-3 py-1 rounded-lg text-sm font-mono text-gray-800 border break-all">
                        {universityAddress}...{universityAddress?.slice(-6)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(universityAddress!)}
                        aria-label="Copy university address"
                      >
                        <Copy
                          className={`w-4 h-4 ${copied === universityAddress
                            ? "text-green-500"
                            : "text-gray-400"
                            } cursor-pointer hover:text-gray-600 transition-colors flex-shrink-0`}
                        />
                      </button>
                      <button
                        onClick={() => universityAddress && handleView(universityAddress, certificateData.ipfsHash)}
                        disabled={!universityAddress}
                        className="text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
                      >View</button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <User className="text-gray-600 flex-shrink-0" />
                      <span className="font-medium text-gray-700">
                        Student Address:
                      </span>
                      <code className="bg-white px-3 py-1 rounded-lg text-sm font-mono text-gray-800 border break-all">
                        {studentAddress}...{studentAddress?.slice(-6)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(studentAddress!)}
                        aria-label="Copy student address"
                      >
                        <Copy
                          className={`w-4 h-4 ${copied === studentAddress
                            ? "text-green-500"
                            : "text-gray-400"
                            } cursor-pointer hover:text-gray-600 transition-colors flex-shrink-0`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => openIpfsLink(certificateData.ipfsHash)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    aria-label="View certificate on IPFS"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View on IPFS
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    aria-label="Print certificate"
                  >
                    <FileCheck className="w-5 h-5" />
                    Print Certificate
                  </button>
                </div>
              </section>
            </>
          ) : null}
        </main>

        {/* Additional Info Card */}
        <section className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              About Blockchain Verification
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800 mb-1">Tamper-Proof</p>
                <p>
                  Certificate data is immutably stored on blockchain, preventing
                  any unauthorized modifications.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800 mb-1">
                  Real-Time Verification
                </p>
                <p>
                  Instant verification through smart contracts eliminates the need
                  for manual processes.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Globe className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800 mb-1">Global Access</p>
                <p>
                  Certificates can be verified anywhere in the world with
                  blockchain connectivity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Verification Management Section */}
        {(verifiedCertificates.length > 0 || isAlreadyVerified) && (
          <section className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 mt-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Verification Management
              </h3>
            </div>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Verified Certificates: {verifiedCertificates.length}
                  </span>
                </div>
                <p className="text-green-700 text-sm">
                  Your verified certificates are stored locally for 30 days.
                  You can manage them using the buttons above.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    Verification Validity
                  </span>
                </div>
                <p className="text-blue-700 text-sm">
                  Each certificate verification is valid for 30 days from the time of payment.
                  After expiry, you&apos;ll need to pay again to verify the same certificate.
                </p>
              </div>
            </div>
          </section>
        )}

        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Blockchain Technology • Secure • Transparent • Immutable</p>
          <p className="mt-2">© 2025 Certificate Verification System. All rights reserved.</p>
        </footer>
      </div>
      {issuedBy && <UniversityDisplay issuedBy={issuedBy} hash={hash} />}
    </div>
  );
};

export default CertificateVerification;