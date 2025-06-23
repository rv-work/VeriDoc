"use client"

import React, { useState, useEffect } from 'react';
import { Shield, University, Users, Award, QrCode, CheckCircle, Globe, Star, Sparkles, ArrowRight, ChevronDown } from 'lucide-react';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <University className="w-8 h-8" />,
      title: "University Registration",
      description: "Universities can request to join our platform and get verified by admins",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Certificate Issuance",
      description: "Verified institutions can issue degrees and certificates directly to students",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Student Dashboard",
      description: "Students can view, manage and share their verified credentials",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "Easy Verification",
      description: "Generate QR codes and shareable links for instant credential verification",
      color: "from-orange-500 to-red-500"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "University Requests",
      description: "Educational institutions request to join the platform",
      icon: <University className="w-6 h-6" />
    },
    {
      number: "02",
      title: "Admin Verification",
      description: "Platform admins verify and approve university applications",
      icon: <Shield className="w-6 h-6" />
    },
    {
      number: "03",
      title: "Certificate Upload",
      description: "Verified universities upload student degrees and certificates",
      icon: <Award className="w-6 h-6" />
    },
    {
      number: "04",
      title: "Student Access",
      description: "Students access their credentials through secure dashboard",
      icon: <Users className="w-6 h-6" />
    },
    {
      number: "05",
      title: "Share & Verify",
      description: "Generate QR codes and links for employers to verify credentials",
      icon: <QrCode className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full px-8 py-3 inline-block mb-8 cursor-pointer hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300">
              <span className="text-white font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                🎓 Blockchain-Powered Credential Verification
                <Sparkles className="w-5 h-5" />
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
              Secure & Instant
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                Degree Verification
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              A revolutionary platform connecting universities, students, and employers through blockchain technology.
              Verify academic credentials instantly with tamper-proof security.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="group bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-10 py-5 rounded-full font-bold text-xl cursor-pointer hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-2 hover:scale-105 flex items-center gap-3">
                Get Started Today
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group border-2 border-white/30 backdrop-blur-sm text-white px-10 py-5 rounded-full font-bold text-xl cursor-pointer hover:border-white/60 hover:bg-white/10 transition-all duration-300 flex items-center gap-3">
                Learn More
                <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Platform Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need for secure, transparent, and efficient credential management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-3xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 border border-white/20 hover:border-white/40 cursor-pointer transform hover:-translate-y-4 hover:scale-105 ${activeFeature === index ? 'ring-2 ring-purple-400 shadow-purple-500/30' : ''}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>

                <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-2xl mb-6 w-fit group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                  {feature.description}
                </p>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 bg-gradient-to-br from-purple-900/50 to-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Simple steps to revolutionize credential verification
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative group cursor-pointer">
                <div className="relative">
                  <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-2xl group-hover:shadow-purple-500/50 transform group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                    <span className="relative z-10">{step.number}</span>
                  </div>

                  {/* Floating Icon */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-0 transition-all duration-300">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500 transform -translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900/50 to-purple-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Who Can Use Our Platform
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm p-10 rounded-3xl text-center shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 border border-white/20 hover:border-blue-400/50 cursor-pointer transform hover:-translate-y-6 hover:scale-105">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-2xl w-fit mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <University className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Universities</h3>
              <p className="text-gray-300 mb-8 text-lg">Join our platform to issue tamper-proof digital certificates and degrees to your students.</p>
              <ul className="text-left space-y-4 text-gray-300">
                <li className="flex items-center group-hover:text-white transition-colors"><CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" /> Easy registration process</li>
                <li className="flex items-center group-hover:text-white transition-colors"><CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" /> Bulk certificate upload</li>
                <li className="flex items-center group-hover:text-white transition-colors"><CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" /> Real-time verification</li>
              </ul>
            </div>

            <div className="group bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm p-10 rounded-3xl text-center shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 border border-white/20 hover:border-purple-400/50 cursor-pointer transform hover:-translate-y-6 hover:scale-105">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl w-fit mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Students</h3>
              <p className="text-gray-300 mb-8 text-lg">Access and share your verified academic credentials with ease and confidence.</p>
              <ul className="text-left space-y-4 text-gray-300">
                <li className="flex items-center group-hover:text-white transition-colors"><CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" /> Secure credential storage</li>
                <li className="flex items-center group-hover:text-white transition-colors"><CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" /> QR code generation</li>
                <li className="flex items-center group-hover:text-white transition-colors"><CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" /> Instant sharing</li>
              </ul>
            </div>

            <div className="group bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm p-10 rounded-3xl text-center shadow-2xl hover:shadow-green-500/25 transition-all duration-500 border border-white/20 hover:border-green-400/50 cursor-pointer transform hover:-translate-y-6 hover:scale-105">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl w-fit mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Employers</h3>
              <p className="text-gray-300 mb-8 text-lg">Verify candidate credentials instantly with complete trust and transparency.</p>
              <ul className="text-left space-y-4 text-gray-300">
                <li className="flex items-center group-hover:text-white transition-colors"><CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" /> Instant verification</li>
                <li className="flex items-center group-hover:text-white transition-colors"><CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" /> Tamper-proof records</li>
                <li className="flex items-center group-hover:text-white transition-colors"><CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" /> No fake certificates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-slate-900 to-black py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-8 cursor-pointer group">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl p-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white group-hover:text-purple-200 transition-colors">VeriDoc</h3>
            </div>
            <p className="text-gray-400 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
              Revolutionizing credential verification through blockchain technology.
              Secure, transparent, and instantly verifiable academic credentials.
            </p>

            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl p-6 inline-block border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
              <p className="text-sm text-gray-400 mb-2">Smart Contract Address:</p>
              <p className="font-mono text-cyan-400 text-lg">0x742d35Cc6664Bb8b62b8b5b8</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;