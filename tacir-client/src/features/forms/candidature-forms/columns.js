import { Eye, Pencil, Trash2, FileText, Copy } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { DataTableColumnHeader } from "../../../components/common/table/DataTableColumnHeader";
import { Checkbox } from "../../../components/ui/checkbox";

export const getCandidatureFormColumns = ({
  onPreview,
  onConfirmDelete,
  basePath = "http://localhost:3000/incubation-coordinator/candidatures/modifier-candidature",
  onSaveAsTemplate,
  onUseAsTemplate,
}) => [
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
      <div className="font-medium">{row.original.title.fr}</div>
    ),
  },
  {
    accessorKey: "title.ar",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre AR" />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.title.ar}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de création" />
    ),
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
  {
    accessorKey: "fields",
    header: "Champs",
    cell: ({ row }) => row.original.fields.length,
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
    header: "Actions",
    cell: ({ row }) => {
      const form = row.original;

      return (
        <div className="flex items-center gap-1">
          {/* Preview */}
          <Button variant="ghost" size="icon" onClick={() => onPreview(form)}>
            <Eye className="w-4 h-4 text-tacir-lightblue" />
          </Button>

          {/* Edit */}
          <Button variant="ghost" size="icon" asChild>
            <Link href={`${basePath}/${form._id}`}>
              <Pencil className="w-4 h-4 text-tacir-green" />
            </Link>
          </Button>

          {/* Use as Template */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUseAsTemplate(form)}
            title="Utiliser comme modèle"
          >
            <Copy className="w-4 h-4 text-tacir-blue" />
          </Button>

          {/* Save as Template */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSaveAsTemplate(form)}
            title="Enregistrer comme modèle"
          >
            <FileText className="w-4 h-4 text-tacir-purple" />
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onConfirmDelete(form)}
          >
            <Trash2 className="w-4 h-4 text-tacir-pink" />
          </Button>
        </div>
      );
    },
  },
];
