"use client"

import React, { useState } from 'react';
import { Shield, Menu, X, Home, Users, University, Settings, LogOut, ChevronDown, User, UserCheck, Building2 } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Signup from './Signup';
import Login from './Login';
import toast from 'react-hot-toast';



const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openModal, setOpenModal] = useState(""); 

  const { address, connectWallet } = useWeb3();
  const { userRole , isLoggedIn } = useAuth(); 

  const getNavLinks = () => {


    const commonLinks = [
      { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
      { name: 'Premium', href: '/premium', icon: <Shield className="w-4 h-4" /> }
    ];

  
    switch (userRole) {
      case 'admin':
        return [
          ...commonLinks,
          { name: 'University Requests', href: '/admin/requests', icon: <Building2 className="w-4 h-4" /> },
          { name: 'Manage Universities', href: '/admin/universities', icon: <University className="w-4 h-4" /> },
          // { name: 'All Students', href: '/admin/students', icon: <Users className="w-4 h-4" /> },
        ];

      case 'institute':
        return [
          ...commonLinks,
          // { name: 'My Students', href: '/university/students/list', icon: <Users className="w-4 h-4" /> },
          { name: 'Request', href: '/university/request', icon: <Users className="w-4 h-4" /> },
          { name: 'Issue Certificate', href: '/university/upload', icon: <UserCheck className="w-4 h-4" /> },
          // { name: 'Issued Certificates', href: '/university/students/certificates', icon: <Shield className="w-4 h-4" /> },
        ];

      case 'student':
        return [
          ...commonLinks,
          { name: 'My Certificates', href: '/student/certificates', icon: <Shield className="w-4 h-4" /> },
        ];
      case 'other':
        return [
          ...commonLinks,
          
        ];

      default : 
        return [
           { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
          //  { name: 'Verify Certificate', href: '/verify', icon: <Shield className="w-4 h-4" /> }
        ]

    }
  };

  const navLinks = getNavLinks();

  // Function to close modal
  const closeModal = () => {
    setOpenModal("");
  };

  const handleLogout = async () => {

    console.log("inside handleLogout")
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
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

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-2 shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  VeriDoc
                </h1>
                <p className="text-xs text-gray-500 -mt-1">
                  {userRole === 'admin' && 'Admin Panel'}
                  {userRole === 'university' && 'University Portal'}
                  {userRole === 'student' && 'Student Dashboard'}
                  {!address && 'Secure Verification'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks?.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
              
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={() => setOpenModal("signup")}
                    className="flex items-center cursor-pointer space-x-2 px-4 py-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span>Signup</span>
                  </button>

                  <button
                    onClick={() => setOpenModal("login")}
                    className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                  >
                    <span>Login</span>
                  </button>
                </>
              ) : (
                 <button
                    onClick={handleLogout}
                    className="flex items-center cursor-pointer space-x-2 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                  >
                    <span>Logout</span>
                  </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              
              {address ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 px-4 py-2 rounded-xl border border-green-200 hover:border-blue-300 transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-gray-700">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {userRole === 'admin' && '🔑 Admin Panel'}
                          {userRole === 'university' && '🏛️ University Dashboard'}
                          {userRole === 'student' && '🎓 Student Portal'}
                          {!userRole && 'Connected Wallet'}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">{address}</p>
                      </div>
                      
                      <a href="/profile" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                        <User className="w-4 h-4" />
                        <span className="text-sm">Profile</span>
                      </a>
                      
                      <a href="/settings" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Settings</span>
                      </a>
                      
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-150 w-full text-left">
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Disconnect</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-gradient-to-r cursor-pointer from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Connect Wallet
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md">
              <div className="py-4 space-y-1">
                {navLinks?.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-xl mx-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.icon}
                    <span className="font-medium">{link.name}</span>
                  </a>
                ))}
                
                {/* Mobile Login/Signup and Wallet Connect */}
                {!address && (
                  <div className="px-2 pt-4 border-t border-gray-100 mt-4 space-y-2">
                    <button
                      onClick={() => {
                        setOpenModal("signup");
                        setIsMenuOpen(false);
                      }}
                      className="w-full cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-all duration-200"
                    >
                      Signup
                    </button>
                    <button
                      onClick={() => {
                        setOpenModal("login");
                        setIsMenuOpen(false);
                      }}
                      className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        connectWallet();
                        setIsMenuOpen(false);
                      }}
                      className="w-full cursor-pointer bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200"
                    >
                      Connect Wallet
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Backdrop for mobile menu and profile dropdown */}
        {(isMenuOpen || isProfileOpen) && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => {
              setIsMenuOpen(false);
              setIsProfileOpen(false);
            }}
          />
        )}
      </nav>

      { openModal === "signup" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="relative items-center w-1/2 ">
            <Signup onClose={closeModal} />
          </div>
        </div>
      )}

      { openModal === "login" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="relative items-center w-1/2 ">
            <Login onClose={closeModal} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;