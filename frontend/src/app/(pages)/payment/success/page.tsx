"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import {
  CheckCircle,
  Sparkles,
  Crown,
  Star,
  ArrowRight,
  Gift,
  Zap,
  Shield,
  Home
} from 'lucide-react';

const SuccessClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const planName = searchParams.get('planName');

  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setIsPremium } = useAuth();

  useEffect(() => {
    const notifyBackend = async () => {
      if (!sessionId) {
        setError('Invalid session. Please try again.');
        setIsProcessing(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/payment/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId, planName, purpose: "subscription" }),
          credentials: 'include',
        });

        const data = await res.json();

        if (data.success) {
          setPaymentConfirmed(true);
          setIsPremium(true);
        } else {
          setError(data.error || 'Payment confirmation failed');
        }
      } catch (err) {
        setError('Network error. Please contact support.');
        console.error('Payment confirmation error:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    notifyBackend();
  }, [sessionId, planName, setIsPremium]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleExplorePremium = () => {
    router.push('/premium');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-200 text-center max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center animate-spin">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your subscription...</p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
        <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-red-200 text-center max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleGoHome}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-0.5"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (paymentConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-500"></div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-20 text-cyan-500 opacity-40 animate-bounce">
            <Star className="w-6 h-6" />
          </div>
          <div className="absolute top-32 right-32 text-purple-500 opacity-40 animate-bounce delay-300">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="absolute bottom-32 left-32 text-pink-500 opacity-40 animate-bounce delay-700">
            <Crown className="w-7 h-7" />
          </div>
          <div className="absolute bottom-20 right-20 text-yellow-500 opacity-40 animate-bounce delay-1000">
            <Gift className="w-6 h-6" />
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200 text-center max-w-2xl w-full">

            {/* Success Icon with Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-ping opacity-20"></div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center animate-spin">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                🎉 Payment Successful!
              </h1>
              <p className="text-xl text-gray-700 mb-2">
                Welcome to <span className="text-cyan-600 font-semibold">VeriDoc Premium</span>!
              </p>
              <p className="text-gray-600">
                Your <span className="text-purple-600 font-medium">{planName || 'Premium'}</span> subscription is now active
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-cyan-300 transition-all duration-300 hover:shadow-md">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-gray-900 font-semibold text-sm mb-1">Enhanced Security</h3>
                <p className="text-gray-600 text-xs">Advanced verification features</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-purple-300 transition-all duration-300 hover:shadow-md">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-gray-900 font-semibold text-sm mb-1">Priority Support</h3>
                <p className="text-gray-600 text-xs">24/7 premium assistance</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-pink-300 transition-all duration-300 hover:shadow-md">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-gray-900 font-semibold text-sm mb-1">Exclusive Features</h3>
                <p className="text-gray-600 text-xs">Access to premium tools</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleExplorePremium}
                className="flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-purple-500/25 transform hover:-translate-y-1 hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                <span>Explore Premium</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleGoHome}
                className="flex items-center justify-center space-x-2 px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-all duration-300 border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg"
              >
                <Home className="w-5 h-5" />
                <span>Go to Dashboard</span>
              </button>
            </div>

            {/* Footer Message */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                🔒 Your subscription details have been sent to your email
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-gray-800 text-xl">Loading payment details...</div>
      </div>
    }>
      <SuccessClient />
    </Suspense>
  );
}
