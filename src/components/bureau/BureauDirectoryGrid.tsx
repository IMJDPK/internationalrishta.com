"use client";

import type { PublicBureauDirectoryRow } from "@/types/bureau.types";
import BureauCard from "@/components/bureau/BureauCard";

interface BureauDirectoryGridProps {
  bureaus: PublicBureauDirectoryRow[];
}

export default function BureauDirectoryGrid({
  bureaus,
}: BureauDirectoryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bureaus.map((bureau, index) => (
        <BureauCard key={bureau.id} bureau={bureau} index={index} />
      ))}
    </div>
  );
}
