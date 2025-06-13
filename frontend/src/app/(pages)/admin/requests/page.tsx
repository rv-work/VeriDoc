'use client';

import React, { useState, useEffect } from 'react';
import { 
  University, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  User, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Eye,
  Filter,
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useWeb3 } from '@/app/context/Web3Context';

enum UniversityType {
  government = 'government',
  private = 'private', 
  deemed = 'deemed',
  autonomous = 'autonomous',
  central = 'central',
  state = 'state',
  other = 'other'
}

interface UniversityRequest {
  id: string;
  universityName: string;
  type: UniversityType;
  website: string;
  registrationNumber: string;
  contactPerson: string;
  designation: string;
  phone: string;
  email: string;
  walletAddress: string;
  isApproved: boolean;
  createdAt?: string;
}

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState<UniversityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<UniversityRequest | null>(null);


  const {contractInstance , address} = useWeb3();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/pending', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log("data: " , data)
        setRequests(data.universities);
      } else {
        toast.error('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Error loading requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (universityId: string , universityWallet : string) => {
    try {
      
      if(!address){
          toast.error("Login with metamask")
      }

      const tx = await contractInstance?.addUniversity(universityWallet);
      await tx.wait(); 
      console.log("University added to smart contract:", tx.hash);
      toast.success("university added to blockchain ")

      setApproving(universityId);
      const response = await fetch('http://localhost:5000/api/admin/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ universityId })
      });

      if (response.ok) {
        toast.success('University approved successfully!');
        setRequests(prev => prev.filter(req => req.id !== universityId));
        setSelectedRequest(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to approve university');
      }
    } catch (error) {
      console.error('Error approving university:', error);
      toast.error('Error approving university');
    } finally {
      setApproving(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.universityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || request.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: UniversityType) => {
    const colors = {
      government: 'bg-blue-100 text-blue-800 border-blue-200',
      private: 'bg-purple-100 text-purple-800 border-purple-200',
      deemed: 'bg-green-100 text-green-800 border-green-200',
      autonomous: 'bg-orange-100 text-orange-800 border-orange-200',
      central: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      state: 'bg-pink-100 text-pink-800 border-pink-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || colors.other;
  };

  const getTypeIcon = (type: UniversityType) => {
    switch (type) {
      case 'government': return '🏛️';
      case 'private': return '🏢';
      case 'deemed': return '🎓';
      case 'autonomous': return '⚡';
      case 'central': return '🏛️';
      case 'state': return '🏛️';
      default: return '🏫';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-4 w-20 h-20 mx-auto mb-4 animate-pulse">
            <University className="w-12 h-12 text-white" />
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-lg">Loading university requests...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                University Requests
              </h1>
              <p className="text-gray-600">Review and approve pending university registration requests</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-800">{requests.length}</p>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center space-x-3">
                <University className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-800">{filteredRequests.length}</p>
                  <p className="text-sm text-gray-600">Filtered Results</p>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-800">Today</p>
                  <p className="text-sm text-gray-600">Review Session</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute   left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by university name, contact person, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-black pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-11 pr-8 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white min-w-[200px]"
                >
                  <option value="all">All Types</option>
                  <option value="government">Government</option>
                  <option value="private">Private</option>
                  <option value="deemed">Deemed</option>
                  <option value="autonomous">Autonomous</option>
                  <option value="central">Central</option>
                  <option value="state">State</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Pending Requests</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'No requests match your current filters.' 
                : 'All university requests have been processed.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* University Info */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-3 flex-shrink-0">
                          <University className="w-8 h-8 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800 truncate">
                              {request.universityName}
                            </h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(request.type)}`}>
                              {getTypeIcon(request.type)} {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span className="truncate">{request.contactPerson}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4" />
                              <span className="truncate">{request.designation}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{request.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>{request.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="flex items-center cursor-pointer space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      
                      <button
                        onClick={() => handleApprove(request.id , request.walletAddress)}
                        disabled={approving === request.id}
                        className={`flex items-center cursor-pointer space-x-2 px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
                          approving === request.id
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        }`}
                      >
                        {approving === request.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">University Details</h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 w-20 h-20 mx-auto mb-4">
                    <University className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedRequest.universityName}</h3>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getTypeColor(selectedRequest.type)}`}>
                    {getTypeIcon(selectedRequest.type)} {selectedRequest.type.charAt(0).toUpperCase() + selectedRequest.type.slice(1)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">Institution Information</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Website</p>
                          <Link href={selectedRequest.website} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline break-all">
                            {selectedRequest.website}
                          </Link>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Registration Number</p>
                          <p className="font-medium text-gray-400">{selectedRequest.registrationNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">Contact Information</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Contact Person</p>
                          <p className="font-medium text-gray-400">{selectedRequest.contactPerson}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Briefcase className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Designation</p>
                          <p className="font-medium text-gray-400">{selectedRequest.designation}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-400">{selectedRequest.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-400">{selectedRequest.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedRequest.walletAddress && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Wallet Address</h4>
                    <p className="font-mono text-sm break-all bg-white p-3 text-gray-400 rounded-lg border">
                      {selectedRequest.walletAddress}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="flex-1 cursor-pointer px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.id , selectedRequest.walletAddress)}
                    disabled={approving === selectedRequest.id}
                    className={`flex-1 px-4 py-3 rounded-xl cursor-pointer font-semibold transition-all duration-200 ${
                      approving === selectedRequest.id
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                    }`}
                  >
                    {approving === selectedRequest.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Approving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve University</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequestsPage;