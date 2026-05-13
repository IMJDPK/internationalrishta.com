"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

export interface FilterValues {
  sect: string;
  biradari: string;
  maritalStatus: string;
  education: string;
  profession: string;
  smoking: string;
  drinking: string;
  relocation: string;
  ageMin: number;
  ageMax: number;
  radius: number;
}

interface DiscoverFiltersProps {
  onApply: (filters: FilterValues) => void;
}

const DEFAULT_FILTERS: FilterValues = {
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
};

export default function DiscoverFilters({ onApply }: DiscoverFiltersProps) {
  const t = useTranslations("common.discoverFilters");
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);

  const sects = ["All", "Sunni", "Shia", "Other"];
  const biradaris = ["All", "Rajput", "Jatt", "Awan", "Arain", "Syed", "Sheikh", "Mughal", "Pathan", "Other"];
  const maritalStatuses = ["All", "Never Married", "Divorced", "Widowed"];
  const educationLevels = ["All", "Matric", "Intermediate", "Bachelor", "Master", "Doctorate"];
  const professions = ["All", "Business", "Government", "Private Sector", "Self-Employed", "Student", "Other"];
  const yesNo = ["All", "Yes", "No"];

  const updateFilter = <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // Cross-validate age range
      if (key === "ageMin" && typeof value === "number" && value > prev.ageMax) {
        next.ageMax = value;
      }
      if (key === "ageMax" && typeof value === "number" && value < prev.ageMin) {
        next.ageMin = value;
      }
      return next;
    });
  };

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  const renderSelect = (
    id: string,
    labelKey: string,
    valueKey: keyof FilterValues,
    options: string[],
    getOptionKey: (o: string) => string,
  ) => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
        {t(labelKey)}
      </label>
      <select
        id={id}
        value={filters[valueKey] as string}
        onChange={(e) => updateFilter(valueKey, e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt.toLowerCase()}>
            {t(`options.${getOptionKey(opt)}`)}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-card shadow-lg sticky top-32 max-h-[calc(100vh-160px)] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-3 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
      </div>

      {/* Scrollable filters */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-5">
          {renderSelect("discover-sect", "sect", "sect", sects, (o) => o.toLowerCase())}
          {renderSelect("discover-biradari", "biradari", "biradari", biradaris, (o) => o.toLowerCase().replace(/ /g, "_"))}
          {renderSelect("discover-marital", "maritalStatus", "maritalStatus", maritalStatuses, (o) => o.toLowerCase().replace(/ /g, "_"))}
          {renderSelect("discover-education", "education", "education", educationLevels, (o) => o.toLowerCase().replace(/ /g, "_"))}
          {renderSelect("discover-profession", "profession", "profession", professions, (o) => o.toLowerCase().replace(/ /g, "_"))}
          {renderSelect("discover-smoking", "smoking", "smoking", yesNo, (o) => o.toLowerCase())}
          {renderSelect("discover-drinking", "drinking", "drinking", yesNo, (o) => o.toLowerCase())}
          {renderSelect("discover-relocation", "relocation", "relocation", yesNo, (o) => o.toLowerCase())}

          {/* Age Range */}
          <div>
            <p className="block text-sm font-semibold text-gray-700 mb-3">
              {t("age", { min: filters.ageMin, max: filters.ageMax })}
            </p>
            <div className="space-y-3 px-1">
              <div>
                <label htmlFor="age-min" className="text-xs text-gray-500 mb-1 block">
                  {t("ageMin")}: {filters.ageMin}
                </label>
                <input
                  id="age-min"
                  type="range"
                  min="18"
                  max="65"
                  value={filters.ageMin}
                  onChange={(e) => updateFilter("ageMin", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />
              </div>
              <div>
                <label htmlFor="age-max" className="text-xs text-gray-500 mb-1 block">
                  {t("ageMax")}: {filters.ageMax}
                </label>
                <input
                  id="age-max"
                  type="range"
                  min="18"
                  max="65"
                  value={filters.ageMax}
                  onChange={(e) => updateFilter("ageMax", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Search Radius */}
          <div className="px-1">
            <label htmlFor="radius" className="block text-sm font-semibold text-gray-700 mb-2">
              {t("radius", { radius: filters.radius })}
            </label>
            <input
              id="radius"
              type="range"
              min="10"
              max="500"
              step="10"
              value={filters.radius}
              onChange={(e) => updateFilter("radius", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 space-y-2 bg-white">
        <button
          type="button"
          onClick={() => onApply(filters)}
          className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-card transition-colors"
        >
          {t("apply")}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-card transition-colors text-sm"
        >
          {t("reset")}
        </button>
      </div>
    </motion.div>
  );
}
