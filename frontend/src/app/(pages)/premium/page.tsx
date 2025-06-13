"use client"

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Star, 
  Check, 
  Upload, 
  Search, 
  Crown, 
  Zap, 
  Globe, 
  Lock, 
  Smartphone,
  BarChart3,
  HeadphonesIcon,
  ArrowRight,
  Sparkles,
  CheckCircle
} from 'lucide-react';

// TypeScript interfaces
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface OrderData {
  id: string;
  amount: number;
  currency: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

interface PayPerUseOption {
  title: string;
  description: string;
  price: string;
  priceNumber: number;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
}

interface PricingPlan {
  name: string;
  description: string;
  price: string;
  priceNumber: number;
  billingCycle: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonStyle: string;
}

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Razorpay payment handler
const handlePayment = async (planType: string, amount: number, planName: string): Promise<void> => {
  try {
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded');
    }

    // Step 1: Create order on backend
    const response = await fetch('http://localhost:5000/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, 
        currency: 'INR',
        planType: planType,
        planName: planName
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const orderData: OrderData = await response.json();

    const options: RazorpayOptions = {
      key: 'rzp_test_YOUR_KEY_ID', // Replace with your Razorpay Key ID
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'VeriDoc',
      description: `Payment for ${planName}`,
      image: '/logo.png', // Your logo URL
      order_id: orderData.id,
      handler: function (response: RazorpayResponse) {
        // Payment successful
        alert('Payment Successful!');
        console.log('Payment ID:', response.razorpay_payment_id);
        console.log('Order ID:', response.razorpay_order_id);
        console.log('Signature:', response.razorpay_signature);
        
        // Verify payment on backend
        verifyPayment(response);
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9999999999'
      },
      notes: {
        address: 'VeriDoc Corporate Office'
      },
      theme: {
        color: '#3B82F6'
      },
      modal: {
        ondismiss: function() {
          alert('Payment cancelled');
        }
      }
    };

    // Step 3: Open Razorpay checkout
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
  }
};

// Verify payment on backend
const verifyPayment = async (paymentData: RazorpayResponse): Promise<void> => {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const result = await response.json();
    if (result.success) {
      alert('Payment verified successfully!');
      // Redirect to dashboard or success page
      window.location.href = '/dashboard';
    } else {
      alert('Payment verification failed');
    }
  } catch (error) {
    console.error('Verification error:', error);
    alert('Payment verification failed. Please try again.');
  }
};

const Premium: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise<boolean>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay SDK');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  const payPerUseOptions: PayPerUseOption[] = [
    {
      title: "Pay Per Upload",
      description: "Perfect for universities with occasional certificate uploads",
      price: "₹50",
      priceNumber: 50,
      icon: <Upload className="w-6 h-6" />,
      features: [
        "Blockchain certificate upload",
        "QR code generation",
        "Permanent storage",
        "Basic analytics",
        "Standard verification"
      ]
    },
    {
      title: "Pay Per Verification",
      description: "Ideal for recruiters and companies verifying credentials",
      price: "₹25",
      priceNumber: 25,
      icon: <Search className="w-6 h-6" />,
      features: [
        "Instant verification",
        "Detailed certificate view",
        "Issuer authentication",
        "Verification history",
        "PDF report generation"
      ],
      popular: false
    }
  ];

  const pricingPlans: PricingPlan[] = [
    {
      name: "Basic",
      description: "Perfect for small institutions getting started",
      price: "₹2,999",
      priceNumber: 2999,
      billingCycle: "/month",
      icon: <Shield className="w-8 h-8" />,
      features: [
        "Up to 100 certificate uploads/month",
        "50 free verifications/month",
        "Basic QR code generation",
        "Standard support",
        "Basic analytics dashboard",
        "Mobile-friendly interface"
      ],
      buttonText: "Start Basic Plan",
      buttonStyle: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
    },
    {
      name: "Pro",
      description: "Most popular choice for growing universities",
      price: "₹7,999",
      priceNumber: 7999,
      billingCycle: "/month",
      icon: <Star className="w-8 h-8" />,
      features: [
        "Up to 500 certificate uploads/month",
        "200 free verifications/month",
        "Advanced QR code customization",
        "Priority support",
        "Advanced analytics & insights",
        "Custom branding options",
        "API access",
        "Bulk upload capabilities"
      ],
      popular: true,
      buttonText: "Choose Pro Plan",
      buttonStyle: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
    },
    {
      name: "Enterprise",
      description: "Comprehensive solution for large institutions",
      price: "₹19,999",
      priceNumber: 19999,
      billingCycle: "/month",
      icon: <Crown className="w-8 h-8" />,
      features: [
        "Unlimited certificate uploads",
        "Unlimited verifications",
        "White-label solution",
        "24/7 dedicated support",
        "Advanced analytics suite",
        "Custom integrations",
        "Multi-admin dashboard",
        "SLA guarantee",
        "Custom training sessions"
      ],
      buttonText: "Contact Sales",
      buttonStyle: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
    }
  ];

  const additionalFeatures: Feature[] = [
    {
      title: "Blockchain Security",
      description: "Tamper-proof certificates stored on secure blockchain network",
      icon: <Lock className="w-6 h-6 text-blue-500" />
    },
    {
      title: "Instant Verification",
      description: "Real-time verification in seconds, not days",
      icon: <Zap className="w-6 h-6 text-yellow-500" />
    },
    {
      title: "Global Access",
      description: "Access certificates from anywhere in the world",
      icon: <Globe className="w-6 h-6 text-green-500" />
    },
    {
      title: "Mobile Optimized",
      description: "Perfect experience on all devices and platforms",
      icon: <Smartphone className="w-6 h-6 text-purple-500" />
    },
    {
      title: "Advanced Analytics",
      description: "Detailed insights into verification patterns",
      icon: <BarChart3 className="w-6 h-6 text-red-500" />
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock technical support when you need it",
      icon: <HeadphonesIcon className="w-6 h-6 text-indigo-500" />
    }
  ];

  const handlePlanSelection = async (planType: string, amount: number, planName: string): Promise<void> => {
    if (!razorpayLoaded) {
      alert('Payment system is loading. Please try again in a moment.');
      return;
    }

    if (planName === 'Enterprise') {
      // For enterprise, redirect to contact page
      window.location.href = '/contact';
      return;
    }

    if (planName === 'Free Trial') {
      // Handle free trial signup
      window.location.href = '/signup?trial=true';
      return;
    }

    setLoading(true);
    try {
      await handlePayment(planType, amount, planName);
    } catch (error) {
      console.error('Plan selection error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 shadow-2xl">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                VeriDoc
              </span>
              {' '}Plan
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Secure, verify, and manage academic credentials with blockchain technology. 
              Pay only for what you use or choose a plan that grows with you.
            </p>
            
            <div className="flex justify-center items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Blockchain Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span>Instant Verification</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-purple-400" />
                <span>Global Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Per Use Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pay As You Go
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Perfect for occasional use. No commitments, just pay for what you need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {payPerUseOptions.map((option, index) => (
              <div 
                key={index}
                className={`relative bg-white rounded-3xl shadow-xl border-2 p-8 transition-all duration-300 hover:scale-105 ${
                  option.popular 
                    ? 'border-gradient-to-r from-blue-500 to-purple-500 ring-4 ring-blue-200' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {option.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 w-fit mx-auto mb-4">
                    <div className="text-blue-600">
                      {option.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">{option.price}</span>
                    <span className="text-gray-600 ml-2">per transaction</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handlePlanSelection('payperuse', option.priceNumber, option.title)}
                  disabled={loading || !razorpayLoaded}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {loading ? 'Processing...' : !razorpayLoaded ? 'Loading...' : 'Get Started'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Subscription Plans
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose a plan that scales with your institution. Save more with annual billing.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-white rounded-3xl shadow-xl border-2 p-8 transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-gradient-to-r from-blue-500 to-purple-500 ring-4 ring-blue-200 transform scale-105' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center space-x-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Most Popular</span>
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 w-fit mx-auto mb-4">
                    <div className="text-blue-600">
                      {plan.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.billingCycle}</span>
                  </div>
                  
                  {plan.name !== 'Enterprise' && (
                    <p className="text-sm text-green-600 font-semibold">
                      Save 20% with annual billing
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handlePlanSelection('subscription', plan.priceNumber, plan.name)}
                  disabled={loading || (!razorpayLoaded && plan.name !== 'Enterprise')}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${plan.buttonStyle}`}
                >
                  <span>
                    {loading ? 'Processing...' : 
                     (!razorpayLoaded && plan.name !== 'Enterprise') ? 'Loading...' : 
                     plan.buttonText}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose VeriDoc?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge technology to ensure security, reliability, and ease of use.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Credential Verification?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of institutions already using VeriDoc to secure and verify academic credentials.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handlePlanSelection('trial', 0, 'Free Trial')}
              className="bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => window.location.href = '/demo'}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-900 transition-all duration-200"
            >
              Schedule Demo
            </button>
          </div>
          
          <p className="text-gray-400 mt-6 text-sm">
            No credit card required • Setup in minutes • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

export default Premium;