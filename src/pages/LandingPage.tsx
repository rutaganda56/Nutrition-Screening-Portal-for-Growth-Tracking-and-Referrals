import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Activity, Users, TrendingUp, FileText, Shield, Heart, ClipboardCheck } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Activity,
      title: 'Malnutrition Detection',
      description: 'Classify nutritional status from screening measurements and clinical review.'
    },
    {
      icon: TrendingUp,
      title: 'Growth Tracking',
      description: 'Monitor weight, height, MUAC, and patient progress over time.'
    },
    {
      icon: Users,
      title: 'Patient Management',
      description: 'Keep patient records, guardian details, and screening history organized.'
    },
    {
      icon: FileText,
      title: 'Service Requests',
      description: 'Route complex cases from community health workers to doctors.'
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Separate dashboards for administrators, doctors, and community health workers.'
    },
    {
      icon: Heart,
      title: 'Care Coordination',
      description: 'Support nutrition orders, referrals, follow-ups, and reporting workflows.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Nutri Track</h1>
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

      <section className="border-b bg-white">
        <div className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              <ClipboardCheck className="h-4 w-4" />
              Nutrition screening and referral coordination
            </div>
            <h2 className="max-w-4xl text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
              Nutri Track
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-gray-600">
              A clinical workflow system for Polyclinique du Bon Berger that helps teams register
              patients, record nutrition screenings, review urgent cases, and coordinate referrals.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate('/register')} className="bg-green-600 hover:bg-green-700">
                Create Account
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-slate-50 p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Clinical Review Queue</p>
                <p className="text-xs text-gray-500">Cases submitted by community health workers</p>
              </div>
              <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                Priority
              </span>
            </div>
            <div className="space-y-3">
              {['Screening submitted', 'Doctor assessment', 'Nutrition order or referral'].map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-md border bg-white p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-50 text-sm font-semibold text-green-700">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{step}</p>
                    <p className="text-xs text-gray-500">Tracked inside the patient record</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h3 className="mb-4 text-3xl font-bold text-gray-900">Core Care Workflows</h3>
          <p className="text-lg text-gray-600">
            Practical tools for screening, reviewing, and following up on nutrition cases.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border hover:border-green-200 transition-colors">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-green-50">
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

      <section className="bg-green-700 py-14 text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-2 text-lg font-semibold">Register</div>
              <div className="text-green-100">Capture patient and guardian details in one place.</div>
            </div>
            <div>
              <div className="mb-2 text-lg font-semibold">Screen</div>
              <div className="text-green-100">Record measurements and classify nutrition status.</div>
            </div>
            <div>
              <div className="mb-2 text-lg font-semibold">Review</div>
              <div className="text-green-100">Route complex cases to doctors for clinical decisions.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <h3 className="mb-4 text-3xl font-bold text-gray-900">
          Support faster nutrition care decisions
        </h3>
        <p className="mb-8 text-lg text-gray-600">
          Give each role a focused workspace for the work they do every day.
        </p>
        <Button size="lg" onClick={() => navigate('/register')} className="bg-green-600 hover:bg-green-700">
          Create Your Account
        </Button>
      </section>

      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h4 className="mb-4 font-semibold text-gray-900">About</h4>
              <p className="text-sm text-gray-600">
                Polyclinique du Bon Berger - Supporting community health through technology.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-gray-900">Contact</h4>
              <p className="text-sm text-gray-600">
                Email: info@bonberger.org
                <br />
                Contact the facility administration team for support.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-gray-900">Privacy</h4>
              <p className="text-sm text-gray-600">
                Role-based access | Data security | Privacy policy
              </p>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
            2026 Polyclinique du Bon Berger. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
