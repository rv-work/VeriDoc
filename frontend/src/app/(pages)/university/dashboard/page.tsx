"use client";

import React, { useEffect, useState } from "react";
import {
  Shield,
  User,
  Building2,
  Award,
  Mail,
  Phone,
  Globe,
  FileText,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useWeb3 } from "@/app/context/Web3Context";
import toast from "react-hot-toast";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  gender: string;
  subscription: string;
  walletAddress: string;
  dob: string;
};

type University = {
  id: string;
  universityName: string;
  type: string;
  website: string;
  registrationNumber: string;
  contactPerson: string;
  designation: string;
  phone: string;
  email: string;
  walletAddress: string;
  isApproved: boolean;
};

type Certificate = {
  certificateId: string;
  studentName: string;
  course: string;
  rollNo: string;
  issueDate: string;
  ipfsHash: string;
  issuedBy: string;
  isValid: boolean;
  university: string;
  studentWallet: string
};

type Stats = {
  totalInstitutes: number;
  totalCertificates: number;
  activeCertificates: number;
  revokedCertificates: number;
};

const InstitutesDashboard: React.FC = () => {
  const { contractInstance, address } = useWeb3();

  const [user, setUser] = useState<User | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  // Changed: Use object to track loading state for each certificate
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [stats, setStats] = useState<Stats>({
    totalInstitutes: 0,
    totalCertificates: 0,
    activeCertificates: 0,
    revokedCertificates: 0
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("https://veridoc.onrender.com/api/university/details", { credentials: "include" });
      const data = await response.json();
      setUser(data.user);
      setUniversities(data.universities);
      setStats({
        totalInstitutes: data.universities.length,
        totalCertificates: 0,
        activeCertificates: 0,
        revokedCertificates: 0
      })
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchCertificates = async (universityWallteAddress: string) => {

    if (universityWallteAddress.toLowerCase() !== address?.toLowerCase()) {
      toast.error("Connect To Correct Wallte Account")
      return
    }

    try {
      const certs: Certificate[] = await contractInstance?.getUniversityIssuedCertificates();
      setCertificates(certs);
      console.log("certs  : ", certs)

      const active = certs.filter((c) => c.isValid).length;
      const revoked = certs.length - active;

      setStats({
        totalInstitutes: universities.length,
        totalCertificates: certs.length,
        activeCertificates: active,
        revokedCertificates: revoked
      });
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const handleRevokeCertificate = async (certificateId: string, studentWallet: string) => {
    // Set loading state for this specific certificate
    setLoadingStates(prev => ({ ...prev, [certificateId]: true }));

    try {
      await contractInstance?.revokeDegree(studentWallet, certificateId);

      setCertificates((prev) =>
        prev.map((cert) =>
          cert.certificateId === certificateId
            ? { ...cert, isValid: false }
            : cert
        )
      );

      setStats((prev) => ({
        ...prev,
        activeCertificates: prev.activeCertificates - 1,
        revokedCertificates: prev.revokedCertificates + 1
      }));

      toast.success("Certificate revoked successfully!");
    } catch (error) {
      console.error("Revoke failed:", error);
      toast.error("Failed to revoke certificate");
    } finally {
      // Remove loading state for this specific certificate
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[certificateId];
        return newState;
      });
    }
  };

  const handleViewCertificate = (certificate: Certificate) => {
    alert(`Viewing certificate: ${certificate.certificateId}`);
  };

  const handleDownloadCertificate = (certificate: Certificate) => {
    alert(`Downloading certificate: ${certificate.certificateId}`);
  };

  const getUniversityTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      government: "from-green-500 to-emerald-600",
      private: "from-blue-500 to-indigo-600",
      deemed: "from-purple-500 to-violet-600",
      autonomous: "from-orange-500 to-red-600",
      central: "from-cyan-500 to-blue-600",
      state: "from-teal-500 to-green-600",
      other: "from-gray-500 to-slate-600"
    };
    return colors[type] || colors.other;
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3 shadow-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Institute Dashboard
              </h1>
              <p className="text-gray-300">Manage your certificates and institutions</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Institutes</p>
                <p className="text-3xl font-bold text-white">{stats.totalInstitutes}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Certificates</p>
                <p className="text-3xl font-bold text-white">{stats.totalCertificates}</p>
              </div>
              <Award className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active</p>
                <p className="text-3xl font-bold text-white">{stats.activeCertificates}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Revoked</p>
                <p className="text-3xl font-bold text-white">{stats.revokedCertificates}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* User Details Section */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <User className="w-6 h-6 mr-3 text-blue-400" />
            User Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Full Name</p>
              <p className="text-white font-semibold text-lg">{user?.name}</p>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Email Address</p>
              <p className="text-white font-semibold">{user?.email}</p>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Role</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-500/30">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Subscription</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-600/20 text-purple-300 border border-purple-500/30">
                {user?.subscription ? user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1) : 'Unknown'}
              </span>
            </div>

            <div className="space-y-2 md:col-span-2">
              <p className="text-gray-400 text-sm">Wallet Address</p>
              <p className="text-white font-mono text-sm bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50">
                {user?.walletAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Universities Section */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Building2 className="w-6 h-6 mr-3 text-purple-400" />
            Your Institutes
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {universities?.map((university) => (
              <div key={university.id} className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{university.universityName}</h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getUniversityTypeColor(university.type)} text-white`}>
                        {university.type.charAt(0).toUpperCase() + university.type.slice(1)}
                      </span>
                      {university.isApproved && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 border border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Globe className="w-4 h-4 mr-2 text-blue-400" />
                    <a href={university.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                      {university.website}
                    </a>
                  </div>

                  <div className="flex items-center text-gray-300">
                    <FileText className="w-4 h-4 mr-2 text-purple-400" />
                    <span>Reg. No: {university.registrationNumber}</span>
                  </div>

                  <div className="flex items-center text-gray-300">
                    <Mail className="w-4 h-4 mr-2 text-green-400" />
                    <span>{university.email}</span>
                  </div>

                  <div className="flex items-center text-gray-300">
                    <Phone className="w-4 h-4 mr-2 text-orange-400" />
                    <span>{university.phone}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      fetchCertificates(university.walletAddress);
                      setSelectedUniversity(university.id === selectedUniversity ? null : university.id)
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                  >
                    {selectedUniversity === university.id ? 'Hide Certificates' : 'View Certificates'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Award className="w-6 h-6 mr-3 text-green-400" />
            Issued Certificates
          </h2>

          {selectedUniversity ? (
            <div className="space-y-4">
              {certificates
                .map((certificate) => (
                  <div key={certificate.certificateId} className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-bold text-white">{certificate.studentName}</h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${certificate.isValid
                            ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                            : 'bg-red-600/20 text-red-300 border border-red-500/30'
                            }`}>
                            {certificate.isValid ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Revoked
                              </>
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Certificate ID</p>
                            <p className="text-white font-mono">{certificate.certificateId}</p>
                          </div>

                          <div>
                            <p className="text-gray-400">Course</p>
                            <p className="text-white">{certificate.course}</p>
                          </div>

                          <div>
                            <p className="text-gray-400">Roll Number</p>
                            <p className="text-white">{certificate.rollNo}</p>
                          </div>

                          <div>
                            <p className="text-gray-400">Issue Date</p>
                            <p className="text-white">{formatDate(certificate.issueDate)}</p>
                          </div>

                          <div className="md:col-span-2">
                            <p className="text-gray-400">IPFS Hash</p>
                            <p className="text-white font-mono text-xs bg-gray-800/50 px-2 py-1 rounded border border-gray-700/50">
                              {certificate.ipfsHash}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewCertificate(certificate)}
                          className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 px-4 py-2 rounded-lg transition-all duration-200 text-blue-300 hover:text-blue-200"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleDownloadCertificate(certificate)}
                          className="flex items-center space-x-2 bg-green-600/20 hover:bg-green-600/30 px-4 py-2 rounded-lg transition-all duration-200 text-green-300 hover:text-green-200"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>

                      {certificate.isValid && (
                        <button
                          onClick={() => handleRevokeCertificate(certificate.certificateId, certificate.studentWallet)}
                          disabled={loadingStates[certificate.certificateId] || false}
                          className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 px-4 py-2 rounded-lg transition-all duration-200 text-red-300 hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingStates[certificate.certificateId] ? (
                            <>
                              <Clock className="w-4 h-4 animate-spin" />
                              <span>Revoking...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              <span>Revoke</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Select an institute above to view its certificates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstitutesDashboard;