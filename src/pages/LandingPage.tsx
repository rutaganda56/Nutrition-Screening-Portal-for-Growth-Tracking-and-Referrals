import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Activity, Users, TrendingUp, FileText, Shield, Heart } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Activity,
      title: 'Malnutrition Detection',
      description: 'Early detection and classification of nutritional status based on WHO standards'
    },
    {
      icon: TrendingUp,
      title: 'Growth Tracking',
      description: 'Monitor weight, height, and development indicators over time'
    },
    {
      icon: Users,
      title: 'Patient Management',
      description: 'Centralized patient records and family linkage'
    },
    {
      icon: FileText,
      title: 'Smart Referrals',
      description: 'Streamlined referral workflow with priority-based routing'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'HIPAA-compliant data security with comprehensive audit trails'
    },
    {
      icon: Heart,
      title: 'Care Coordination',
      description: 'Personalized intervention planning and follow-up management'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-green-600" />
            <h1 className="text-xl font-bold text-gray-900">Nutrition Screening Portal</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/register')} className="bg-green-600 hover:bg-green-700">
              Register
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Early Detection of Malnutrition,
          <br />
          <span className="text-green-600">Growth Tracking, and Referrals</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          A comprehensive digital health information system for Polyclinique du Bon Berger
          supporting continuous growth monitoring, nutritional assessments, and timely healthcare referrals.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/register')} className="bg-green-600 hover:bg-green-700">
            Get Started
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Care Features</h3>
          <p className="text-lg text-gray-600">
            Everything you need for effective nutrition screening and patient care
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 hover:border-green-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-green-100">Patients Registered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-green-100">Screening Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-green-100">System Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Improve Community Health Outcomes?
        </h3>
        <p className="text-lg text-gray-600 mb-8">
          Join healthcare professionals using our platform for better patient care
        </p>
        <Button size="lg" onClick={() => navigate('/register')} className="bg-green-600 hover:bg-green-700">
          Create Your Account
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">About</h4>
              <p className="text-sm text-gray-600">
                Polyclinique du Bon Berger - Supporting community health through technology
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
              <p className="text-sm text-gray-600">
                Email: info@bonberger.org
                <br />
                Phone: +XXX XXX XXXX
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Privacy</h4>
              <p className="text-sm text-gray-600">
                HIPAA Compliant | Data Security | Privacy Policy
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            © 2026 Polyclinique du Bon Berger. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
