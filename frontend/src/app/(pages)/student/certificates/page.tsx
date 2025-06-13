'use client';

import { useWeb3 } from '@/app/context/Web3Context';
import Link from 'next/link';
import React, { useEffect, useState, useMemo} from 'react';
import { 
  Shield, 
  Eye, 
  Calendar, 
  User, 
  Hash, 
  Building2, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  RefreshCw,
  Search,
  Grid,
  List,
  Award,
  TrendingUp,
  Copy, Share2, X,
  
} from 'lucide-react';

import QRCode from 'react-qr-code';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import UniversityDisplay from '@/app/components/UniversityDetails';

interface Certificate {
  certificateId: string;
  studentName: string;
  course: string;
  rollNo: string;
  issueDate: string;
  ipfsHash: string;
  isValid: boolean;
  issuedBy: string;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'valid' | 'revoked';

const StudentDashboard: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState<boolean>(false);
  const [issuedBy , setIssuedBy] = useState(null)
  const [hash , setHash] = useState("")
   const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    revoked: 0
  });

  const { contractInstance, address } = useWeb3();

  const [qrLink, setQrLink] = useState<string | null>(null);

  const handleClick = (certificateId: string, issuedBy: string) => {
    const link = `http://localhost:3000/student/certificates/${issuedBy}/${address}/${certificateId}`;
    setQrLink(link);
    handleShare()
  };

  const handleCopy = () => {
    if (qrLink) {
      navigator.clipboard.writeText(qrLink);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleShare = async () => {
    if (navigator.share && qrLink) {
      try {
        await navigator.share({
          title: 'Certificate Verification Link',
          url: qrLink,
        });
      } catch (error) {
        alert('Sharing failed. ' + (error instanceof Error ? error.message : String(error)));
      }
    } else {
      alert('Sharing not supported on this browser.');
    }
  };

  const handleIssuedBy = async (add : string) => {
     const res = await axios.post("http://localhost:5000/api/student/view" , 
      { add } , {withCredentials : true})
    setIssuedBy(res.data.university)
    console.log("uni : " , issuedBy)
  }



  const fetchCertificates = async (): Promise<void> => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected');
      return;
    }

    if (!contractInstance || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      const certs: Certificate[] = await contractInstance.getStudentCertificates(address);
      console.log("cer : " , certs)

      const validCerts = certs.filter(cert => 
        cert.certificateId && cert.studentName && cert.course && cert.rollNo && cert.issueDate && cert.ipfsHash && cert.issuedBy
      );

      setCertificates(validCerts);
      setStats({
        total: validCerts.length,
        valid: validCerts.filter(cert => cert.isValid).length,
        revoked: validCerts.length - validCerts.filter(cert => cert.isValid).length
      });

      toast.success(`Found ${validCerts.length} certificates`);
      console.log("certi : " , certificates)
    } catch (err: unknown) {
      console.error('Error fetching certificates:', err);
      toast.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered certificates
  const filteredCertificates = useMemo(() => {
    let filtered = certificates;

    if (filterType === 'valid') {
      filtered = filtered.filter(cert => cert.isValid);
    } else if (filterType === 'revoked') {
      filtered = filtered.filter(cert => !cert.isValid);
    }

    if (searchTerm) {
      filtered = filtered.filter(cert => 
        cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [certificates, searchTerm, filterType]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  useEffect(() => {
    if (contractInstance && address) {
      fetchCertificates();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractInstance, address]);

  const StatCard: React.FC<{ 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color: string;
    gradient: string;
  }> = ({ title, value, icon, color, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} p-6 rounded-xl shadow-lg border border-gray-100`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const CertificateCard: React.FC<{ certificate: Certificate; index: number }> = ({ certificate, index }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className={`h-2 ${certificate.isValid ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}></div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${certificate.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
              <Award className={`w-5 h-5 ${certificate.isValid ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {certificate.course}
              </h3>
              <p className="text-sm text-gray-500">Certificate #{index + 1}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {certificate.isValid ? (
              <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Valid</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                <XCircle className="w-4 h-4" />
                <span>Revoked</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Student:</span>
              <span className="font-medium text-gray-900">{certificate.studentName}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Roll No:</span>
              <span className="font-medium text-gray-900">{certificate.rollNo}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Issued:</span>
              <span className="font-medium text-gray-900">{formatDate(certificate.issueDate)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">By:</span>
              <span 
               onClick={() => {
                setHash(certificate.ipfsHash)
                handleIssuedBy(certificate.issuedBy)}}
              className="font-medium cursor-pointer text-blue-600 truncate">{certificate.issuedBy}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => copyToClipboard(certificate.certificateId)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={`Copy certificate ID ${certificate.certificateId}`}
            >
              <Hash className="w-4 h-4" />
              <span className="font-mono">{certificate.certificateId.slice(0, 8)}...</span>
            </button>
            
            <div className="flex items-center space-x-2">
            
             <button
               onClick={() => handleClick(certificate.certificateId , certificate.issuedBy)}
               className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded"
             >
               Share
             </button>

              <Link
                href={`https://ipfs.io/ipfs/${certificate.ipfsHash.replace("ipfs://", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                aria-label={`View certificate ${certificate.certificateId} on IPFS`}
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const CertificateListItem: React.FC<{ certificate: Certificate; index: number }> = ({ certificate }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className={`p-2 rounded-lg ${certificate.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
            <Award className={`w-5 h-5 ${certificate.isValid ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          
          <div className="flex-1 grid grid-cols-4 gap-4">
            <div>
              <p className="font-semibold text-gray-900">{certificate.course}</p>
              <p className="text-sm text-gray-500">{certificate.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Roll: {certificate.rollNo}</p>
              <p className="text-sm text-gray-500">{formatDate(certificate.issueDate)}</p>
            </div>
            <div>
              <p 
               onClick={() => {
                setHash(certificate.ipfsHash)
                handleIssuedBy(certificate.issuedBy)}}
               className="text-sm cursor-pointer text-blue-600 truncate">
                {certificate.issuedBy}</p>
            </div>
            <div className="flex items-center justify-end space-x-2">
              {certificate.isValid ? (
                <span className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  <span>Valid</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  <XCircle className="w-3 h-3" />
                  <span>Revoked</span>
                </span>
              )}
            </div>
          </div>
        </div>

         <button
               onClick={() => handleClick(certificate.certificateId , certificate.issuedBy)}
               className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded"
             >
               Share
             </button>
        
        <Link
          href={`https://ipfs.io/ipfs/${certificate.ipfsHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium ml-4"
          aria-label={`View certificate ${certificate.certificateId} on IPFS`}
        >
          <Eye className="w-4 h-4" />
          <span>View</span>
        </Link>
      </div>
    </div>
  );

  if (!address) {
    return (
      <div className="max-w-5xl mx-auto p-6 mt-8">
        <div className="text-center py-12">
          <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Shield className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to view your certificates.</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-7xl mx-auto p-6 mt-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">🎓 Student Dashboard</h1>
            <p className="text-blue-100 text-lg">
              Welcome back! Here are your certificates and achievements.
            </p>
            <div className="flex items-center space-x-2 mt-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 w-fit">
              <User className="w-4 h-4" />
              <span className="font-mono text-sm">{address}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Certificates"
          value={stats.total}
          icon={<Award className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          gradient="from-blue-50 to-blue-100"
        />
        <StatCard
          title="Valid Certificates"
          value={stats.valid}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="bg-green-500"
          gradient="from-green-50 to-green-100"
        />
        <StatCard
          title="Revoked Certificates"
          value={stats.revoked}
          icon={<XCircle className="w-6 h-6 text-white" />}
          color="bg-red-500"
          gradient="from-red-50 to-red-100"
        />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                aria-label="Search certificates"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-4 py-2 text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              aria-label="Filter certificates"
            >
              <option value="all">All Certificates</option>
              <option value="valid">Valid Only</option>
              <option value="revoked">Revoked Only</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Switch to grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Switch to list view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={fetchCertificates}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              aria-label="Refresh certificates"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Certificates Display */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2 text-gray-500">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading certificates...</span>
            </div>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Found</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'You haven\'t received any certificates yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Your Certificates ({filteredCertificates.length})
              </h2>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCertificates.map((certificate, index) => (
                  <CertificateCard key={certificate.certificateId} certificate={certificate} index={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCertificates.map((certificate, index) => (
                  <CertificateListItem key={certificate.certificateId} certificate={certificate} index={index} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    <div >
       {issuedBy && <UniversityDisplay issuedBy={issuedBy} hash ={hash} />}

       
      {showModal && qrLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md text-center relative shadow-lg">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>

            <p className="font-semibold text-gray-800 mb-2">Scan to verify certificate:</p>

            <QRCode value={qrLink} size={200} className="mx-auto" />

            <p className="text-sm text-blue-600 mt-4 break-words">{qrLink}</p>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-sm px-3 py-1 border rounded text-blue-700 hover:bg-blue-50"
              >
                <Copy size={16} /> Copy
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-sm px-3 py-1 border rounded text-green-700 hover:bg-green-50"
              >
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
   
    </>
);
};

export default StudentDashboard;
















//href={`https://ipfs.io/ipfs/${certificate.ipfsHash.replace("ipfs://", "")}`}