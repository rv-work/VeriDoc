"use client"

import React, { useState } from 'react';
import { Shield, Menu, X, Home, Users, University, Settings, LogOut, ChevronDown, User, Building2, Upload, FileText, Files, Sparkles, Award, LayoutDashboard } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Signup from './Signup';
import Login from './Login';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUploadDropdownOpen, setIsUploadDropdownOpen] = useState(false);
  const [openModal, setOpenModal] = useState("");

  const { address, connectWallet } = useWeb3();
  const { userRole, isLoggedIn } = useAuth();

  const getNavLinks = () => {
    const commonLinks = [
      { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
      { name: 'Premium', href: '/premium', icon: <Sparkles className="w-4 h-4" /> }
    ];

    switch (userRole) {
      case 'admin':
        return [
          ...commonLinks,
          { name: 'University Requests', href: '/admin/requests', icon: <Building2 className="w-4 h-4" /> },
          { name: 'Manage Universities', href: '/admin/universities', icon: <University className="w-4 h-4" /> },
        ];

      case 'institute':
        return [
          ...commonLinks,
          { name: 'Request', href: '/university/request', icon: <Users className="w-4 h-4" /> },
          { name: 'Dashboard', href: '/university/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        ];

      case 'student':
        return [
          ...commonLinks,
          { name: 'My Certificates', href: '/student/certificates', icon: <Award className="w-4 h-4" /> },
        ];

      case 'other':
        return [...commonLinks];

      default:
        return [
          { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
          { name: 'Premium', href: '/premium', icon: <Sparkles className="w-4 h-4" /> }
        ];
    }
  };

  const navLinks = getNavLinks();

  const closeModal = () => {
    setOpenModal("");
  };

  const handleLogout = async () => {
    console.log("inside handleLogout")
    try {
      const response = await fetch('https://veridoc.onrender.com/api/auth/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (response.ok) {
        toast.success("LoggedOut Successfully")
        window.location.href = "/";
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const UploadDropdown = ({ isMobile = false }) => (
    <div className="relative">
      <button
        onClick={() => setIsUploadDropdownOpen(!isUploadDropdownOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium cursor-pointer transition-all duration-300 ${isMobile
          ? 'text-white hover:text-purple-200 hover:bg-white/10 w-full'
          : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}
      >
        <Upload className="w-4 h-4" />
        <span>Issue Certificate</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUploadDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isUploadDropdownOpen && (
        <div className={`${isMobile ? 'relative mt-2 ml-4' : 'absolute top-full left-0 mt-1'} bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 py-2 z-50 min-w-[200px]`}>
          <Link
            href="/university/upload"
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 cursor-pointer"
            onClick={() => {
              setIsUploadDropdownOpen(false);
              if (isMobile) setIsMenuOpen(false);
            }}
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Single Certificate</span>
          </Link>
          <Link
            href="/university/upload-bulk"
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 cursor-pointer"
            onClick={() => {
              setIsUploadDropdownOpen(false);
              if (isMobile) setIsMenuOpen(false);
            }}
          >
            <Files className="w-4 h-4" />
            <span className="text-sm font-medium">Bulk Upload</span>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 backdrop-blur-md shadow-2xl border-b border-white/10 sticky top-0 z-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">

            {/* Logo Section */}
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl p-2.5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  VeriDoc
                </h1>
                <p className="text-xs text-gray-300 -mt-1">
                  {userRole === 'admin' && '🔑 Admin Panel'}
                  {userRole === 'institute' && '🏛️ University Portal'}
                  {userRole === 'student' && '🎓 Student Dashboard'}
                  {userRole === 'other' && '🌐 Verification Portal'}
                  {!userRole && '✨ Secure Verification'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks?.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium cursor-pointer group"
                >
                  <span className="group-hover:scale-110 transition-transform duration-200">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              ))}

              {/* Upload Dropdown for Institute Users */}
              {userRole === 'institute' && <UploadDropdown />}

              {!isLoggedIn ? (
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setOpenModal("signup")}
                    className="flex items-center cursor-pointer space-x-2 px-4 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium border border-white/20 hover:border-white/40"
                  >
                    <User className="w-4 h-4" />
                    <span>Signup</span>
                  </button>

                  <button
                    onClick={() => setOpenModal("login")}
                    className="flex items-center space-x-2 cursor-pointer px-6 py-2 rounded-xl text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5"
                  >
                    <span>Login</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center cursor-pointer space-x-2 px-6 py-2 rounded-xl text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 transition-all duration-300 font-medium shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-0.5 ml-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">

              {address ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 hover:from-green-500/30 hover:to-blue-500/30 px-4 py-2 rounded-xl border border-green-400/30 hover:border-blue-400/50 transition-all duration-300 shadow-lg hover:shadow-green-500/20 backdrop-blur-sm cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      <span className="text-sm font-semibold text-white">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 mb-1">
                          {userRole === 'admin' && '🔑 Admin Panel'}
                          {userRole === 'institute' && '🏛️ University Dashboard'}
                          {userRole === 'student' && '🎓 Student Portal'}
                          {userRole === 'other' && '🌐 Verification Portal'}
                          {!userRole && 'Connected Wallet'}
                        </p>
                        <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{address}</p>
                      </div>

                      <a href="/profile" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 cursor-pointer">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Profile</span>
                      </a>

                      <a href="/settings" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Settings</span>
                      </a>

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 w-full text-left cursor-pointer">
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Disconnect</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-gradient-to-r cursor-pointer from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-purple-500/25 transform hover:-translate-y-1 hover:scale-105 border border-white/20"
                >
                  Connect Wallet
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden border-t border-white/10 bg-gradient-to-br from-slate-800/95 to-purple-800/95 backdrop-blur-md rounded-b-2xl mt-2 shadow-2xl">
              <div className="py-4 space-y-1">
                {navLinks?.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center space-x-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl mx-2 cursor-pointer font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-purple-300">{link.icon}</span>
                    <span>{link.name}</span>
                  </Link>
                ))}

                {/* Mobile Upload Dropdown for Institute Users */}
                {userRole === 'institute' && (
                  <div className="mx-2">
                    <UploadDropdown isMobile={true} />
                  </div>
                )}

                {/* Mobile Auth Buttons and Wallet Connect */}
                <div className="px-2 pt-4 border-t border-white/10 mt-4 space-y-3">
                  {!isLoggedIn ? (
                    <>
                      <button
                        onClick={() => {
                          setOpenModal("signup");
                          setIsMenuOpen(false);
                        }}
                        className="w-full cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 border border-white/20 hover:border-white/40"
                      >
                        Signup
                      </button>
                      <button
                        onClick={() => {
                          setOpenModal("login");
                          setIsMenuOpen(false);
                        }}
                        className="w-full cursor-pointer bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg"
                      >
                        Login
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full cursor-pointer bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  )}

                  {!address && (
                    <button
                      onClick={() => {
                        connectWallet();
                        setIsMenuOpen(false);
                      }}
                      className="w-full cursor-pointer bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg"
                    >
                      Connect Wallet
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>


      </nav>

      {/* Signup Modal */}
      {openModal === "signup" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="relative w-full max-w-md mx-auto">
            <Signup onClose={closeModal} />
          </div>
        </div>
      )}

      {/* Login Modal */}
      {openModal === "login" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="relative w-full max-w-md mx-auto">
            <Login onClose={closeModal} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;