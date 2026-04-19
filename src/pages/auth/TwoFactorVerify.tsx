import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { 
  Shield, 
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/app/components/ui/input-otp';

export const TwoFactorVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Get user info from login page
  const email = location.state?.email || '';
  const password = location.state?.password || '';

  useEffect(() => {
    // Redirect if no email/password provided
    if (!email || !password) {
      navigate('/login');
    }
  }, [email, password, navigate]);

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast.error('Injiza ikode nziza y\'imibare 6');
      return;
    }

    setIsVerifying(true);

    // Simulate 2FA verification
    setTimeout(() => {
      // In production, verify against server
      const isValid = code === '123456'; // Mock validation

      if (isValid) {
        toast.success('Ikode yemewe! Urakirwa...');
        // Complete login
        login(email, password);
        navigate('/dashboard');
      } else {
        setAttempts(prev => prev + 1);
        toast.error('Ikode si yo. Ongera ugerageze.');
        setCode('');
        
        if (attempts >= 2) {
          toast.error('Wagerageje inshuro nyinshi. Subira inyuma ukongera kwinjira.');
          setTimeout(() => navigate('/login'), 2000);
        }
      }
      setIsVerifying(false);
    }, 1000);
  };

  const handleVerifyBackupCode = async () => {
    if (backupCode.length < 6) {
      toast.error('Injiza ikode nziza');
      return;
    }

    setIsVerifying(true);

    // Simulate backup code verification
    setTimeout(() => {
      const isValid = backupCode.toUpperCase().length === 8; // Mock validation

      if (isValid) {
        toast.success('Ikode y\'ifunguro yemewe! Urakirwa...');
        login(email, password);
        navigate('/dashboard');
      } else {
        toast.error('Ikode y\'ifunguro si yo. Ongera ugerageze.');
        setBackupCode('');
      }
      setIsVerifying(false);
    }, 1000);
  };

  const handleResendCode = () => {
    toast.success('Ikode nshya yoherejwe kuri telefoni yawe');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Subira ku Kwinjira
          </Button>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Emeza Two-Factor Authentication</CardTitle>
            <CardDescription>
              {useBackupCode 
                ? 'Injiza ikode imwe y\'ifunguro'
                : 'Injiza ikode yakozwe na porogaramu yawe'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                Injira muri <strong>{email}</strong>
              </AlertDescription>
            </Alert>

            {!useBackupCode ? (
              <>
                {/* OTP Input */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={(value) => setCode(value)}
                      disabled={isVerifying}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="w-12 h-12 text-xl" />
                        <InputOTPSlot index={1} className="w-12 h-12 text-xl" />
                        <InputOTPSlot index={2} className="w-12 h-12 text-xl" />
                        <InputOTPSlot index={3} className="w-12 h-12 text-xl" />
                        <InputOTPSlot index={4} className="w-12 h-12 text-xl" />
                        <InputOTPSlot index={5} className="w-12 h-12 text-xl" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    onClick={handleVerifyCode}
                    disabled={code.length !== 6 || isVerifying}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    size="lg"
                  >
                    {isVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Byemeza...
                      </>
                    ) : (
                      'Emeza & Injira'
                    )}
                  </Button>
                </div>

                {/* Options */}
                <div className="space-y-3 pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={handleResendCode}
                    className="w-full text-sm"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Kohereza ikode nshya
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => setUseBackupCode(true)}
                    className="w-full text-sm"
                    size="sm"
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Koresha ikode y'ifunguro
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Backup Code Input */}
                <div className="space-y-4">
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm">
                      Injiza ikode imwe y'ifunguro ukoresha rimwe gusa
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Input
                      type="text"
                      placeholder="XXXXXXXX"
                      maxLength={8}
                      value={backupCode}
                      onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                      className="text-center text-xl tracking-widest font-mono"
                    />
                  </div>

                  <Button
                    onClick={handleVerifyBackupCode}
                    disabled={backupCode.length < 6 || isVerifying}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                    size="lg"
                  >
                    {isVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Byemeza...
                      </>
                    ) : (
                      'Emeza Ikode y\'Ifunguro'
                    )}
                  </Button>
                </div>

                {/* Back to regular code */}
                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setUseBackupCode(false);
                      setBackupCode('');
                    }}
                    className="w-full text-sm"
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Subira ku kode isanzwe
                  </Button>
                </div>
              </>
            )}

            {/* Warning for failed attempts */}
            {attempts > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Wagerageje {attempts} {attempts === 1 ? 'inshuro' : 'inshuro'}. 
                  {attempts >= 2 && ' Uzasubizwa ku rupapuro rwo kwinjira.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-6">
          Hari ibibazo? Vugana na muyobozi wa sisitemu yawe
        </p>
      </div>
    </div>
  );
};
