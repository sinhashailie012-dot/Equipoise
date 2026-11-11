import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Scale, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-12 h-12 rounded-full bg-[#EAE4D8] flex items-center justify-center mb-6 text-[#234236]">
        <Scale className="w-6 h-6 stroke-[1.8]" />
      </div>

      <div className="text-xs uppercase tracking-widest font-semibold text-[#6B6A60] mb-2">
        404 ERROR
      </div>

      <h1 className="text-4xl sm:text-5xl font-heading text-[#1E2A26] font-normal tracking-tight mb-3">
        Page not found.
      </h1>

      <p className="text-sm text-[#6B6A60] max-w-md mb-8 leading-relaxed">
        The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>

      <Button
        variant="primary"
        onClick={() => navigate('/overview')}
        className="gap-2 text-sm"
        icon={ArrowLeft}
        iconPosition="left"
      >
        Return to overview
      </Button>
    </div>
  );
}

export default NotFoundPage;

