'use client';

import dynamic from 'next/dynamic';
import { loadingAnimation } from '@/lib/lottieAnimations';

const LottieAnimation = dynamic(() => import('@/components/LottieAnimation'), { ssr: false });

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <LottieAnimation
        animationData={loadingAnimation}
        className={sizeClasses[size]}
      />
      {message && (
        <p className="mt-4 text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
}
