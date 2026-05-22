import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { PasswordInput } from '@/app/components/ui/password-input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/app/components/ui/input-otp';
import { Heart, ArrowLeft, Mail, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'email' | 'otp' | 'reset' | 'success';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulate sending OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('OTP sent to your email');
      setStep('otp');
    }, 1500);
  };

  // Simulate verifying OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    // Simulate API call - In production, verify OTP with backend
    setTimeout(() => {
      setLoading(false);
      // Mock verification - accept any 6-digit code
      toast.success('OTP verified successfully');
      setStep('reset');
    }, 1500);
  };

  // Simulate resetting password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Password reset successfully');
      setStep('success');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1500);
  };

  // Resend OTP
  const handleResendOTP = () => {
    toast.success('New OTP sent to your email');
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-green-600" />
              <span className="text-xl font-semibold text-gray-900">Nutrition Screening Portal</span>
            </Link>
            <Link to="/login">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              {step === 'success' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : step === 'reset' ? (
                <Lock className="h-6 w-6 text-green-600" />
              ) : (
                <Mail className="h-6 w-6 text-green-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {step === 'email' && 'Reset Password'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'reset' && 'Create New Password'}
              {step === 'success' && 'Password Reset Successfully'}
            </CardTitle>
            <CardDescription>
              {step === 'email' && 'Enter your email address and we\'ll send you an OTP'}
              {step === 'otp' && `We've sent a 6-digit OTP to ${email}`}
              {step === 'reset' && 'Please enter your new password'}
              {step === 'success' && 'Your password has been reset successfully'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Step 1: Email Input */}
            {step === 'email' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-center block">Enter 6-Digit OTP</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm text-green-600 hover:text-green-700 underline"
                  >
                    Didn't receive the code? Resend OTP
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Reset Password */}
            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <PasswordInput
                    id="newPassword"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">Must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            {/* Step 4: Success Message */}
            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    Your password has been reset successfully. You will be redirected to the login page.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
