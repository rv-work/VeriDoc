"use client"

import React from 'react';
import { Shield, University, Users, Award, QrCode, CheckCircle, Globe } from 'lucide-react';
import { useWeb3 } from './context/Web3Context';

const HomePage = () => {
 const { address} = useWeb3()

  const features = [
    {
      icon: <University className="w-8 h-8" />,
      title: "University Registration",
      description: "Universities can request to join our platform and get verified by admins"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Certificate Issuance",
      description: "Verified institutions can issue degrees and certificates directly to students"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Student Dashboard",
      description: "Students can view, manage and share their verified credentials"
    },
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "Easy Verification",
      description: "Generate QR codes and shareable links for instant credential verification"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "University Requests",
      description: "Educational institutions request to join the platform"
    },
    {
      number: "02",
      title: "Admin Verification",
      description: "Platform admins verify and approve university applications"
    },
    {
      number: "03",
      title: "Certificate Upload",
      description: "Verified universities upload student degrees and certificates"
    },
    {
      number: "04",
      title: "Student Access",
      description: "Students access their credentials through secure dashboard"
    },
    {
      number: "05",
      title: "Share & Verify",
      description: "Generate QR codes and links for employers to verify credentials"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 inline-block mb-8">
            <span className="text-blue-800 font-semibold">🎓 Blockchain-Powered Credential Verification</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Secure & Instant
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Degree Verification</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            A revolutionary platform connecting universities, students, and employers through blockchain technology. 
            Verify academic credentials instantly with tamper-proof security.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r cursor-pointer from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Get Started Today
            </button>
            <button className="border-2  cursor-pointer border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for secure, transparent, and efficient credential management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl mb-6 w-fit group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                  <div className="text-blue-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to revolutionize credential verification
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 transform -translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Who Can Use Our Platform
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <University className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Universities</h3>
              <p className="text-gray-600 mb-6">Join our platform to issue tamper-proof digital certificates and degrees to your students.</p>
              <ul className="text-left space-y-2 text-gray-600">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Easy registration process</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Bulk certificate upload</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Real-time verification</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <Users className="w-16 h-16 text-purple-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Students</h3>
              <p className="text-gray-600 mb-6">Access and share your verified academic credentials with ease and confidence.</p>
              <ul className="text-left space-y-2 text-gray-600">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Secure credential storage</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> QR code generation</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Instant sharing</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <Globe className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Employers</h3>
              <p className="text-gray-600 mb-6">Verify candidate credentials instantly with complete trust and transparency.</p>
              <ul className="text-left space-y-2 text-gray-600">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Instant verification</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Tamper-proof records</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> No fake certificates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">VeriDoc</h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Revolutionizing credential verification through blockchain technology. 
              Secure, transparent, and instantly verifiable academic credentials.
            </p>
            {address && (
              <div className="bg-gray-800 rounded-lg p-4 inline-block">
                <p className="text-sm text-gray-400 mb-1">Contract Address:</p>
                <p className="font-mono text-blue-400">{address}</p>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

  


