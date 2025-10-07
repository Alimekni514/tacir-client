"use client";

import { Checkbox } from "../../components/ui/checkbox";
import { DataTableColumnHeader } from "../../components/common/table/DataTableColumnHeader";

export const userColumns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="h-4 w-4 !m-0 !p-0 data-[state=checked]:bg-tacir-darkblue data-[state=checked]:text-white data-[state=checked]:border-tacir-darkblue"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="h-4 w-4 !m-0 !p-0 data-[state=checked]:bg-tacir-darkblue data-[state=checked]:text-white data-[state=checked]:border-tacir-darkblue"
      />
    ),
    enableSorting: true,
    enableHiding: true,
    size: 48,
  },

  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("email")}</span>
    ),
    enableSorting: true,
    enableHiding: true,
    size: 250,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prénom" />
    ),
    cell: ({ row }) => <span>{row.getValue("firstName")}</span>,
    enableSorting: true,
    enableHiding: true,
    size: 150,
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
    cell: ({ row }) => <span>{row.getValue("lastName")}</span>,
    enableSorting: true,
    enableHiding: true,
    size: 150,
  },
  {
    accessorKey: "roles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rôles" />
    ),
    cell: ({ row }) => {
      const roles = row.getValue("roles");
      const roleConfig = {
        admin: { label: "Admin", color: "bg-purple-100 text-purple-800" },
        mentor: { label: "Mentor", color: "bg-blue-100 text-blue-800" },
        projectHolder: {
          label: "Porteur Projet",
          color: "bg-green-100 text-green-800",
        },
        IncubationCoordinator: {
          label: "Coord. Incubation",
          color: "bg-red-100 text-red-800",
        },
        ComponentCoordinator: {
          label: "Coord. Composante",
          color: "bg-yellow-100 text-yellow-800",
        },

        RegionalCoordinator: {
          label: "Coord. Régional",
          color: "bg-pink-100 text-pink-800",
        },
      };

      return (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(roles) ? (
            roles.map((role, index) => (
              <span
                key={index}
                className={`p-2 rounded-full text-xs font-medium ${
                  roleConfig[role]?.color || "bg-gray-100 text-gray-800"
                }`}
              >
                {roleConfig[role]?.label || role}
              </span>
            ))
          ) : (
            <span
              className={`p-2 rounded-full text-xs font-medium ${
                roleConfig[roles]?.color || "bg-gray-100 text-gray-800"
              }`}
            >
              {roleConfig[roles]?.label || roles}
            </span>
          )}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
    size: 200,
  },
  {
    accessorKey: "isConfirmed",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Confirmé" />
    ),
    cell: ({ row }) => {
      const isConfirmed = row.getValue("isConfirmed");
      return (
        <span
          className={` p-2 rounded-full text-xs font-medium ${
            isConfirmed
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {isConfirmed ? "Oui" : "Non"}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true,
    size: 120,
  },
  {
    accessorKey: "isArchived",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Archivé" />
    ),
    cell: ({ row }) => {
      const isArchived = row.getValue("isArchived");
      return (
        <span
          className={` p-2 rounded-full text-xs font-medium ${
            isArchived
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }`}
        >
          {isArchived ? "Oui" : "Non"}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true,
    size: 120,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Créé le" />
    ),
    cell: ({ row }) =>
      new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR"),
    enableSorting: true,
    enableHiding: true,
    size: 150,
  },
];
