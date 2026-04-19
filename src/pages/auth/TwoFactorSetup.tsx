import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';
import { 
  Shield, 
  Smartphone, 
  Copy, 
  CheckCircle2, 
  AlertTriangle,
  KeyRound,
  Download,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

export const TwoFactorSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (step === 1) {
      generateTOTPSecret();
    }
  }, [step]);

  const generateTOTPSecret = async () => {
    // Generate a new TOTP secret
    const totp = new OTPAuth.TOTP({
      issuer: 'Nutrition Screening Portal',
      label: user?.email || 'User',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    const secretKey = totp.secret.base32;
    setSecret(secretKey);

    // Generate QR code
    const otpauthURL = totp.toString();
    const qrUrl = await QRCode.toDataURL(otpauthURL);
    setQrCodeUrl(qrUrl);

    // Generate backup codes
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
    setBackupCodes(codes);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success('Ikode yafashwe!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyCode = () => {
    setIsVerifying(true);

    // Simulate verification (in production, verify against server)
    setTimeout(() => {
      const totp = new OTPAuth.TOTP({
        issuer: 'Nutrition Screening Portal',
        label: user?.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });

      const isValid = totp.validate({ token: verificationCode, window: 1 }) !== null;

      if (isValid) {
        toast.success('2FA yashyizweho neza!');
        setStep(2);
      } else {
        toast.error('Ikode si yo. Ongera ugerageze.');
      }
      setIsVerifying(false);
    }, 1000);
  };

  const handleDownloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    toast.success('Amakode yashyizwe mu mukono!');
  };

  const handleComplete = () => {
    toast.success('2FA yashyizweho neza! Urasubiye ku kibanza cyawe.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => step === 1 ? navigate(-1) : setStep(1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Subira Inyuma
          </Button>
        </div>

        {step === 1 && (
          <Card className="border-2">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Shiraho Two-Factor Authentication</CardTitle>
              <CardDescription>
                Kongera umutekano kuri konti yawe ukoresheje telefoni yawe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step Indicator */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Badge variant="default" className="bg-blue-600">Intambwe 1: Shiraho</Badge>
                <div className="h-px w-8 bg-gray-300" />
                <Badge variant="outline">Intambwe 2: Emeza</Badge>
                <div className="h-px w-8 bg-gray-300" />
                <Badge variant="outline">Intambwe 3: Amakode</Badge>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  Koresha porogaramu nka Google Authenticator, Authy, cyangwa Microsoft Authenticator kugira ngo ushyireho 2FA.
                </AlertDescription>
              </Alert>

              {/* QR Code */}
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center space-y-4">
                  <p className="text-sm font-medium text-gray-700">
                    Koresha porogaramu yawe kugira ngo usikane QR code ikurikira:
                  </p>
                  {qrCodeUrl && (
                    <div className="flex justify-center">
                      <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-600 mb-2">
                      Cyangwa wandika ikode ikurikira mu buryo bwukuri:
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="bg-gray-100 px-4 py-2 rounded text-sm font-mono">
                        {secret}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopySecret}
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="verification-code">Injiza ikode yakozwe na porogaramu</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                </div>

                <Button
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 6 || isVerifying}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Byemeza...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Emeza & Komeza
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-2">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Bika Amakode Yawe y'Ifunguro</CardTitle>
              <CardDescription>
                Kanda amakode yakurikira ahantu h'umutekano. Uzayakoresha niba utabonetse telefoni yawe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step Indicator */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Intambwe 1
                </Badge>
                <div className="h-px w-8 bg-gray-300" />
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Intambwe 2
                </Badge>
                <div className="h-px w-8 bg-gray-300" />
                <Badge variant="default" className="bg-blue-600">Intambwe 3: Amakode</Badge>
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm">
                  <strong>Ngacyo:</strong> Bika aya makode ahantu h'umutekano. Uzayakoresha gusa rimwe gusa kandi ntuzongera kuyabona.
                </AlertDescription>
              </Alert>

              {/* Backup Codes */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div className="grid grid-cols-2 gap-3">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-white px-4 py-3 rounded border font-mono text-center text-sm"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadBackupCodes}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Shyira mu mukono
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Rangiza
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500">
                Aya makode azafasha mu gihe utabonetse telefoni yawe. Bika ahantu h'umutekano!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
