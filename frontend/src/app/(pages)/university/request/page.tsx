'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  University, 
  Mail, 
  Globe, 
  FileText, 
  User, 
  Briefcase, 
  Phone, 
  Wallet,
  Send,
  CheckCircle,
  Building2,
  Shield
} from 'lucide-react';

type UniversityType = 'Government' | 'Private' | 'Deemed' | 'Autonomous' | '';

interface FormData {
  universityName: string;
  type: UniversityType;
  website: string;
  registrationNumber: string;
  contactPerson: string;
  designation: string;
  phone: string;
  email: string;
  walletAddress: string;
}

const Request = () => {
  
  const [isDone , setIdDone] = useState("");
  const [checkEmail , setCheckEmail] = useState<string>("")


  const [form, setForm] = useState<FormData>({
    universityName: '',
    type: '',
    website: '',
    registrationNumber: '',
    contactPerson: '',
    designation: '',
    phone: '',
    email: '',
    walletAddress: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);


    const checkStatus = async () => {
      const res = await axios.post("http://localhost:5000/api/university/status" , {
        walletAddress : checkEmail } , {withCredentials : true})
        console.log(res.data)
      if(res.data) {
         setIdDone(res.data.status)
      }
    }
    


  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/university/request', form,
        {withCredentials : true}
      );
      toast.success('Request submitted successfully! We will review your application.');
      setSubmitted(true);

      console.log(res.data)
      
      setTimeout(() => {
        setForm({
          universityName: '',
          type: '',
          website: '',
          registrationNumber: '',
          contactPerson: '',
          designation: '',
          phone: '',
          email: '',
          walletAddress: ''
        });
        setSubmitted(false);
      }, 3000);
      
    } catch (err) {
      toast.error('Failed to submit request. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Request Submitted Successfully!
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Thank you for your interest in joining VeriDoc. Our team will review your application and get back to you within 2-3 business days.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>Next Steps:</strong> You&apos;ll receive a confirmation email shortly. Please check your spam folder if you don&apos;t see it in your inbox.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }





  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      
 

      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-3 w-16 h-16 mx-auto mb-6 shadow-lg">
            <University className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Join VeriDoc Network
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Partner with us to revolutionize credential verification through blockchain technology.
            Submit your institution details to get started.
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <Building2 className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">University Registration Request</h2>
            </div>
            <p className="text-blue-100 mt-2">Please fill out all required information accurately</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Institution Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2 pb-2 border-b border-gray-200">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Institution Information</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">University Name *</label>
                  <div className="relative">
                    <University className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="universityName"
                      placeholder="Enter full university name"
                      value={form.universityName}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 text-black py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Institution Type *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none"
                    >
                      <option value="">Select Institution Type</option>
                      <option value="government">🏛️ Government</option>
                      <option value="private">🏢 Private</option>
                      <option value="deemed">🎓 Deemed University</option>
                      <option value="autonomous">⚡ Autonomous</option>
                      <option value="central">⚡ Central</option>
                      <option value="state">⚡ State</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Official Website *</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="website"
                      placeholder="https://www.university.edu"
                      value={form.website}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Registration Number *</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="registrationNumber"
                      placeholder="UGC/AICTE Registration Number"
                      value={form.registrationNumber}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2 pb-2 border-b border-gray-200">
                <User className="w-5 h-5 text-blue-600" />
                <span>Contact Information</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Contact Person Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="contactPerson"
                      placeholder="Full name of authorized person"
                      value={form.contactPerson}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Designation *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="designation"
                      placeholder="e.g., Registrar, Dean, Director"
                      value={form.designation}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Official Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="email"
                      placeholder="official@university.edu"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 XXXXX XXXXX"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2 pb-2 border-b border-gray-200">
                <Wallet className="w-5 h-5 text-blue-600" />
                <span>Blockchain Wallet</span>
              </h3>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ethereum Wallet Address 
                  <span className="text-gray-500 text-xs ml-2">(Mandatory*** )</span>
                </label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="walletAddress"
                    placeholder="0x... (Can not Leave empty if you don't have one yet , create new one )"
                    value={form.walletAddress}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  💡 Don&apos;t have a wallet? No worries! We&apos;ll help you set one up after approval.
                </p>
              </div>
            </div>

            {/* Information Notice */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>What happens next?</span>
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Our verification team will review your institution details</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>We may contact you for additional documentation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Upon approval, you&apos;ll receive login credentials and onboarding materials</span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex cursor-pointer items-center justify-center space-x-3 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Registration Request</span>
                  </>
                )}
              </button>


            
            </div>

            <p className="text-center text-sm text-gray-600 pt-4">
              By submitting this form, you agree to our terms of service and verify that all information provided is accurate.
            </p>

            
          </form>
      <div className="space-y-4 p-8 mb-4  border rounded-lg shadow-sm bg-white w-full max-w-md mx-auto">
        <input
          type="text"
          onChange={(e) => setCheckEmail(e.target.value)}
          placeholder="Enter your address"
          className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    
        <button
          onClick={checkStatus}
          className="w-full bg-blue-600 cursor-pointer text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Check Status
        </button>
    
        <div className="text-sm text-gray-800 text-center">
         {isDone.length !==  0 && <span className="font-semibold text-black">Status: {isDone ? "Approved" : "Pending" }</span>  } 
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default Request;