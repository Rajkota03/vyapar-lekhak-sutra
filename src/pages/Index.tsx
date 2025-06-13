
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { DulyLogo } from "@/components/ui/DulyLogo";
import { Check, Star, ArrowRight, FileText, Users, Shield, Zap, BarChart3, Clock } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [loading, user, navigate]);

  const features = [
    {
      icon: FileText,
      title: "Professional Invoices",
      description: "Create GST-compliant invoices with professional templates"
    },
    {
      icon: Users,
      title: "Client Management", 
      description: "Organize and track all your client information in one place"
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Get insights into your business performance and growth"
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Bank-level security with full GST compliance"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate invoices in seconds, not minutes"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Get help whenever you need it with our dedicated support"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "₹0",
      period: "Forever",
      description: "Perfect for freelancers and small businesses",
      features: [
        "Up to 5 invoices per month",
        "Basic templates",
        "Client management",
        "GST compliance",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "₹299",
      period: "per month",
      description: "Ideal for growing businesses",
      features: [
        "Unlimited invoices",
        "Premium templates",
        "Advanced analytics",
        "Custom branding",
        "Priority support",
        "Multi-user access"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "₹999",
      period: "per month",
      description: "For large teams and enterprises",
      features: [
        "Everything in Professional",
        "Advanced integrations",
        "Dedicated account manager",
        "Custom workflows",
        "API access",
        "White-label solution"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Freelance Designer",
      content: "Duly transformed how I handle invoicing. Now I spend more time on creative work and less on paperwork.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Small Business Owner",
      content: "The GST compliance features saved me hours of work. Highly recommend for Indian businesses.",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "Consultant",
      content: "Clean interface, powerful features. Everything I need for professional invoicing.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-slate-50 pt-20 pb-16 lg:pt-24 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <DulyLogo size={64} variant="stacked" />
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Modern Invoice Management for 
              <span className="text-blue-600"> Indian Businesses</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Create professional GST-compliant invoices in seconds. Manage clients, track payments, and grow your business with our intuitive platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg px-8 py-4 h-auto" onClick={() => navigate("/auth")}>
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto" onClick={() => navigate("/auth?tab=signin")}>
                Sign In
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>GST compliant</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything you need to manage invoices
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed specifically for Indian businesses and GST compliance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose the plan that works best for your business. Upgrade or downgrade at any time.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative p-8 rounded-2xl border-2 bg-white ${plan.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-slate-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-slate-600">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`} 
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => navigate("/auth")}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Loved by businesses across India
            </h2>
            <p className="text-xl text-slate-600">
              Join thousands of satisfied customers who trust Duly for their invoicing needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-slate-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="flex items-center justify-center space-x-8 text-slate-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">5,000+</div>
                <div className="text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">50,000+</div>
                <div className="text-sm">Invoices Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">99.9%</div>
                <div className="text-sm">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              See Duly in action
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Experience the clean, intuitive interface that makes invoice management a breeze
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 text-sm text-slate-600">Duly Dashboard</div>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <DulyLogo size={24} variant="wordmark" />
                  <div className="flex space-x-2">
                    <div className="w-20 h-6 bg-blue-100 rounded"></div>
                    <div className="w-16 h-6 bg-slate-100 rounded"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">₹45,000</div>
                    <div className="text-sm text-slate-600">This Month</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">23</div>
                    <div className="text-sm text-slate-600">Paid Invoices</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">5</div>
                    <div className="text-sm text-slate-600">Pending</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
                        <div>
                          <div className="font-medium text-slate-900">Invoice #{String(i).padStart(3, '0')}</div>
                          <div className="text-sm text-slate-500">Client Name</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-slate-900">₹{5000 * i}</div>
                        <div className="text-sm text-green-600">Paid</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to streamline your invoicing?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Indian businesses already using Duly to create professional invoices and manage their finances better.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto bg-white text-blue-600 hover:bg-slate-50" onClick={() => navigate("/auth")}>
              Start Your Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-white text-white hover:bg-white hover:text-blue-600" onClick={() => navigate("/auth?tab=signin")}>
              Sign In
            </Button>
          </div>
          
          <p className="text-blue-200 mt-6 text-sm">
            No credit card required • Cancel anytime • 24/7 support
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <DulyLogo size={32} variant="wordmark" className="mb-4 [&_text]:fill-white" />
              <p className="text-slate-400 mb-6 max-w-md">
                Modern invoice management platform designed specifically for Indian businesses. Create GST-compliant invoices in minutes.
              </p>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <DulyLogo size={16} variant="icon" />
                <span>Made in India for Indian Businesses</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GST Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 Duly. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-slate-400 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
