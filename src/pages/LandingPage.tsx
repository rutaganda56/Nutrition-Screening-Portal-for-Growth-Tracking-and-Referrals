import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

import clinicCare from '../assets/images/MUAC tape.jpeg';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Malnutrition Detection',
      description: 'Accurately classify nutritional status based on MUAC, weight-for-height, and clinical signs.'
    },
    {
      title: 'Growth Tracking',
      description: 'Visualize patient progress with longitudinal tracking of key health indicators.'
    },
    {
      title: 'Patient Records',
      description: 'Maintain comprehensive history including screenings, referrals, and guardian contacts.'
    },
    {
      title: 'Care Coordination',
      description: 'Seamlessly transition cases from community screening to clinical consultation.'
    },
    {
      title: 'Secure Access',
      description: 'Protected workspaces tailored for CHWs, Doctors, and Administrators.'
    },
    {
      title: 'Holistic Management',
      description: 'Track nutrition orders and follow-up schedules in one centralized system.'
    }
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-green-100">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Nutri Track</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-white bg-green-600">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white py-20 lg:py-32">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-6 inline-flex items-center rounded-full border border-green-100 bg-green-50 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-green-700">
                  Clinical Decision Support System
                </div>
                <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:leading-[1.1]">
                  Better nutrition care <br className="hidden md:block" />
                  <span className="text-green-600">starts with better data.</span>
                </h2>
                <p className="mb-10 max-w-xl mx-auto lg:mx-0 text-lg leading-relaxed text-gray-600">
                  A professional workflow system.Empowering 
                  clinical teams to screen, track, and coordinate 
                  malnutrition cases with precision and compassion.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                  <Button size="lg" onClick={() => navigate('login')} className="bg-green-600 hover:bg-green-700 h-12 px-8">
                     Access Dashboard
                  </Button>
                </div>
              </div>

              <div className="flex-1 w-full max-w-2xl">
                <div className="relative rounded-2xl border border-gray-100 bg-gray-50/50 p-6 shadow-2xl shadow-gray-200/50">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Service Request Queue</h4>
                      <p className="text-xs text-gray-500">Real-time clinical coordination</p>
                    </div>
                    <Badge className="bg-red-50 text-red-700 border-red-100 hover:bg-red-50 font-bold px-2 py-0">Urgent</Badge>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'CHW Screening', desc: 'Patient classified as SAM (High Priority)', status: 'Done' },
                      { label: 'Doctor Review', desc: 'Clinical assessment in progress', status: 'Active' },
                      { label: 'Nutrition Order', desc: 'Pending RUTF prescription', status: 'Pending' }
                    ].map((item, i) => (
                      <div key={i} className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${item.status === 'Active' ? 'bg-white border-green-200 shadow-sm ring-1 ring-green-50' : 'bg-gray-50/50 border-gray-100'}`}>
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${item.status === 'Done' ? 'bg-green-100 text-green-700' : item.status === 'Active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50/50 py-24">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <div className="mb-12">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Integrated Care Delivery</h3>
                  <p className="text-lg text-gray-600 max-w-lg">
                    A comprehensive toolkit designed for the unique needs of nutrition clinics, connecting communities with clinical excellence.
                  </p>
                </div>
                <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
                  {features.map((feature, index) => {
                    return (
                      <div key={index} className="group">
                        <div className="mb-3 h-1 w-12 bg-green-100 group-hover:bg-green-600 transition-colors" />
                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img src={clinicCare} alt="Healthcare worker checking toddler" className="w-full h-[600px] object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Process Section */}
        <section className="bg-green-700 py-20 text-white">
          <div className="container mx-auto px-6">
            <div className="grid gap-12 md:grid-cols-3">
              {[
                { title: 'Register', desc: 'Securely capture patient and guardian demographics.' },
                { title: 'Screen', desc: 'Validate growth measurements against global standards.' },
                { title: 'Consult', desc: 'Facilitate data-driven clinical decisions and orders.' }
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="mb-4 text-5xl font-black text-green-100/20">{i + 1}</div>
                  <h4 className="mb-3 text-xl font-bold tracking-tight ">{item.title}</h4>
                  <p className="text-green-50 text-lg leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 text-center">
          <div className="container mx-auto px-6">
            <h3 className="mb-6 text-3xl font-bold text-gray-900">
              Modernizing nutrition screening in Rwanda
            </h3>
            <p className="mb-10 mx-auto max-w-2xl text-lg text-gray-600">
              Join the clinical team at Polyclinique du Bon Berger and 
              help improve healthcare outcomes for our community.
            </p>
            <Button size="lg" onClick={() => navigate('/login')} className="bg-green-600 hover:bg-green-700 h-14 px-10 text-lg">
              Want to Navigate to your Account ?
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-gray-50/30">
        <div className="container mx-auto px-6 py-12">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <h4 className="mb-6 font-bold text-gray-900">Nutri Track</h4>
              <p className="max-w-xs text-gray-600 leading-relaxed">
                Dedicated to providing high quality, patient centered nutrition care 
                through innovative technology and clinical excellence.
              </p>
            </div>
            <div>
              <h4 className="mb-6 font-bold text-gray-900">Support</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li>Facility Administration</li>
                <li>IT Support Desk</li>
                <li>User Training Guide</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-6 font-bold text-gray-900">Security</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-100 pt-8 text-center text-sm text-gray-500">
            &copy; 2026 Nutri Track. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
