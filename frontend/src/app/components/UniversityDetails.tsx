import React from 'react';
import { Building2, Globe, Phone, Mail, User, CreditCard, Hash, CheckCircle, Shield } from 'lucide-react';
import Image from 'next/image';

interface University {
  universityName: string;
  type: string;
  isApproved: boolean;
  registrationNumber: string;
  website: string;
  contactPerson: string;
  designation: string;
  phone: string;
  email: string;
  walletAddress: string;
  id: string;
}

const UniversityDisplay = ({ issuedBy, hash }: { issuedBy: University, hash: string }) => {
  const university = issuedBy;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            University Information
          </h2>
          <p className="text-gray-600">Detailed university profile and contact information</p>
        </div>
        
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-3">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{university.universityName}</h3>
                  <p className="text-blue-100 capitalize">{university.type} Institution</p>
                </div>
              </div>
              {university.isApproved && (
                <div className="flex items-center bg-green-500/20 backdrop-blur-md text-green-100 px-4 py-2 rounded-xl border border-green-400/30">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Verified</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Hash className="h-5 w-5 text-blue-600 mr-2" />
                    Basic Information
                  </h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-gray-50/80 rounded-xl hover:bg-blue-50/80 transition-all duration-200">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Hash className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Registration Number</p>
                      <p className="text-lg font-semibold text-gray-800">{university.registrationNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50/80 rounded-xl hover:bg-blue-50/80 transition-all duration-200">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Building2 className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Institution Type</p>
                      <p className="text-lg font-semibold text-gray-800 capitalize">{university.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50/80 rounded-xl hover:bg-blue-50/80 transition-all duration-200">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Globe className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Website</p>
                      <p className="text-lg font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                        {university.website}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="h-5 w-5 text-purple-600 mr-2" />
                    Contact Information
                  </h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-gray-50/80 rounded-xl hover:bg-purple-50/80 transition-all duration-200">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Contact Person</p>
                      <p className="text-lg font-semibold text-gray-800">{university.contactPerson}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50/80 rounded-xl hover:bg-purple-50/80 transition-all duration-200">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Designation</p>
                      <p className="text-lg font-semibold text-gray-800">{university.designation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50/80 rounded-xl hover:bg-purple-50/80 transition-all duration-200">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-lg font-semibold text-gray-800">{university.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50/80 rounded-xl hover:bg-purple-50/80 transition-all duration-200">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <Mail className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-lg font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                        {university.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-6">
              <div className="border-t border-gray-100 pt-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  Blockchain Information
                </h4>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200/50">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Wallet Address
                  </h5>
                  <p className="text-sm font-mono text-blue-700 bg-white/80 p-3 rounded-lg break-all border">
                    {university.walletAddress}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200/50">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    System ID
                  </h5>
                  <p className="text-sm font-mono text-purple-700 bg-white/80 p-3 rounded-lg break-all border">
                    {university.id}
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Certificate Image
                </h5>
                <div className="relative overflow-hidden rounded-lg">
                  <Image
                    src={`https://ipfs.io/ipfs/${hash.replace("ipfs://", "")}`}
                    alt={`Certificate for ${university.universityName}`}
                    width={300}
                    height={300}
                    className="object-cover w-full h-auto rounded-lg transition-transform duration-300 hover:scale-105"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAEBgIB6V1T6wAAAABJRU5ErkJggg=="
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDisplay;