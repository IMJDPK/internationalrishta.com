'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { emptyAnimation } from '@/lib/lottieAnimations';

const LottieAnimation = dynamic(() => import('@/components/LottieAnimation'), { ssr: false });

interface Bureau {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  referralCode: string;
  membersReferred: number;
  verified: boolean;
  rating: number;
}

// Mock data
const mockBureaus: Bureau[] = [
  {
    id: '1',
    name: 'Royal Marriage Bureau',
    city: 'Lahore',
    address: 'Model Town, Lahore',
    phone: '+92-300-1234567',
    email: 'royal@example.com',
    referralCode: 'ROYAL-LHE',
    membersReferred: 127,
    verified: true,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Elite Rishta Services',
    city: 'Karachi',
    address: 'Clifton Block 4, Karachi',
    phone: '+92-321-9876543',
    email: 'elite@example.com',
    referralCode: 'ELITE-KHI',
    membersReferred: 89,
    verified: true,
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Perfect Match Bureau',
    city: 'Islamabad',
    address: 'F-7 Markaz, Islamabad',
    phone: '+92-333-5551234',
    email: 'perfect@example.com',
    referralCode: 'PERFECT-ISB',
    membersReferred: 64,
    verified: true,
    rating: 4.9,
  },
];

export default function BureauDirectory() {
  const [searchCity, setSearchCity] = useState('');
  const [bureaus] = useState(mockBureaus);

  const filteredBureaus = bureaus.filter((bureau) =>
    bureau.city.toLowerCase().includes(searchCity.toLowerCase())
  );

  return (
    <section>
      <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Find a Marriage Bureau</h2>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by city..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent text-lg"
          />
          <svg
            className="absolute end-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Bureau Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBureaus.map((bureau, index) => (
          <motion.div
            key={bureau.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-card p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{bureau.name}</h3>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {bureau.city}
                </p>
              </div>
              {bureau.verified && (
                <div className="bg-gold-500 text-white px-3 py-1 rounded-pill text-xs font-bold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(bureau.rating) ? 'text-gold-500' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {bureau.rating} ({bureau.membersReferred} referrals)
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                {bureau.address}
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {bureau.phone}
              </p>
            </div>

            {/* Referral Code */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-600 mb-1">Referral Code:</p>
              <p className="font-mono font-bold text-gold-600 text-lg">{bureau.referralCode}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <a
                href={`tel:${bureau.phone}`}
                className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-semibold py-2 rounded-card transition-colors text-center text-sm"
              >
                Call Now
              </a>
              <a
                href={`mailto:${bureau.email}`}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-card transition-colors text-center text-sm"
              >
                Email
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredBureaus.length === 0 && (
        <div className="text-center py-12">
          <LottieAnimation
            animationData={emptyAnimation}
            className="w-32 h-32 mx-auto mb-4"
          />
          <p className="text-xl text-gray-600">No bureaus found in this city</p>
        </div>
      )}
    </section>
  );
}
