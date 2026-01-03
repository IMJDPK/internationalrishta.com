"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function DiscoverFilters() {
  const [filters, setFilters] = useState({
    sect: "all",
    biradari: "all",
    maritalStatus: "all",
    education: "all",
    profession: "all",
    smoking: "all",
    drinking: "all",
    relocation: "all",
    ageMin: 18,
    ageMax: 65,
    radius: 50,
  });

  const sects = ["All", "Sunni", "Shia", "Other"];
  const biradaris = [
    "All",
    "Rajput",
    "Jatt",
    "Awan",
    "Arain",
    "Syed",
    "Sheikh",
    "Mughal",
    "Pathan",
    "Other",
  ];
  const maritalStatuses = ["All", "Never Married", "Divorced", "Widowed"];
  const educationLevels = [
    "All",
    "Matric",
    "Intermediate",
    "Bachelor",
    "Master",
    "Doctorate",
  ];
  const professions = [
    "All",
    "Business",
    "Government",
    "Private Sector",
    "Self-Employed",
    "Student",
    "Other",
  ];
  const yesNo = ["All", "Yes", "No"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-card p-6 shadow-lg sticky top-32 max-h-[calc(100vh-160px)] overflow-y-auto"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Filters</h2>

      <div className="space-y-6">
        {/* Sect */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sect
          </label>
          <select
            value={filters.sect}
            onChange={(e) => setFilters({ ...filters, sect: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
          >
            {sects.map((sect) => (
              <option key={sect} value={sect.toLowerCase()}>
                {sect}
              </option>
            ))}
          </select>
        </div>

        {/* Biradari */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Biradari
          </label>
          <select
            value={filters.biradari}
            onChange={(e) =>
              setFilters({ ...filters, biradari: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
          >
            {biradaris.map((biradari) => (
              <option key={biradari} value={biradari.toLowerCase()}>
                {biradari}
              </option>
            ))}
          </select>
        </div>

        {/* Marital Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Marital Status
          </label>
          <select
            value={filters.maritalStatus}
            onChange={(e) =>
              setFilters({ ...filters, maritalStatus: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
          >
            {maritalStatuses.map((status) => (
              <option key={status} value={status.toLowerCase()}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Education */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Education
          </label>
          <select
            value={filters.education}
            onChange={(e) =>
              setFilters({ ...filters, education: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
          >
            {educationLevels.map((level) => (
              <option key={level} value={level.toLowerCase()}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Profession */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Profession
          </label>
          <select
            value={filters.profession}
            onChange={(e) =>
              setFilters({ ...filters, profession: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
          >
            {professions.map((profession) => (
              <option key={profession} value={profession.toLowerCase()}>
                {profession}
              </option>
            ))}
          </select>
        </div>

        {/* Smoking */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Smoking
          </label>
          <select
            value={filters.smoking}
            onChange={(e) =>
              setFilters({ ...filters, smoking: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
          >
            {yesNo.map((option) => (
              <option key={option} value={option.toLowerCase()}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Drinking */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Drinking
          </label>
          <select
            value={filters.drinking}
            onChange={(e) =>
              setFilters({ ...filters, drinking: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
          >
            {yesNo.map((option) => (
              <option key={option} value={option.toLowerCase()}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Relocation */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Open to Relocation
          </label>
          <select
            value={filters.relocation}
            onChange={(e) =>
              setFilters({ ...filters, relocation: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
          >
            {yesNo.map((option) => (
              <option key={option} value={option.toLowerCase()}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Age: {filters.ageMin} - {filters.ageMax}
          </label>
          <div className="flex gap-3 items-center px-1">
            <input
              type="range"
              min="18"
              max="65"
              value={filters.ageMin}
              onChange={(e) =>
                setFilters({ ...filters, ageMin: parseInt(e.target.value) })
              }
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
            />
            <input
              type="range"
              min="18"
              max="65"
              value={filters.ageMax}
              onChange={(e) =>
                setFilters({ ...filters, ageMax: parseInt(e.target.value) })
              }
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
            />
          </div>
        </div>

        {/* Search Radius */}
        <div className="px-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search Radius: {filters.radius} km
          </label>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={filters.radius}
            onChange={(e) =>
              setFilters({ ...filters, radius: parseInt(e.target.value) })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
          />
        </div>

        <button className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-card transition-colors">
          Apply Filters
        </button>

        <button
          onClick={() =>
            setFilters({
              sect: "all",
              biradari: "all",
              maritalStatus: "all",
              education: "all",
              profession: "all",
              smoking: "all",
              drinking: "all",
              relocation: "all",
              ageMin: 18,
              ageMax: 65,
              radius: 50,
            })
          }
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-card transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </motion.div>
  );
}
