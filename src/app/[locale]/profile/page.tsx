"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { createClient } from "@/lib/supabase/client";
import {
  deletePhoto,
  getUserPhotos,
  setPrimaryPhoto,
  uploadProfilePhoto,
} from "@/lib/supabase/storage";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ProfilePage() {
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      alert(`Failed to save profile: ${error.message}`);
    } else {
      setProfile(profileUpdate);
      setIsEditing(false);
      alert("Profile saved successfully!");
    }

    setIsLoading(false);
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    setIsUploadingPhoto(true);

    const isPrimary = photos.length === 0; // First photo is primary
    const { url, error } = await uploadProfilePhoto(user.id, file, isPrimary);

    if (error) {
      alert(`Failed to upload photo: ${error.message}`);
    } else {
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
    if (!confirm("Are you sure you want to delete this photo?")) return;

    const { error } = await deletePhoto(user.id, photoUrl);

    if (error) {
      alert(`Failed to delete photo: ${error.message}`);
    } else {
      const { photos: userPhotos } = await getUserPhotos(user.id);
      setPhotos(userPhotos);
    }
  };

  const handleSetPrimary = async (photoUrl: string) => {
    if (!user) return;

    const { error } = await setPrimaryPhoto(user.id, photoUrl);

    if (error) {
      alert(`Failed to set primary photo: ${error.message}`);
    } else {
      const { photos: userPhotos } = await getUserPhotos(user.id);
      setPhotos(userPhotos);
    }
  };

  const calculateCompletion = () => {
    const fields = Object.values(formData);
    const filled = fields.filter((f) => f && f.toString().trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  if (isLoading) {
    return (
      <main className="bg-gradient-to-br from-purple-50 via-white to-gold-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
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
                <div className="mt-2 inline-block bg-gold-100 text-gold-800 px-3 py-1 rounded-pill text-sm font-medium">
                  Direct Member
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-2.5 rounded-card font-semibold transition-all"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {/* Profile Completion */}
            <div className="bg-gradient-to-br from-gold-50 to-teal-50 rounded-lg p-4 border border-gold-200">
              <p className="text-sm text-gray-700 font-medium mb-2">
                Profile Completion
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
                Photo Gallery ({photos.length}/6)
              </h2>
              {photos.length < 6 && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-2.5 rounded-card font-semibold transition-all disabled:opacity-50"
                  >
                    {isUploadingPhoto ? "Uploading..." : "+ Add Photo"}
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group aspect-square rounded-card overflow-hidden border-2 border-transparent hover:border-gold-500 transition-all"
                >
                  <Image
                    src={photo.url}
                    alt="Profile photo"
                    fill
                    className="object-cover"
                  />
                  {photo.is_primary && (
                    <div className="absolute top-2 left-2 bg-gold-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Primary
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!photo.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(photo.url)}
                        className="bg-white text-gray-900 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-100"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(photo.url)}
                      className="bg-red-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

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
                  <p className="text-gray-600 mb-4">No photos uploaded yet</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-card font-semibold"
                  >
                    Upload Your First Photo
                  </button>
                </div>
              )}
            </div>

            <p className="mt-4 text-sm text-gray-600">
              💡 Tip: Upload at least 3 photos to increase your profile
              visibility. Max 6 photos allowed.
            </p>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-card shadow-xl border border-white/20 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Profile Details
              {isEditing && (
                <span className="ml-3 text-sm font-normal text-gold-600">
                  (Editing mode - changes will be saved when you click Save)
                </span>
              )}
            </h2>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onFocus={() => !isEditing && setIsEditing(true)}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                    isEditing
                      ? "border-gold-300 bg-gold-50/30"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder="Your full name"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onFocus={() => !isEditing && setIsEditing(true)}
                  onChange={(e) =>
                    setFormData({ ...formData, date_of_birth: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                    isEditing
                      ? "border-gold-300 bg-gold-50/30"
                      : "border-gray-300 bg-white"
                  }`}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onFocus={() => !isEditing && setIsEditing(true)}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                    isEditing
                      ? "border-gold-300 bg-gold-50/30"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <select
                  value={formData.city}
                  onFocus={() => !isEditing && setIsEditing(true)}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                    isEditing
                      ? "border-gold-300 bg-gold-50/30"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <option value="">Select city</option>
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onFocus={() => !isEditing && setIsEditing(true)}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                    isEditing
                      ? "border-gold-300 bg-gold-50/30"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder="03XX-XXXXXXX"
                />
              </div>

              {/* Education & Profession */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    value={formData.education}
                    onFocus={() => !isEditing && setIsEditing(true)}
                    onChange={(e) =>
                      setFormData({ ...formData, education: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isEditing
                        ? "border-gold-300 bg-gold-50/30"
                        : "border-gray-300 bg-white"
                    }`}
                    placeholder="e.g., Bachelor in Engineering"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profession
                  </label>
                  <input
                    type="text"
                    value={formData.profession}
                    onFocus={() => !isEditing && setIsEditing(true)}
                    onChange={(e) =>
                      setFormData({ ...formData, profession: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isEditing
                        ? "border-gold-300 bg-gold-50/30"
                        : "border-gray-300 bg-white"
                    }`}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
              </div>

              {/* Height & Sect */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <input
                    type="text"
                    value={formData.height}
                    onFocus={() => !isEditing && setIsEditing(true)}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isEditing
                        ? "border-gold-300 bg-gold-50/30"
                        : "border-gray-300 bg-white"
                    }`}
                    placeholder="e.g., 5'10 or 180cm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sect
                  </label>
                  <select
                    value={formData.sect}
                    onFocus={() => !isEditing && setIsEditing(true)}
                    onChange={(e) =>
                      setFormData({ ...formData, sect: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isEditing
                        ? "border-gold-300 bg-gold-50/30"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <option value="">Select sect</option>
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
                    Biradari
                  </label>
                  <input
                    type="text"
                    value={formData.biradari}
                    onFocus={() => !isEditing && setIsEditing(true)}
                    onChange={(e) =>
                      setFormData({ ...formData, biradari: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isEditing
                        ? "border-gold-300 bg-gold-50/30"
                        : "border-gray-300 bg-white"
                    }`}
                    placeholder="e.g., Rajput, Jatt, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marital Status
                  </label>
                  <select
                    value={formData.marital_status}
                    onFocus={() => !isEditing && setIsEditing(true)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        marital_status: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 border rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isEditing
                        ? "border-gold-300 bg-gold-50/30"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <option value="">Select status</option>
                    <option value="never_married">Never Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Preferences
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="willing_to_relocate"
                    checked={formData.willing_to_relocate}
                    onFocus={() => !isEditing && setIsEditing(true)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        willing_to_relocate: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-gold-500 rounded focus:ring-gold-500"
                  />
                  <label
                    htmlFor="willing_to_relocate"
                    className="text-sm text-gray-700"
                  >
                    Willing to Relocate
                  </label>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-gold-500 to-teal-500 hover:from-gold-600 hover:to-teal-600 text-white px-8 py-4 rounded-card font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save Profile"}
                  </button>
                  <button
                    onClick={() => router.push(`/${locale}/discover`)}
                    className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-card font-semibold transition-all"
                  >
                    Skip for Now
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
