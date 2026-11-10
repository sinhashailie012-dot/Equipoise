import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Building2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('emma.chen@forma.studio');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between p-6 sm:p-10 select-none">
      <div className="w-full max-w-lg mx-auto my-auto pt-8">
        {/* Top badge */}
        <div className="flex items-center gap-2 text-xs text-ink-secondary mb-10">
          <Shield className="w-4 h-4 text-brand-700 stroke-[1.8]" />
          <span>A private space for your team's wellbeing</span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-serif font-normal text-ink-primary leading-tight">
            A little perspective.<br />
            A better day.
          </h1>
          <p className="text-sm text-ink-secondary mt-3">
            Welcome back. Sign in to Forma Studio.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1.5">
              Work email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="py-2.5 bg-[#FBF8F2]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1.5">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-2.5 pr-10 bg-[#FBF8F2]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary focus-visible:focus-ochre"
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
            <a href="#forgot" className="text-xs text-ink-primary font-medium hover:underline">
              Forgot password?
            </a>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full py-2.5 gap-2 text-sm">
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle" />
          </div>
          <div className="relative flex justify-center text-xs text-ink-muted">
            <span className="bg-canvas px-3">or</span>
          </div>
        </div>

        {/* SSO Button */}
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/')}
          className="w-full py-2.5 gap-2.5 text-sm bg-card hover:bg-card-hover"
        >
          <Building2 className="w-4 h-4 text-ink-secondary" />
          <span>Continue with single sign-on</span>
        </Button>

        {/* Helper Note */}
        <p className="text-xs text-ink-muted mt-6 text-left">
          Need access? Ask your workspace administrator.
        </p>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-lg mx-auto pt-12 flex items-center justify-between text-xs text-ink-muted">
        <div>© 2026 Equipoise</div>
        <div className="flex items-center gap-2">
          <a href="#privacy" className="hover:underline">Privacy</a>
          <span>·</span>
          <a href="#terms" className="hover:underline">Terms</a>
          <span>·</span>
          <a href="#support" className="hover:underline">Support</a>
        </div>
      </footer>
    </div>
  );
}

