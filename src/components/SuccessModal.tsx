'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { successAnimation, celebrationAnimation } from '@/lib/lottieAnimations';

const LottieAnimation = dynamic(() => import('@/components/LottieAnimation'), { ssr: false });

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  celebrate?: boolean;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  celebrate = false,
}: SuccessModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen && !show) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative bg-white rounded-card shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 ${
          show ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <LottieAnimation
            animationData={celebrate ? celebrationAnimation : successAnimation}
            loop={false}
            className="w-24 h-24 mx-auto mb-4"
          />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
}
