"use client";

import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { DataTablePagination } from "../../components/common/table/DataTablePagination";
import { DataTableViewOptions } from "../../components/common/table/DataTableViewOptions";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { fetchMembers, archiveMembers } from "../../services/users/members";
import { userColumns } from "./columns";
import AddMemberForm from "../../components/forms/AddMemberForm";
import { InlineLoader } from "../../components/ui/Loader";
import { DataTableStatusFilter } from "./DataTableStatusFilter";
import { cn } from "../../lib/utils";
import { toast } from "react-toastify";

export function UsersTable() {
  const [data, setData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  // Simplified pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns: userColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true, // Add this crucial line
    manualSorting: true, // Add this
    manualFiltering: true, // Add this
    pageCount: Math.ceil(totalItems / pagination.pageSize), // Calculate pageCount
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableSorting: true,
    enableHiding: true,
    debugTable: true,
  });

  const loadMembers = async () => {
    setLoading(true);
    try {
      const sortField = sorting[0]?.id;
      const sortDirection = sorting[0]?.desc ? "desc" : "asc";

      const result = await fetchMembers({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sortField,
        sortDirection,
        filters: {
          role: roleFilter,
          isArchived: false,
          isActive: true,
        },
      });

      // Try different possible properties from your API response
      const totalCount =
        result.totalItems ||
        result.total ||
        result.count ||
        result.totalCount ||
        result.pagination?.total ||
        0;

      setData(result.data);
      setTotalItems(totalCount);
    } catch (error) {
      console.error("Failed to load members:", error);
      toast.error("Erreur lors du chargement des membres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [pagination.pageIndex, pagination.pageSize, sorting, roleFilter]);

  const handleSuccess = () => {
    setIsOpen(false);
    loadMembers();
  };

  const handleArchiveSelected = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.map((row) => row.original._id);

    if (ids.length === 0) {
      return toast.error(
        "Veuillez sélectionner au moins un membre à archiver."
      );
    }

    try {
      const response = await archiveMembers(ids);
      const { message, modifiedCount } = response;

      if (modifiedCount === 0) {
        toast.warning(message || "Aucun membre n'a été archivé.");
      } else {
        toast.success(message || "Membres archivés avec succès !");
      }

      setRowSelection({});
      loadMembers(); // Refresh data after archiving
    } catch (error) {
      toast.error(
        error.message || "Une erreur est survenue lors de l'archivage."
      );
    }
  };

  return (
    // <div className="space-y-4">
    <div className=" min-h-screen bg-tacir-lightgray sm:p-6">
      {/* Section En-tête */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-tacir-lightgray/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-tacir-blue rounded-xl shadow-md">
              <Users className="w-4 h-4 text-white" />{" "}
              {/* Add Users icon import */}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-tacir-darkblue">
                Gestion des Membres
              </h1>
              <p className="text-tacir-darkgray text-sm">
                Gérez les membres de votre équipe, ajoutez de nouveaux membres
                et archivez les anciens
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <DataTableViewOptions table={table} />
            <DataTableStatusFilter
              value={roleFilter}
              onChange={(value) => {
                setRoleFilter(value);
                setPagination({ ...pagination, pageIndex: 0 });
              }}
            />
            <Button
              variant="destructive"
              onClick={handleArchiveSelected}
              disabled={Object.keys(rowSelection).length === 0}
              className={cn("bg-tacir-pink")}
            >
              Archiver
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-tacir-green hover:bg-green-700">
                  Ajouter un membre
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau membre</DialogTitle>
                </DialogHeader>
                <AddMemberForm onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-white mb-4">
        <Table className="rounded-md">
          <TableHeader className="rounded-xl">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className="bg-tacir-darkblue text-tacir-lightgray"
                    key={header.id}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={userColumns.length} className="text-center">
                  <InlineLoader text="Chargement des membres..." />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selecté"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={userColumns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
