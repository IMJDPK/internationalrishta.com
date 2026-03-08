"use client";

import SubscriptionPaywall from "@/components/SubscriptionPaywall";
import { useSubscription } from "@/hooks/useSubscription";
import { emptyAnimation } from "@/lib/lottieAnimations";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LottieAnimation = dynamic(() => import("@/components/LottieAnimation"), {
  ssr: false,
});

interface Profile {
  id: string;
  name: string;
  age: number;
  city: string;
  education: string;
  profession: string;
  height: string;
  sect: string;
  biradari: string;
  image: string;
  verified: boolean;
}

// Mock data - expanded for Tinder-style cards
const mockProfiles: Profile[] = [
  {
    id: "1",
    name: "Ayesha K.",
    age: 26,
    city: "Lahore",
    education: "Master in Business",
    profession: "Marketing Manager",
    height: "5'5\"",
    sect: "Sunni",
    biradari: "Rajput",
    image: "/assets/profile/Pasted imagegirls.png",
    verified: true,
  },
  {
    id: "2",
    name: "Ahmed R.",
    age: 29,
    city: "Karachi",
    education: "Bachelor in Engineering",
    profession: "Software Engineer",
    height: "5'10\"",
    sect: "Sunni",
    biradari: "Syed",
    image: "/assets/profile/man1.png",
    verified: true,
  },
  {
    id: "3",
    name: "Fatima S.",
    age: 24,
    city: "Islamabad",
    education: "Bachelor in Medicine",
    profession: "Doctor",
    height: "5'4\"",
    sect: "Sunni",
    biradari: "Awan",
    image: "/assets/profile/Pasted image (2)girls.png",
    verified: true,
  },
  {
    id: "4",
    name: "Hamza M.",
    age: 28,
    city: "Faisalabad",
    education: "MBA",
    profession: "Business Owner",
    height: "5'11\"",
    sect: "Sunni",
    biradari: "Jatt",
    image: "/assets/profile/men.png",
    verified: true,
  },
  {
    id: "5",
    name: "Zainab H.",
    age: 25,
    city: "Multan",
    education: "Bachelor in CS",
    profession: "UI/UX Designer",
    height: "5'3\"",
    sect: "Sunni",
    biradari: "Sheikh",
    image: "/assets/profile/Pasted image (3)girls.png",
    verified: true,
  },
  {
    id: "6",
    name: "Usman K.",
    age: 31,
    city: "Peshawar",
    education: "Master in Finance",
    profession: "Financial Analyst",
    height: "6'0\"",
    sect: "Sunni",
    biradari: "Pathan",
    image: "/assets/profile/men2.png",
    verified: true,
  },
];

interface ProfileCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
  style?: React.CSSProperties;
}

function ProfileCard({ profile, onSwipe, style }: ProfileCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate, opacity, ...style }}
      onDragEnd={handleDragEnd}
      className="absolute w-full cursor-grab active:cursor-grabbing"
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden select-none max-w-md mx-auto">
        {/* Profile Image */}
        <div className="relative h-[500px] bg-gradient-to-br from-gold-100 to-teal-100">
          <Image
            src={profile.image}
            alt={profile.name}
            fill
            className="object-cover pointer-events-none"
            draggable={false}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

          {profile.verified && (
            <div className="absolute top-6 end-6 bg-gold-500 text-white px-4 py-2 rounded-pill flex items-center gap-2 shadow-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-bold">Verified</span>
            </div>
          )}

          {/* Basic Info Overlay */}
          <div className="absolute bottom-0 start-0 end-0 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">
              {profile.name}, {profile.age}
            </h2>
            <p className="text-lg flex items-center gap-2 mb-3">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              {profile.city}
            </p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Education</p>
              <p className="text-sm font-semibold text-gray-900">
                {profile.education}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Profession</p>
              <p className="text-sm font-semibold text-gray-900">
                {profile.profession}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Height</p>
              <p className="text-sm font-semibold text-gray-900">
                {profile.height}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Sect</p>
              <p className="text-sm font-semibold text-gray-900">
                {profile.sect}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Biradari</p>
              <p className="text-sm font-semibold text-gray-900">
                {profile.biradari}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProfileCards() {
  const [profiles, setProfiles] = useState(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [matches, setMatches] = useState<string[]>([]);
  const subscription = useSubscription();
  const router = useRouter();
  const locale = useLocale();

  const handleSwipe = (direction: "left" | "right") => {
    const profile = profiles[currentIndex];

    if (direction === "right") {
      // Check subscription before allowing match
      if (!subscription.hasAccess) {
        setShowPaywall(true);
        return;
      }

      console.log(`Matched with ${profile.name}`);
      setMatches([...matches, profile.id]);

      // Show success notification (TODO: implement)
      // For now, just log
    } else {
      console.log(`Passed on ${profile.name}`);
    }

    // Move to next profile after animation
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  const handleButtonClick = (direction: "left" | "right") => {
    handleSwipe(direction);
  };

  if (currentIndex >= profiles.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md mx-auto"
      >
        <div className="mb-6">
          <LottieAnimation
            animationData={emptyAnimation}
            className="w-32 h-32 mx-auto"
          />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          No More Profiles
        </h3>
        <p className="text-lg text-gray-600 mb-6">
          You've seen all available matches. Check back later for new profiles!
        </p>
        <button
          onClick={() => {
            setProfiles(mockProfiles);
            setCurrentIndex(0);
          }}
          className="min-h-11 px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-bold rounded-pill transition-colors text-base"
        >
          Review Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Card Stack */}
      <div className="relative w-full h-[700px] mb-8">
        {profiles
          .slice(currentIndex, currentIndex + 3)
          .map((profile, index) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onSwipe={handleSwipe}
              style={{
                zIndex: 10 - index,
                scale: 1 - index * 0.05,
                transformOrigin: "center bottom",
                pointerEvents: index === 0 ? "auto" : "none",
              }}
            />
          ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 max-w-md w-full">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleButtonClick("left")}
          className="min-w-16 min-h-16 w-16 h-16 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-colors group"
          aria-label="Pass"
        >
          <svg
            className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleButtonClick("right")}
          className="min-w-20 min-h-20 w-20 h-20 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 rounded-full flex items-center justify-center shadow-xl transition-all group"
          aria-label="Like"
        >
          <svg
            className="w-10 h-10 text-white group-hover:scale-110 transition-transform"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="min-w-16 min-h-16 w-16 h-16 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-colors group"
          aria-label="Super Like"
        >
          <svg
            className="w-8 h-8 text-teal-500 group-hover:scale-110 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </motion.button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          {currentIndex + 1} / {profiles.length}
        </p>
      </div>

      {/* Matches Counter */}
      {matches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <button
            onClick={() => router.push(`/${locale}/messages`)}
            className="min-h-11 px-6 py-3 bg-gradient-to-r from-gold-500 to-teal-500 hover:from-gold-600 hover:to-teal-600 text-white font-bold rounded-pill shadow-lg transition-all flex items-center gap-2 mx-auto text-base"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            View {matches.length} {matches.length === 1 ? "Match" : "Matches"}
          </button>
        </motion.div>
      )}

      {/* Subscription Paywall */}
      <SubscriptionPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="messaging"
      />
    </div>
  );
}
