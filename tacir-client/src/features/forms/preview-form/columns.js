import { Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { DataTableColumnHeader } from "../../../components/common/table/DataTableColumnHeader";
import { Checkbox } from "../../../components/ui/checkbox";

export const getCandidatureColumns = ({ onPreview }) => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tout sélectionner"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Sélectionner la ligne"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 30,
  },
  {
    accessorKey: "title.fr",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre FR" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.title.fr}</span>
    ),
    enableSorting: true,
    enableHiding: true,
    size: 250,
  },
  {
    accessorKey: "title.ar",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre AR" />
    ),
    cell: ({ row }) => (
      <span className="text-right">{row.original.title.ar}</span>
    ),
    enableSorting: true,
    enableHiding: true,
    size: 250,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de création" />
    ),
    cell: ({ row }) =>
      new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR"),
    enableSorting: true,
    enableHiding: true,
    size: 150,
  },
  {
    accessorKey: "fields",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Champs" />
    ),
    cell: ({ row }) => <span>{row.original.fields.length}</span>,
    enableSorting: false,
    enableHiding: true,
    size: 100,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const isValidated = row.original.validated;
      const isPublished = row.original.published;

      let label = "Non validé";
      let bgColor =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";

      if (isValidated && !isPublished) {
        label = "Validé uniquement";
        bgColor =
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      } else if (isValidated && isPublished) {
        label = "Validé & Publié";
        bgColor =
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      }

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}
        >
          {label}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true,
    size: 140,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => {
      const form = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onPreview(form)}>
            <Eye className="w-4 h-4" />
            <span className="sr-only">Aperçu</span>
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 80,
  },
];
