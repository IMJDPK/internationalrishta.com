"use client";

import { type FilterValues } from "@/components/DiscoverFilters";
import { emptyAnimation } from "@/lib/lottieAnimations";
import { AnimatePresence, motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const LottieAnimation = dynamic(() => import("@/components/LottieAnimation"), {
  ssr: false,
  loading: () => <div className="w-32 h-32 mx-auto rounded-full bg-gray-100 animate-pulse" />,
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

const mockProfiles: Profile[] = [
  { id: "1", name: "Ayesha K.", age: 26, city: "Lahore", education: "Master in Business", profession: "Marketing Manager", height: "5'5\"", sect: "Sunni", biradari: "Rajput", image: "/assets/profile/Pasted imagegirls.png", verified: true },
  { id: "2", name: "Ahmed R.", age: 29, city: "Karachi", education: "Bachelor in Engineering", profession: "Software Engineer", height: "5'10\"", sect: "Sunni", biradari: "Syed", image: "/assets/profile/man1.png", verified: true },
  { id: "3", name: "Fatima S.", age: 24, city: "Islamabad", education: "Bachelor in Medicine", profession: "Doctor", height: "5'4\"", sect: "Sunni", biradari: "Awan", image: "/assets/profile/Pasted image (2)girls.png", verified: true },
  { id: "4", name: "Hamza M.", age: 28, city: "Faisalabad", education: "MBA", profession: "Business Owner", height: "5'11\"", sect: "Sunni", biradari: "Jatt", image: "/assets/profile/men.png", verified: true },
  { id: "5", name: "Zainab H.", age: 25, city: "Multan", education: "Bachelor in CS", profession: "UI/UX Designer", height: "5'3\"", sect: "Sunni", biradari: "Sheikh", image: "/assets/profile/Pasted image (3)girls.png", verified: true },
  { id: "6", name: "Usman K.", age: 31, city: "Peshawar", education: "Master in Finance", profession: "Financial Analyst", height: "5'11\"", sect: "Sunni", biradari: "Pathan", image: "/assets/profile/men2.png", verified: true },
];

interface ProfileCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right" | "super") => void;
  style?: React.CSSProperties;
  fullBleed?: boolean;
}

function ProfileCard({ profile, onSwipe, style, fullBleed }: ProfileCardProps) {
  const t = useTranslations("common.discoverCards");
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  if (fullBleed) {
    // ── Mobile: image fills the entire card ──────────────────────────────
    return (
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate, opacity, ...style }}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      >
        <div className="relative w-full h-full overflow-hidden select-none bg-gray-900">
          <Image
            src={profile.image}
            alt={profile.name}
            fill
            className="object-cover pointer-events-none"
            draggable={false}
            priority
          />

          {/* Gradient overlay — top for badges, bottom for info */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

          {/* LIKE stamp */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-12 left-6 z-20 border-4 border-green-400 rounded-xl px-4 py-2 rotate-[-20deg]"
          >
            <span className="text-green-400 font-black text-3xl tracking-widest uppercase drop-shadow-lg">LIKE</span>
          </motion.div>

          {/* NOPE stamp */}
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-12 right-6 z-20 border-4 border-red-500 rounded-xl px-4 py-2 rotate-[20deg]"
          >
            <span className="text-red-500 font-black text-3xl tracking-widest uppercase drop-shadow-lg">NOPE</span>
          </motion.div>

          {/* Verified badge */}
          {profile.verified && (
            <div className="absolute top-4 right-4 z-10 bg-gold-500 text-white px-3 py-1.5 rounded-pill flex items-center gap-1.5 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-bold">{t("verified")}</span>
            </div>
          )}

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-6 pt-10">
            <h2 className="text-3xl font-black text-white mb-1 drop-shadow-md">
              {profile.name}, {profile.age}
            </h2>
            <p className="text-white/90 text-base flex items-center gap-1.5 mb-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {profile.city}
            </p>
            {/* Compact detail chips */}
            <div className="flex flex-wrap gap-2">
              {[profile.profession, profile.education, profile.height].map((val) => (
                <span key={val} className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-pill border border-white/30">
                  {val}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Desktop: image + detail section below ───────────────────────────────
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate, opacity, ...style }}
      onDragEnd={handleDragEnd}
      className="absolute w-full cursor-grab active:cursor-grabbing"
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden select-none max-w-md mx-auto">
        <div className="relative h-[420px] sm:h-[480px] bg-gradient-to-br from-gold-100 to-teal-100">
          <Image
            src={profile.image}
            alt={profile.name}
            fill
            className="object-cover pointer-events-none"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

          {/* LIKE stamp */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-8 left-6 z-20 border-4 border-green-400 rounded-xl px-4 py-2 rotate-[-20deg]"
          >
            <span className="text-green-400 font-black text-3xl tracking-widest uppercase">LIKE</span>
          </motion.div>

          {/* NOPE stamp */}
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-8 right-6 z-20 border-4 border-red-500 rounded-xl px-4 py-2 rotate-[20deg]"
          >
            <span className="text-red-500 font-black text-3xl tracking-widest uppercase">NOPE</span>
          </motion.div>

          {profile.verified && (
            <div className="absolute top-4 end-4 bg-gold-500 text-white px-3 py-1.5 rounded-pill flex items-center gap-1.5 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-bold">{t("verified")}</span>
            </div>
          )}

          <div className="absolute bottom-0 start-0 end-0 p-5 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">{profile.name}, {profile.age}</h2>
            <p className="text-base flex items-center gap-1.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {profile.city}
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t("education"), value: profile.education },
              { label: t("profession"), value: profile.profession },
              { label: t("height"), value: profile.height },
              { label: t("sect"), value: profile.sect },
              { label: t("biradari"), value: profile.biradari },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ProfileCardsProps {
  filters?: FilterValues;
  fullBleed?: boolean;
}

export default function ProfileCards({ filters, fullBleed }: ProfileCardsProps) {
  const t = useTranslations("common.discoverCards");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<string[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const router = useRouter();
  const locale = useLocale();

  const filteredProfiles = useMemo(() => {
    if (!filters) return mockProfiles;
    return mockProfiles.filter((p) => {
      if (filters.sect !== "all" && p.sect.toLowerCase() !== filters.sect) return false;
      if (filters.biradari !== "all" && p.biradari.toLowerCase() !== filters.biradari) return false;
      if (p.age < filters.ageMin || p.age > filters.ageMax) return false;
      return true;
    });
  }, [filters]);

  const handleSwipe = (direction: "left" | "right" | "super") => {
    const profile = filteredProfiles[currentIndex];
    if (!profile) return;

    if (direction === "right" || direction === "super") {
      setMatches((prev) => [...prev, profile.id]);
      setMatchedProfile(profile);
    }

    setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
  };

  const noProfilesView = (
    <div className={`flex items-center justify-center ${fullBleed ? "h-full" : ""}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md mx-auto"
      >
        <p className="text-xl font-semibold text-gray-700 mb-4">{t("noMoreTitle")}</p>
        <p className="text-gray-500">{t("noMoreDesc")}</p>
      </motion.div>
    </div>
  );

  if (filteredProfiles.length === 0) return noProfilesView;

  const doneView = (
    <div className={`flex items-center justify-center ${fullBleed ? "h-full" : ""}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md mx-auto"
      >
        <div className="mb-6">
          <LottieAnimation animationData={emptyAnimation} className="w-32 h-32 mx-auto" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{t("noMoreTitle")}</h3>
        <p className="text-gray-600 mb-6">{t("noMoreDesc")}</p>
        <button
          type="button"
          onClick={() => setCurrentIndex(0)}
          className="min-h-11 px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-bold rounded-pill transition-colors text-base"
        >
          {t("reviewAgain")}
        </button>
      </motion.div>
    </div>
  );

  if (currentIndex >= filteredProfiles.length) return doneView;

  if (fullBleed) {
    // ── Mobile full-bleed layout ────────────────────────────────────────
    return (
      <div className="flex flex-col h-full">
        {/* Card stack — fills all space above buttons */}
        <div className="relative flex-1 min-h-0">
          {filteredProfiles
            .slice(currentIndex, currentIndex + 3)
            .map((profile, index) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onSwipe={handleSwipe}
                fullBleed
                style={{
                  zIndex: 10 - index,
                  scale: index === 0 ? 1 : 1 - index * 0.04,
                  transformOrigin: "center bottom",
                  pointerEvents: index === 0 ? "auto" : "none",
                }}
              />
            ))}
        </div>

        {/* Action buttons — pinned to bottom */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-6 py-3 safe-area-inset-bottom">
          {/* Progress pill */}
          <p className="text-center text-xs text-gray-400 mb-3">
            {t("progress", { current: currentIndex + 1, total: filteredProfiles.length })}
          </p>

          <div className="flex items-center justify-center gap-5 max-w-xs mx-auto">
            {/* Pass */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleSwipe("left")}
              className="w-16 h-16 bg-white border-2 border-red-200 rounded-full flex items-center justify-center shadow-md hover:border-red-400 transition-colors"
              aria-label={t("pass")}
            >
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Like (centre, larger) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleSwipe("right")}
              className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-xl"
              aria-label={t("like")}
            >
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.button>

            {/* Super like */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleSwipe("super")}
              className="w-16 h-16 bg-white border-2 border-teal-200 rounded-full flex items-center justify-center shadow-md hover:border-teal-400 transition-colors"
              aria-label={t("superLike")}
            >
              <svg className="w-7 h-7 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </motion.button>
          </div>

          {matches.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => router.push(`/${locale}/messages`)}
                className="text-sm font-semibold text-gold-600 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                {matches.length === 1 ? t("viewMatch", { count: matches.length }) : t("viewMatches", { count: matches.length })}
              </button>
            </motion.div>
          )}
        </div>

        {/* Match modal */}
        <AnimatePresence>
          {matchedProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
              onClick={() => setMatchedProfile(null)}
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 18, stiffness: 260 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-b from-gold-500 to-teal-600 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl"
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.1, duration: 0.5 }} className="text-6xl mb-2">💛</motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-4xl font-black text-white mb-1 tracking-tight">{t("matchTitle")}</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-white/90 text-lg mb-6">{t("matchDesc", { name: matchedProfile.name })}</motion.p>
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <Image src="/assets/logo-golden.png" alt="You" width={80} height={80} className="object-cover w-full h-full" />
                  </div>
                  <span className="text-white text-3xl font-black">❤️</span>
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <Image src={matchedProfile.image} alt={matchedProfile.name} width={80} height={80} className="object-cover w-full h-full" />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button type="button" onClick={() => { setMatchedProfile(null); router.push(`/${locale}/messages`); }} className="min-h-12 px-6 py-3 bg-white text-gold-600 font-black rounded-2xl text-lg shadow-lg hover:bg-gold-50 transition-colors">{t("sendMessage")}</button>
                  <button type="button" onClick={() => setMatchedProfile(null)} className="min-h-11 px-6 py-3 text-white/80 font-semibold text-base hover:text-white transition-colors">{t("keepSwiping")}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Desktop layout ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-[min(700px,80svh)]">
        {filteredProfiles
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
      <div className="flex items-center justify-center gap-6 max-w-md w-full mt-6">
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSwipe("left")}
          className="min-w-16 min-h-16 w-16 h-16 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-colors group"
          aria-label={t("pass")}
        >
          <svg className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSwipe("right")}
          className="min-w-20 min-h-20 w-20 h-20 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 rounded-full flex items-center justify-center shadow-xl transition-all group"
          aria-label={t("like")}
        >
          <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSwipe("super")}
          className="min-w-16 min-h-16 w-16 h-16 bg-white hover:bg-teal-50 border-2 border-teal-300 rounded-full flex items-center justify-center shadow-lg transition-colors group"
          aria-label={t("superLike")}
        >
          <svg className="w-8 h-8 text-teal-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </motion.button>
      </div>

      <p className="mt-5 text-sm text-gray-500">
        {t("progress", { current: currentIndex + 1, total: filteredProfiles.length })}
      </p>

      {matches.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/messages`)}
            className="min-h-11 px-6 py-3 bg-gradient-to-r from-gold-500 to-teal-500 hover:from-gold-600 hover:to-teal-600 text-white font-bold rounded-pill shadow-lg transition-all flex items-center gap-2 mx-auto text-base"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            {matches.length === 1 ? t("viewMatch", { count: matches.length }) : t("viewMatches", { count: matches.length })}
          </button>
        </motion.div>
      )}

      {/* Match modal */}
      <AnimatePresence>
        {matchedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setMatchedProfile(null)}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 18, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-gold-500 to-teal-600 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.1, duration: 0.5 }} className="text-6xl mb-2">💛</motion.div>
              <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-4xl font-black text-white mb-1 tracking-tight">{t("matchTitle")}</motion.h2>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-white/90 text-lg mb-6">{t("matchDesc", { name: matchedProfile.name })}</motion.p>
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <Image src="/assets/logo-golden.png" alt="You" width={80} height={80} className="object-cover w-full h-full" />
                </div>
                <span className="text-white text-3xl font-black">❤️</span>
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <Image src={matchedProfile.image} alt={matchedProfile.name} width={80} height={80} className="object-cover w-full h-full" />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button type="button" onClick={() => { setMatchedProfile(null); router.push(`/${locale}/messages`); }} className="min-h-12 px-6 py-3 bg-white text-gold-600 font-black rounded-2xl text-lg shadow-lg hover:bg-gold-50 transition-colors">{t("sendMessage")}</button>
                <button type="button" onClick={() => setMatchedProfile(null)} className="min-h-11 px-6 py-3 text-white/80 font-semibold text-base hover:text-white transition-colors">{t("keepSwiping")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
