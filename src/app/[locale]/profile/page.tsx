"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { ToastContainer, useToast } from "@/components/Toast";
import { createClient } from "@/lib/supabase/client";
import {
  deletePhoto,
  getUserPhotos,
  setPrimaryPhoto,
  uploadProfilePhoto,
} from "@/lib/supabase/storage";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ProfilePage() {
  const locale = useLocale();
  const t = useTranslations("common.profilePage");
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [activeTapPhoto, setActiveTapPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, showToast, removeToast } = useToast();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    city: "",
    education: "",
    profession: "",
    height: "",
    sect: "",
    biradari: "",
    marital_status: "",
    smoking: false,
    drinking: false,
    willing_to_relocate: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push(`/${locale}/auth/signin`);
        return;
      }

      setUser(authUser);

      // Fetch profile from database
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name:
            profileData.full_name || authUser.user_metadata?.full_name || "",
          phone: profileData.phone || authUser.user_metadata?.phone || "",
          date_of_birth: profileData.date_of_birth || "",
          gender: profileData.gender || "",
          city: profileData.city || "",
          education: profileData.education || "",
          profession: profileData.profession || "",
          height: profileData.height ? profileData.height.toString() : "",
          sect: profileData.sect || "",
          biradari: profileData.biradari || "",
          marital_status: profileData.marital_status || "",
          smoking: profileData.smoking || false,
          drinking: profileData.drinking || false,
          willing_to_relocate: profileData.willing_to_relocate || false,
        });
      } else {
        // Profile doesn't exist, pre-fill from auth metadata
        setFormData({
          ...formData,
          full_name:
            authUser.user_metadata?.full_name ||
            authUser.email?.split("@")[0] ||
            "",
          phone: authUser.user_metadata?.phone || "",
        });
        setIsEditing(true); // Auto-enable editing for new users
      }

      // Load photos
      const { photos: userPhotos } = await getUserPhotos(authUser.id);
      setPhotos(userPhotos);

      setIsLoading(false);
    };

    fetchUserData();
  }, [locale, router]);

  const handleSaveProfile = async () => {
    const supabase = createClient();
    setIsLoading(true);

    const profileUpdate = {
      id: user.id,
      email: user.email,
      full_name: formData.full_name,
      phone: formData.phone,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      city: formData.city,
      education: formData.education,
      profession: formData.profession,
      height: formData.height ? parseInt(formData.height) : null,
      sect: formData.sect,
      biradari: formData.biradari,
      marital_status: formData.marital_status,
      smoking: formData.smoking,
      drinking: formData.drinking,
      willing_to_relocate: formData.willing_to_relocate,
      subscription_tier: profile?.subscription_tier || "direct",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(profileUpdate);

    if (error) {
      console.error("Error saving profile:", error);
      showToast("error", t("saveFailed", { message: error.message }));
    } else {
      setProfile(profileUpdate);
      setIsEditing(false);
      showToast("success", t("profileSaved"));
    }

    setIsLoading(false);
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("error", t("imageTypeError"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("warning", t("imageSizeError"));
      return;
    }

    setIsUploadingPhoto(true);

    const isPrimary = photos.length === 0; // First photo is primary
    const { url, error } = await uploadProfilePhoto(user.id, file, isPrimary);

    if (error) {
      showToast("error", t("uploadFailed", { message: error.message }));
    } else {
      showToast("success", t("photoUploaded"));
      // Reload photos
      const { photos: userPhotos } = await getUserPhotos(user.id);
      setPhotos(userPhotos);
    }

    setIsUploadingPhoto(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!user) return;
    if (!window.confirm(t("deletePhotoConfirm"))) return;

    setActiveTapPhoto(null);
    const { error } = await deletePhoto(user.id, photoUrl);

    if (error) {
      showToast("error", t("deleteFailed", { message: error.message }));
    } else {
      showToast("success", t("photoDeleted"));
      const { photos: userPhotos } = await getUserPhotos(user.id);
      setPhotos(userPhotos);
    }
  };

  const handleSetPrimary = async (photoUrl: string) => {
    if (!user) return;

    const { error } = await setPrimaryPhoto(user.id, photoUrl);

    if (error) {
      showToast("error", t("setPrimaryFailed", { message: error.message }));
    } else {
      showToast("success", t("primaryUpdated"));
      const { photos: userPhotos } = await getUserPhotos(user.id);
      setPhotos(userPhotos);
    }
  };

  const calculateCompletion = () => {
    const requiredFields: (keyof typeof formData)[] = [
      "full_name", "date_of_birth", "gender", "city",
      "education", "profession", "height", "sect", "biradari", "marital_status",
    ];
    const filled = requiredFields.filter((k) => {
      const v = formData[k];
      return typeof v === "string" && v.trim() !== "";
    }).length;
    return Math.round((filled / requiredFields.length) * 100);
  };

  if (isLoading) {
    return (
      <main className="bg-gradient-to-br from-purple-50 via-white to-gold-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-br from-purple-50 via-white to-gold-50 min-h-screen">
      <Navigation />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-card shadow-xl border border-white/20 p-8 mb-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {formData.full_name || user?.email}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
                <div className="mt-2 inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-pill text-sm font-medium">
                  ✓ {t("memberBadge")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-2.5 rounded-card font-semibold transition-all min-h-11"
              >
                {isEditing ? t("cancel") : t("editProfile")}
              </button>
            </div>

            {/* Profile Completion */}
            <div className="bg-gradient-to-br from-gold-50 to-teal-50 rounded-lg p-4 border border-gold-200">
              <p className="text-sm text-gray-700 font-medium mb-2">
                {t("completion")}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/50 h-3 rounded-pill overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-gold-500 to-teal-500 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateCompletion()}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {calculateCompletion()}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* Photo Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white/80 backdrop-blur-sm rounded-card shadow-xl border border-white/20 p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t("photoGallery", { count: photos.length })}
              </h2>
              {photos.length < 6 && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    aria-label={t("addPhoto")}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-2.5 rounded-card font-semibold transition-all disabled:opacity-50 min-h-11"
                  >
                    {isUploadingPhoto ? t("uploading") : t("addPhoto")}
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => {
                const isActive = activeTapPhoto === photo.id;
                return (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-card overflow-hidden border-2 border-transparent hover:border-gold-500 transition-all"
                    onClick={() => setActiveTapPhoto(isActive ? null : photo.id)}
                  >
                    <Image
                      src={photo.url}
                      alt={t("photoAlt")}
                      fill
                      className="object-cover"
                    />
                    {photo.is_primary && (
                      <div className="absolute top-2 left-2 bg-gold-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {t("primary")}
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-black/60 transition-opacity flex items-center justify-center gap-2 ${isActive ? "opacity-100" : "opacity-0 hover:opacity-100"}`}>
                      {!photo.is_primary && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleSetPrimary(photo.url); }}
                          className="bg-white text-gray-900 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-100 min-h-11"
                        >
                          {t("setPrimary")}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.url); }}
                        className="bg-red-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-600 min-h-11"
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </div>
                );
              })}

              {photos.length === 0 && (
                <div className="col-span-2 md:col-span-3 text-center py-12 bg-gray-50 rounded-card">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-600 mb-4">{t("noPhotos")}</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-card font-semibold min-h-11"
                  >
                    {t("uploadFirstPhoto")}
                  </button>
                </div>
              )}
            </div>

            <p className="mt-4 text-sm text-gray-600">{t("photoTip")}</p>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-card shadow-xl border border-white/20 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("details")}
              {isEditing && (
                <span className="ml-3 text-sm font-normal text-gold-600">
                  ({t("editingHint")})
                </span>
              )}
            </h2>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("fullName")} *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onFocus={() => !isEditing && setIsEditing(true)}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className={`w-full px-4 py-3 text-base border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                    isEditing
                      ? "border-gold-300 bg-gold-50/30"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder={t("fullNamePlaceholder")}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dob")} *
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  aria-label={t("dob")}
                  onFocus={() => !isEditing && setIsEditing(true)}
                  onChange={(e) =>
                    setFormData({ ...formData, date_of_birth: e.target.value })
                  }
                  className={`w-full px-4 py-3 text-base border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                    isEditing
                      ? "border-gold-300 bg-gold-50/30"
                      : "border-gray-300 bg-white"
                  }`}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("gender")} *
                </label>
                <select
                  value={formData.gender}
                  aria-label={t("gender")}
                  onFocus={() => !isEditing && setIsEditing(true)}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className={`w-full px-4 py-3 text-base border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                    isEditing
                      ? "border-gold-300 bg-gold-50/30"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <option value="">{t("selectGender")}</option>
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("city")} *
                </label>
                <select
                  value={formData.city}
                  aria-label={t("city")}
                  onFocus={() => !isEditing && setIsEditing(true)}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className={`w-full px-4 py-3 text-base border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                    isEditing
                      ? "border-gold-300 bg-gold-50/30"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <option value="">{t("selectCity")}</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Quetta">Quetta</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onFocus={() => !isEditing && setIsEditing(true)}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`w-full px-4 py-3 text-base border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                    isEditing
                      ? "border-gold-300 bg-gold-50/30"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder={t("phonePlaceholder")}
                />
              </div>

              {/* Education & Profession */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("education")}
                  </label>
                  <input
                    type="text"
                    value={formData.education}
                    onFocus={() => !isEditing && setIsEditing(true)}
                    onChange={(e) =>
                      setFormData({ ...formData, education: e.target.value })
                    }
                    className={`w-full px-4 py-3 text-base border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isEditing
                        ? "border-gold-300 bg-gold-50/30"
                        : "border-gray-300 bg-white"
                    }`}
                    placeholder={t("educationPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("profession")}
                  </label>
                  <input
                    type="text"
                    value={formData.profession}
                    onFocus={() => !isEditing && setIsEditing(true)}
                    onChange={(e) =>
                      setFormData({ ...formData, profession: e.target.value })
                    }
                    className={`w-full px-4 py-3 text-base border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isEditing
                        ? "border-gold-300 bg-gold-50/30"
                        : "border-gray-300 bg-white"
                    }`}
                    placeholder={t("professionPlaceholder")}
                  />
                </div>
              </div>

              {/* Height & Sect */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("height")}
                  </label>
                  <input
                    type="text"
                    value={formData.height}
                    onFocus={() => !isEditing && setIsEditing(true)}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    className={`w-full px-4 py-3 text-base border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isEditing
                        ? "border-gold-300 bg-gold-50/30"
                        : "border-gray-300 bg-white"
                    }`}
                    placeholder={t("heightPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("sect")}
                  </label>
                  <select
                    value={formData.sect}
                    aria-label={t("sect")}
                    onFocus={() => !isEditing && setIsEditing(true)}
                    onChange={(e) =>
                      setFormData({ ...formData, sect: e.target.value })
                    }
                    className={`w-full px-4 py-3 text-base border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isEditing
                        ? "border-gold-300 bg-gold-50/30"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <option value="">{t("selectSect")}</option>
                    <option value="Sunni">Sunni</option>
                    <option value="Shia">Shia</option>
                    <option value="Syed">Syed</option>
                  </select>
                </div>
              </div>

              {/* Biradari & Marital Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("biradari")}
                  </label>
                  <input
                    type="text"
                    value={formData.biradari}
                    onFocus={() => !isEditing && setIsEditing(true)}
                    onChange={(e) =>
                      setFormData({ ...formData, biradari: e.target.value })
                    }
                    className={`w-full px-4 py-3 text-base border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isEditing
                        ? "border-gold-300 bg-gold-50/30"
                        : "border-gray-300 bg-white"
                    }`}
                    placeholder={t("biradariPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("maritalStatus")}
                  </label>
                  <select
                    value={formData.marital_status}
                    aria-label={t("maritalStatus")}
                    onFocus={() => !isEditing && setIsEditing(true)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        marital_status: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 text-base border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isEditing
                        ? "border-gold-300 bg-gold-50/30"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <option value="">{t("selectStatus")}</option>
                    <option value="never_married">{t("neverMarried")}</option>
                    <option value="divorced">{t("divorced")}</option>
                    <option value="widowed">{t("widowed")}</option>
                  </select>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("preferences")}
                </h3>
                {(
                  [
                    { id: "willing_to_relocate", key: "willingToRelocate", field: "willing_to_relocate" },
                    { id: "smoking", key: "smoking", field: "smoking" },
                    { id: "drinking", key: "drinking", field: "drinking" },
                  ] as const
                ).map(({ id, key, field }) => (
                  <div key={id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={id}
                      checked={formData[field] as boolean}
                      onFocus={() => !isEditing && setIsEditing(true)}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.checked })
                      }
                      className="w-5 h-5 text-gold-500 rounded focus:ring-gold-500"
                    />
                    <label htmlFor={id} className="text-sm text-gray-700">
                      {t(key)}
                    </label>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-gold-500 to-teal-500 hover:from-gold-600 hover:to-teal-600 text-white px-8 py-4 rounded-card font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 min-h-11"
                  >
                    {isLoading ? t("saving") : t("saveProfile")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-card font-semibold transition-all min-h-11"
                  >
                    {t("skipForNow")}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}
