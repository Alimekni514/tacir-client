"use client";
import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  getAllForms,
  deleteFormById,
  publishValidatedForms,
  saveFormAsTemplate,
  getAllTemplates,
  applyTemplateToForm,
} from "../../../services/forms/formServices";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { DataTablePagination } from "../../../components/common/table/DataTablePagination";
import { DataTableViewOptions } from "../../../components/common/table/DataTableViewOptions";
import { DataTableCreatedByFilter } from "./DataTableCreatedByFilter";
import DeleteFormDialog from "./DeleteCandidatureFormDialog";
import { getCandidatureFormColumns } from "./columns";
import CandidatureFormDetailsPreview from "./FormDetails-preview";
import TemplateManager from "@/components/formBuilder/TemplateManager";
import SaveAsTemplateDialog from "./SaveAsTemplateDialog";
import { Users, FileText } from "lucide-react";
import { DataTableSearch } from "./DataTableSearch";
import { DataTableTemplateFilter } from "./DataTableTemplateFilter";

const CandidatureFormsTable = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [createdByFilter, setCreatedByFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formToDelete, setFormToDelete] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [saveAsTemplateDialogOpen, setSaveAsTemplateDialogOpen] =
    useState(false);
  const [selectedFormForTemplate, setSelectedFormForTemplate] = useState(null);

  // Add template filter state
  const [templateFilter, setTemplateFilter] = useState("forms");
  // "all", "templates", "forms"

  // For storing selected forms
  const [selectedForms, setSelectedForms] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const handlePreview = (form) => {
    setPreviewForm(form);
  };

  const refreshData = async () => {
    await fetchData();
    await fetchTemplates();
  };

  const columnsConfig = getCandidatureFormColumns({
    onPreview: handlePreview,
    onConfirmDelete: (form) => {
      setFormToDelete(form);
      setDialogOpen(true);
    },
    onSelect: (form) => {
      setSelectedForms((prev) => {
        if (prev.includes(form._id)) {
          return prev.filter((id) => id !== form._id);
        } else {
          return [...prev, form._id];
        }
      });
    },
    onSaveAsTemplate: (form) => {
      setSelectedFormForTemplate(form);
      setSaveAsTemplateDialogOpen(true);
    },
    onUseAsTemplate: (form) => {
      // Navigate to create page with template data
      router.push(
        `/incubation-coordinator/candidatures/ajouter-candidature?templateId=${form._id}`
      );
    },
  });

  const handleDelete = async () => {
    try {
      await deleteFormById(formToDelete._id);
      toast.success("Formulaire supprimé avec succès");
      setDialogOpen(false);
      setFormToDelete(null);
      refreshData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    }
  };

  const handlePublishForm = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.map((row) => row.original._id);

    if (ids.length === 0) {
      return toast.warn(
        "Veuillez sélectionner au moins un formulaire à publier."
      );
    }

    try {
      const response = await publishValidatedForms(ids);
      const { message, modifiedCount, success } = response;

      if (!success && modifiedCount === 0) {
        toast.info(message || "Aucun formulaire n'a été publié.");
      } else {
        toast.success(message || "Formulaires publiés avec succès !");
      }

      setRowSelection(() => ({}));
      await refreshData();
    } catch (error) {
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la publication des formulaires."
      );
    }
  };

  const handleSaveAsTemplate = async (templateData) => {
    try {
      setTemplateLoading(true);
      await saveFormAsTemplate(selectedFormForTemplate._id, templateData);
      toast.success("Modèle enregistré avec succès !");
      setSaveAsTemplateDialogOpen(false);
      setSelectedFormForTemplate(null);
      await refreshData();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du modèle");
      console.error(error);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleApplyTemplate = async (templateId) => {
    try {
      // Navigate to create form page with the template ID
      router.push(
        `/incubation-coordinator/candidatures/ajouter-candidature?templateId=${templateId}`
      );
      setTemplateDialogOpen(false);
    } catch (error) {
      toast.error("Erreur lors de l'application du modèle");
      console.error(error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await getAllTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const table = useReactTable({
    data,
    columns: columnsConfig,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.ceil(totalItems / pagination.pageSize),
    state: {
      sorting,
      pagination,
      rowSelection,
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAllForms({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sortField: sorting[0]?.id || "createdAt",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
        createdBy: createdByFilter,
        search: searchTerm,
        isTemplate:
          templateFilter === "forms"
            ? false
            : templateFilter === "templates"
            ? true
            : undefined,
      });
      setData(response.data);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTemplates();
  }, [pagination, sorting, createdByFilter, searchTerm, templateFilter]);

  const handleTemplateFilterChange = (value) => {
    setTemplateFilter(value);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPagination({ ...pagination, pageIndex: 0 });
  };
  return (
    <div className="space-y-4 p-6 bg-tacir-lightgray">
      {/* Enhanced Header */}
      <div className="bg-white rounded-2xl shadow-md p-4 border border-tacir-lightgray/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-tacir-darkblue rounded-xl shadow-md">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-tacir-darkblue">
                Liste des formulaires des candidatures
              </h1>
              <p className="text-tacir-darkgray">
                Gérez et consultez tous les formulaires de candidature
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
              onClick={handlePublishForm}
              disabled={Object.keys(rowSelection).length === 0}
              className="bg-tacir-pink hover:bg-tacir-darkpink px-4 py-3"
            >
              Publier Formulaires
            </Button>
            <Button
              onClick={() => setTemplateDialogOpen(true)}
              className="bg-tacir-blue hover:bg-tacir-darkblue px-4 py-3 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Modèles
            </Button>
            <Button
              asChild
              className="bg-tacir-green hover:bg-tacir-darkgreen px-4 py-3"
            >
              <Link href="/incubation-coordinator/candidatures/ajouter-candidature">
                Créer un formulaire
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Search Input */}
          <DataTableSearch
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Rechercher par nom, email ou projet..."
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Template Filter */}
          <DataTableTemplateFilter
            value={templateFilter}
            onChange={handleTemplateFilterChange}
          />
          <DataTableCreatedByFilter
            value={createdByFilter}
            onChange={(val) => {
              setCreatedByFilter(val);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            data={data}
            className="w-full md:w-auto"
          />

          <DataTableViewOptions table={table} className="w-full md:w-auto" />
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-2xl shadow-md border border-tacir-lightgray/30 overflow-hidden">
        {loading ? (
          <div className="space-y-4 p-6">
            {[...Array(pagination.pageSize)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tacir-darkblue">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 text-sm py-2 whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-1 border-t border-gray-200">
          <DataTablePagination table={table} totalItems={totalItems} />
        </div>
      </div>

      {/* Dialogs */}
      <DeleteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={formToDelete}
        onDelete={handleDelete}
      />

      <CandidatureFormDetailsPreview
        form={previewForm}
        open={!!previewForm}
        onOpenChange={() => setPreviewForm(null)}
      />

      {/* Template Manager Dialog */}
      <TemplateManager
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        templates={templates}
        onSaveAsTemplate={handleSaveAsTemplate}
        onApplyTemplate={handleApplyTemplate}
        currentForm={selectedFormForTemplate}
        loading={templateLoading}
      />

      {/* Save as Template Dialog */}
      <SaveAsTemplateDialog
        open={saveAsTemplateDialogOpen}
        onOpenChange={setSaveAsTemplateDialogOpen}
        form={selectedFormForTemplate}
        onSave={handleSaveAsTemplate}
        loading={templateLoading}
      />
    </div>
  );
};

export default CandidatureFormsTable;
