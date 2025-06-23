"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  XCircle,
  ArrowLeft,
  CreditCard,
  HelpCircle,
  Home,
  RefreshCw,
  Shield,
  Clock,
  AlertTriangle
} from 'lucide-react';

const CancelPage = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleTryAgain = () => {
    router.push('/premium');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleContactSupport = () => {
    // You can replace this with your actual support contact method
    window.open('mailto:support@veridoc.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 text-red-400 opacity-40 animate-bounce">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="absolute top-32 right-32 text-orange-400 opacity-40 animate-bounce delay-300">
          <Clock className="w-8 h-8" />
        </div>
        <div className="absolute bottom-32 left-32 text-pink-400 opacity-40 animate-bounce delay-700">
          <XCircle className="w-7 h-7" />
        </div>
        <div className="absolute bottom-20 right-20 text-yellow-400 opacity-40 animate-bounce delay-1000">
          <HelpCircle className="w-6 h-6" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 text-center max-w-2xl w-full">

          {/* Cancel Icon with Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
                <XCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-full animate-ping opacity-20"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Cancel Message */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Payment Cancelled
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              No worries! Your payment has been cancelled.
            </p>
            <p className="text-gray-400">
              If this was a mistake, you can easily try again or contact our support team.
            </p>
          </div>

          {/* Reassurance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-red-400/30 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">Secure Process</h3>
              <p className="text-gray-400 text-xs">No charges were made</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-orange-400/30 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">Easy Retry</h3>
              <p className="text-gray-400 text-xs">Try again anytime</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-pink-400/30 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">Need Help?</h3>
              <p className="text-gray-400 text-xs">Support is here for you</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={handleTryAgain}
              className="flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-purple-500/25 transform hover:-translate-y-1 hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </button>

            <button
              onClick={handleGoBack}
              className="flex items-center justify-center space-x-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all duration-300 border border-white/20 hover:border-white/40 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center space-x-2 px-6 py-2 text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/5 rounded-lg"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">Return to Home</span>
            </button>

            <button
              onClick={handleContactSupport}
              className="flex items-center justify-center space-x-2 px-6 py-2 text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/5 rounded-lg"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm">Contact Support</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              💡 <span className="text-cyan-400">VeriDoc Premium</span> will still be here when you&apos;re ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;