// components/common/table/DataTableStatusFilter.jsx
"use client";
import React, { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const roleOptions = [
  { value: "", label: "Tous les rôles" },
  { value: "admin", label: "Administrateur" },
  { value: "mentor", label: "Mentor" },
  { value: "projectHolder", label: "Porteur de projet" },
  { value: "GeneralCoordinator", label: "Coordinateur d'incubation" },
  { value: "ComponentCoordinator", label: "Coordinateur de composante" },
  // { value: "Beneficiary", label: "Bénéficiaire" },
  { value: "RegionalCoordinator", label: "Coordinateur régional" },
  // { value: "member", label: "Membre" },
];

export function DataTableStatusFilter({ value, onChange }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Filter className="mr-2 h-4 w-4" />
          Statut{" "}
          {value && `(${roleOptions.find((o) => o.value === value)?.label})`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Filtrer par rôle</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roleOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={value === option.value}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange(option.value);
              } else {
                onChange("");
              }
            }}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
