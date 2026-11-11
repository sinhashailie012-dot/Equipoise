import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Building2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { useToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { authService } from '../services/authService';

export function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('emma.chen@forma.studio');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'forgot' | 'privacy' | 'terms' | 'support'

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await authService.login(email, password);
      toast.success('Welcome back to Forma Studio.');
      navigate('/overview');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials.');
      toast.error(err.message || 'Sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSsoSignIn = async () => {
    setIsLoading(true);
    try {
      await authService.login('emma.chen@forma.studio', 'Password@123');
      toast.success('Signed in via Forma Studio SSO.');
      navigate('/overview');
    } catch (err) {
      toast.error('SSO authentication unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex flex-col justify-between p-6 sm:p-10 select-none">
      <div className="w-full max-w-lg mx-auto my-auto pt-4 md:pt-8">
        {/* Top badge */}
        <div className="flex items-center gap-2 text-xs text-[#6B6A60] mb-8 sm:mb-10">
          <Shield className="w-4 h-4 text-[#234236] stroke-[1.8]" />
          <span>A private space for your team's wellbeing</span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-heading font-normal text-[#1E2A26] leading-tight">
            A little perspective.<br />
            A better day.
          </h1>
          <p className="text-sm text-[#6B6A60] mt-3">
            Welcome back. Sign in to Forma Studio.
          </p>
        </div>

        {/* Inline Error if present */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-[#F5EAEB] border border-[#E7C6C9] rounded-[4px] text-xs text-[#611C28]">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1E2A26] mb-1.5">
              Work email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="py-2.5 bg-[#FBF8F2]"
              placeholder="emma.chen@forma.studio"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1E2A26] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-2.5 pr-10 bg-[#FBF8F2]"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6A60] hover:text-[#1E2A26] focus:outline-none focus:ring-2 focus:ring-[#B8862F] rounded-[2px]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Checkbox
              checked={keepSignedIn}
              onChange={setKeepSignedIn}
              label="Keep me signed in"
            />
            <button
              type="button"
              onClick={() => setActiveModal('forgot')}
              className="text-xs text-[#1E2A26] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#B8862F] rounded-[2px]"
            >
              Forgot password?
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-2.5 gap-2 text-sm"
              icon={ArrowRight}
              iconPosition="right"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#DDD4C4]" />
          </div>
          <div className="relative flex justify-center text-xs text-[#6B6A60]">
            <span className="bg-[#F4EFE6] px-3">or</span>
          </div>
        </div>

        {/* SSO Button */}
        <Button
          type="button"
          variant="secondary"
          onClick={handleSsoSignIn}
          disabled={isLoading}
          className="w-full py-2.5 gap-2.5 text-sm bg-[#FBF8F2] hover:bg-[#F2ECE0]"
          icon={Building2}
        >
          Continue with single sign-on
        </Button>

        {/* Helper Note */}
        <p className="text-xs text-[#6B6A60] mt-6 text-left">
          Need access? Ask your workspace administrator.
        </p>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-lg mx-auto pt-10 flex items-center justify-between text-xs text-[#6B6A60]">
        <div>© 2026 Equipoise</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveModal('privacy')}
            className="hover:underline hover:text-[#1E2A26]"
          >
            Privacy
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => setActiveModal('terms')}
            className="hover:underline hover:text-[#1E2A26]"
          >
            Terms
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => setActiveModal('support')}
            className="hover:underline hover:text-[#1E2A26]"
          >
            Support
          </button>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={activeModal === 'forgot'}
        onClose={() => setActiveModal(null)}
        title="Reset your password"
        subtitle="Enter your work email address to receive password recovery instructions."
        footer={
          <Button
            variant="primary"
            onClick={() => {
              toast.info(`Recovery link sent to ${email}`);
              setActiveModal(null);
            }}
          >
            Send recovery link
          </Button>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-medium text-[#6B6A60]">Work email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          <p className="text-xs text-[#6B6A60]">
            Demo credentials: <span className="font-semibold text-[#1E2A26]">manager@equipoise.com / Password@123</span>
          </p>
        </div>
      </Modal>

      {/* Privacy / Terms / Support Modals */}
      <Modal
        isOpen={activeModal === 'privacy' || activeModal === 'terms' || activeModal === 'support'}
        onClose={() => setActiveModal(null)}
        title={
          activeModal === 'privacy'
            ? 'Privacy & Data Protection'
            : activeModal === 'terms'
            ? 'Terms of Service'
            : 'Manager Support'
        }
        subtitle="Forma Studio Team Management Environment"
        footer={<Button variant="secondary" onClick={() => setActiveModal(null)}>Close</Button>}
      >
        <div className="text-xs md:text-sm text-[#6B6A60] leading-relaxed space-y-3">
          <p>
            Equipoise is engineered specifically to prevent workplace burnout while maintaining private, ethical manager oversight. Individual workload risk indicators are private to managers and are never used as performance metrics.
          </p>
          <p>
            For support or questions regarding your organization's subscription, contact support@equipoise.com.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default LoginPage;
