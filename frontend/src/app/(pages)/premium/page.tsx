"use client"

import React, { useState } from 'react';
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
  Headphones,
  ArrowRight,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

// TypeScript interfaces
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

const handleStripePayment = async (planName: string, amount: number): Promise<void> => {
  const stripe = await loadStripe("pk_test_51QEn8vD5MY0XuWE68E1BY1X1EiSaEAVROhJF5OoIbDV9f8S4b9NJ9RJMVXC2W0dYnu598qpKIq7H4ustwfls8zdc003AEUjMiJ")

  const response = await fetch('https://veridoc.onrender.com/api/payment/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      planName,
      amount,
      successUrl: "http://localhost:3000/payment/success",
      cancelUrl: "http://localhost:3000/payment/cancel",
    }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const session = await response.json();

  console.log("session ", session)

  const result = await stripe?.redirectToCheckout({
    sessionId: session.id,
  });

  if (result?.error) {
    console.error(result.error.message);
  }
}

const Premium: React.FC = () => {
  // Updated loading state to track individual buttons
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const payPerUseOptions: PayPerUseOption[] = [
    {
      title: "Pay Per Upload",
      description: "Perfect for universities with occasional certificate uploads",
      price: "₹250",
      priceNumber: 250,
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
      price: "₹250",
      priceNumber: 250,
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
      price: "₹14,999",
      priceNumber: 14999,
      billingCycle: "/6 months",
      icon: <Shield className="w-8 h-8" />,
      features: [
        "Up to 100 certificate uploads/month",
        "50 free verifications/month",
        "Basic QR code generation",
        "Standard support",
        "Basic analytics dashboard",
        "Mobile-friendly interface",
        "6 months validity"
      ],
      buttonText: "Start Basic Plan",
      buttonStyle: "border-2 cursor-pointer border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
    },
    {
      name: "Premium",
      description: "Most popular choice for growing universities",
      price: "₹79,999",
      priceNumber: 79999,
      billingCycle: "/year",
      icon: <Star className="w-8 h-8" />,
      features: [
        "Up to 500 certificate uploads/month",
        "200 free verifications/month",
        "Advanced QR code customization",
        "Priority support",
        "Advanced analytics & insights",
        "Custom branding options",
        "API access",
        "Bulk upload capabilities",
        "1 year validity"
      ],
      popular: true,
      buttonText: "Choose Premium Plan",
      buttonStyle: "bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer text-white hover:from-blue-700 hover:to-purple-700"
    },
    {
      name: "Enterprise",
      description: "Comprehensive solution for large institutions",
      price: "₹15,99,999",
      priceNumber: 1599999,
      billingCycle: "/10 years",
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
        "Custom training sessions",
        "10 years validity"
      ],
      buttonText: "Contact Sales",
      buttonStyle: "bg-gradient-to-r from-purple-600 to-pink-600 cursor-pointer text-white hover:from-purple-700 hover:to-pink-700"
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
      icon: <Headphones className="w-6 h-6 text-indigo-500" />
    }
  ];

  // Updated function to handle individual loading states
  const handlePlanSelection = async (planName: string, amount: number): Promise<void> => {
    const planKey = `${planName}_${amount}`;

    setLoadingStates(prev => ({ ...prev, [planKey]: true }));
    try {
      await handleStripePayment(planName.toLowerCase(), amount);
    } catch (error) {
      console.error('Plan selection error:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [planKey]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
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
              Pay only for what you use or choose a long-term plan that grows with you.
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

      {/* Pay Per Use Section - Static Display Only */}
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
                className="relative bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8 opacity-75"
              >
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

                <div className="relative">
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white py-4 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <span>Coming Soon</span>
                  </button>
                </div>
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
              Long-Term Plans
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose a plan that scales with your institution. Get better value with longer commitments.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-3xl shadow-xl border-2 p-8 transition-all duration-300 hover:scale-105 ${plan.popular
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

                  {plan.name === 'Basic' && (
                    <p className="text-sm text-green-600 font-semibold">
                      Best value for 6 months
                    </p>
                  )}
                  {plan.name === 'Premium' && (
                    <p className="text-sm text-green-600 font-semibold">
                      Save 30% compared to monthly
                    </p>
                  )}
                  {plan.name === 'Enterprise' && (
                    <p className="text-sm text-purple-600 font-semibold">
                      Ultimate long-term value
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

                {/* Updated button with individual loading state */}
                <button
                  onClick={() => handlePlanSelection(plan.name, plan.priceNumber)}
                  disabled={loadingStates[`${plan.name}_${plan.priceNumber}`]}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${plan.buttonStyle}`}
                >
                  <span>
                    {loadingStates[`${plan.name}_${plan.priceNumber}`] ? 'Processing...' : plan.buttonText}
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
            {/* Updated CTA button with individual loading state */}
            <button
              onClick={() => handlePlanSelection('Basic', 14999)}
              disabled={loadingStates['Basic_14999']}
              className="bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {loadingStates['Basic_14999'] ? 'Processing...' : 'Start with Basic'}
              </span>
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
            No credit card required • Setup in minutes • Long-term plans available
          </p>
        </div>
      </div>
    </div>
  );
};

export default Premium;
