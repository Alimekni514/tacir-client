"use client";
import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "../../../components/ui/button";
import {
  getAllForms,
  validateForms,
} from "../../../services/forms/formServices";
import { Skeleton } from "../../../components/ui/skeleton";
import { DataTablePagination } from "../../../components/common/table/DataTablePagination";
import { DataTableViewOptions } from "../../../components/common/table/DataTableViewOptions";
import { DataTableCreatedByFilter } from "../candidature-forms/DataTableCreatedByFilter";
import { getCandidatureColumns } from "./columns";
import CandidatureFormDetailsPreview from "../candidature-forms/FormDetails-preview";
import { toast } from "react-toastify";
import { Users, FileText } from "lucide-react";
import { DataTableSearch } from "../candidature-forms/DataTableSearch";
import Link from "next/link";

const CandidatureFormsTable = () => {
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [createdByFilter, setCreatedByFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewForm, setPreviewForm] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const handlePreview = (form) => setPreviewForm(form);

  const columnsConfig = getCandidatureColumns({ onPreview: handlePreview });

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
    state: { sorting, pagination, rowSelection },
  });

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await getAllForms({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sortField: sorting[0]?.id || "createdAt",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
        createdBy: createdByFilter,
        search: searchTerm,
        isTemplate: false,
      });
      setData(response.data);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast.error("Erreur lors du chargement des formulaires.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [pagination, sorting, createdByFilter, searchTerm]);

  const handleValidateForm = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.flatMap((row) => row.original._id);

    if (ids.length === 0) {
      return toast.warn(
        "Veuillez sélectionner au moins un formulaire à valider."
      );
    }

    try {
      const response = await validateForms(ids);
      const { message, modifiedCount, success } = response;

      if (!success && modifiedCount === 0) {
        toast.info(message || "Aucun formulaire n'a été validé.");
      } else {
        toast.success(message || "Formulaires validés avec succès !");
      }

      // Clear selection and refresh data
      setRowSelection(() => ({}));
      await fetchForms();
    } catch (error) {
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la validation des formulaires."
      );
    }
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
                Liste des formulaires des candidatures pour validation
              </h1>
              <p className="text-tacir-darkgray">
                Validez les formulaires de candidature soumis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
              onClick={handleValidateForm}
              disabled={Object.keys(rowSelection).length === 0}
              className="bg-tacir-pink hover:bg-tacir-darkpink px-4 py-3"
            >
              Valider Formulaire
            </Button>
            <Button
              asChild
              className="bg-tacir-green hover:bg-tacir-darkgreen px-4 py-3"
            >
              <Link href="/component-coordinator/candidatures/create">
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

      <CandidatureFormDetailsPreview
        form={previewForm}
        open={!!previewForm}
        onOpenChange={() => setPreviewForm(null)}
      />
    </div>
  );
};

export default CandidatureFormsTable;
