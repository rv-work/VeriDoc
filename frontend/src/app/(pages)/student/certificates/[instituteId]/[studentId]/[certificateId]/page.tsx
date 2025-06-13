"use client"

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useWeb3 } from "@/app/context/Web3Context";
import { useParams } from "next/navigation";
import axios from "axios";
import UniversityDisplay from "@/app/components/UniversityDetails";

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

const CertificateVerification: React.FC = () => {
  const params = useParams();
  const { contractInstance } = useWeb3();
  const universityAddress = params?.instituteId as string | undefined;
  const studentAddress = params?.studentId as string | undefined;
  const certificateId = params?.certificateId as string | undefined;

  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string>("");
   const [issuedBy , setIssuedBy] = useState(null)
     const [hash , setHash] = useState("")


   const handeView = async (add : string , hash : string) => {
     const res = await axios.post("http://localhost:5000/api/student/view" , 
      { add } , {withCredentials : true})
    setIssuedBy(res.data.university)
    setHash(hash)
    window.scrollTo({ top: 1200, behavior: 'smooth' });
  }

useEffect(() => {
    const fetchCertificate = async () => {
      if (!contractInstance || !universityAddress || !studentAddress || !certificateId) return;

      try {
        setLoading(true);
        const data = await contractInstance.verifyDegree(
          universityAddress,
          studentAddress,
          certificateId
        );

        const certificate: CertificateData = {
          studentName: data[0],
          course: data[1],
          rollNo: data[2],
          issueDate: data[3],
          ipfsHash: data[4],
          isValid: data[5],
          issuedBy: data[6],
        };

        setCertificateData(certificate);
        setError(null);
      } catch {
        setError("Certificate not found or verification failed.");
        setCertificateData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [contractInstance, universityAddress, studentAddress, certificateId]);
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const openIpfsLink = (ipfsHash: string) => {
    console.log("hash : " , ipfsHash)
      window.open(`https://ipfs.io/ipfs/${ipfsHash.replace("ipfs://", "")}`, "_blank", "noopener,noreferrer");
   
  };

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

        {/* Main Verification Card */}
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
          ) : certificateData ? (
            <>
              {/* Validity Status Banner */}
              <section
                className={`p-6 ${
                  certificateData.isValid
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
                        : "Certificate Invalid ✗"}
                    </h2>
                    <p className="text-white/90 mt-1">
                      {certificateData.isValid
                        ? "This certificate is authentic and verified on blockchain"
                        : "This certificate could not be verified or is invalid"}
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
                          <span className="text-gray-900 font-semibold">
                            {certificateData.issuedBy}
                          </span>
                          <button
                            onClick={() => copyToClipboard(certificateData.issuedBy)}
                            aria-label="Copy issuer address"
                          >
                            <Copy
                              className={`w-4 h-4 ${
                                copied === certificateData.issuedBy
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
                        <span className="text-gray-900 font-semibold font-mono text-sm">
                          {certificateId}
                        </span>
                        <button
                          onClick={() => copyToClipboard(certificateId!)}
                          aria-label="Copy certificate ID"
                        >
                          <Copy
                            className={`w-4 h-4 ${
                              copied === certificateId
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
                      <code className="bg blanch px-3 py-1 rounded-lg text-sm font-mono text-gray-800 border break-all">
                        {certificateData.ipfsHash}
                      </code>
                      <button
                        onClick={() => copyToClipboard(certificateData.ipfsHash)}
                        aria-label="Copy IPFS hash"
                      >
                        <Copy
                          className={`w-4 h-4 ${
                            copied === certificateData.ipfsHash
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
                          className={`w-4 h-4 ${
                            copied === universityAddress
                              ? "text-green-500"
                              : "text-gray-400"
                          } cursor-pointer hover:text-gray-600 transition-colors flex-shrink-0`}
                        />
                      </button>
                      <button
                        onClick={() => universityAddress && handeView(universityAddress, certificateData.ipfsHash)}
                        disabled={!universityAddress}
                        className="text-gray-600 cursor-pointer"
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
                          className={`w-4 h-4 ${
                            copied === studentAddress
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

        {/* Footer */}
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Blockchain Technology • Secure • Transparent • Immutable</p>
          <p className="mt-2">© 2025 Certificate Verification System. All rights reserved.</p>
        </footer>
      </div>
        {issuedBy && <UniversityDisplay issuedBy={issuedBy} hash ={hash} />}
    </div>
  );
};

export default CertificateVerification;