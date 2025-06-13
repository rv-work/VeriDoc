import React from 'react';
import { Shield, Mail, Phone, MapPin, Github, Twitter, Linkedin, ExternalLink, Heart, Code, Globe, Users, Award, CheckCircle } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Contact Support', href: '/support' },
    { name: 'FAQ', href: '/faq' }
  ];

  const features = [
    { name: 'University Registration', href: '/university/register' },
    { name: 'Student Portal', href: '/student' },
    { name: 'Certificate Verification', href: '/verify' },
    { name: 'QR Code Generator', href: '/qr' },
    { name: 'Admin Dashboard', href: '/admin' },
    { name: 'API Documentation', href: '/docs' }
  ];

  const stats = [
    { number: '50+', label: 'Universities', icon: <Award className="w-5 h-5" /> },
    { number: '10,000+', label: 'Students', icon: <Users className="w-5 h-5" /> },
    { number: '25,000+', label: 'Certificates', icon: <CheckCircle className="w-5 h-5" /> },
    { number: '99.9%', label: 'Uptime', icon: <Globe className="w-5 h-5" /> }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Stats Section */}
      <div className="relative border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trusted by Education Leaders Worldwide
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Join thousands of institutions and students using our secure blockchain verification platform
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group-hover:scale-105">
                  <div className="flex justify-center mb-3 text-blue-400 group-hover:text-purple-400 transition-colors duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3 shadow-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VeriDoc
                </h3>
                <p className="text-sm text-gray-400">Blockchain Verification</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Revolutionizing credential verification through secure blockchain technology. 
              Ensuring trust, transparency, and instant verification for academic achievements.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all duration-300 hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all duration-300 hover:scale-110">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all duration-300 hover:scale-110">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all duration-300 hover:scale-110">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">{link.name}</span>
                    <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Features */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-white">Platform</h4>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index}>
                  <a 
                    href={feature.href} 
                    className="text-gray-300 hover:text-purple-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">{feature.name}</span>
                    <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-white">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600/20 p-2 rounded-lg mt-1">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Email</p>
                  <a href="mailto:support@VeriDoc.com" className="text-white hover:text-blue-400 transition-colors duration-200">
                    support@VeriDoc.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-600/20 p-2 rounded-lg mt-1">
                  <Phone className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Phone</p>
                  <a href="tel:+911234567890" className="text-white hover:text-purple-400 transition-colors duration-200">
                    +91 12345 67890
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-600/20 p-2 rounded-lg mt-1">
                  <MapPin className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Address</p>
                  <p className="text-white">
                    New Delhi, India<br />
                    <span className="text-gray-400 text-sm">Available 24/7</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-white/10">
              <h5 className="font-semibold mb-2 text-white">Stay Updated</h5>
              <p className="text-gray-300 text-sm mb-3">Get the latest updates about new features</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-400"
                />
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-r-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-300">
              <span>© 2025 VeriDoc. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                <span>in India</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>Built on Blockchain</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Secure & Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;