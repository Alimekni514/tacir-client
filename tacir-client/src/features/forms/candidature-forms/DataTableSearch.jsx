"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DataTableSearch({
  value,
  onChange,
  placeholder = "Rechercher...",
}) {
  return (
    <div className="relative  w-full md:w-64">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-white min-w-lg"
      />
    </div>
  );
}
