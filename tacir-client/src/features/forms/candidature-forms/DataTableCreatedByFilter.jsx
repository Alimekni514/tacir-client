// components/common/table/DataTableCreatedByFilter.jsx
"use client";

import { useMemo } from "react";
import { Filter } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

export function DataTableCreatedByFilter({ value, onChange, data = [] }) {
  const uniqueCreators = useMemo(() => {
    const seen = new Map();

    data.forEach((form) => {
      const creator = form.createdBy;
      if (creator && !seen.has(creator._id)) {
        seen.set(creator._id, creator);
      }
    });

    return Array.from(seen.values());
  }, [data]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Filter className="mr-2 h-4 w-4" />
          Créé par{" "}
          {value
            ? `(${uniqueCreators.find((c) => c._id === value)?.email || "?"})`
            : ""}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuLabel>Filtrer par créateur</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={!value}
          onCheckedChange={() => onChange("")}
        >
          Tous les créateurs
        </DropdownMenuCheckboxItem>
        {uniqueCreators.map((creator) => (
          <DropdownMenuCheckboxItem
            key={creator._id}
            checked={value === creator._id}
            onCheckedChange={(checked) => onChange(checked ? creator._id : "")}
          >
            {creator.firstName} {creator.lastName} ({creator.email})
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
