"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableViewOptions } from "@/components/common/table/DataTableViewOptions";
import { DataTablePagination } from "@/components/common/table/DataTablePagination";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurrentUser from "@/hooks/useCurrentUser";
import { getMentorSubmissionColumns } from "@/features/submissions/getMentorSubmissionColumns ";
import { getCreathonSubmissionsForMentor } from "@/services/forms/submissionService";
import MentorSubmissionPreview from "@/features/submissions/MentorSubmissionPreview";

const MentorSubmissionsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { user } = useCurrentUser();
  const [previewSubmission, setPreviewSubmission] = useState(null);

  const getRowClass = (status) => {
    const statusClasses = {
      pending: "bg-yellow-50",
      reviewed: "bg-blue-50",
      accepted: "bg-green-50",
      rejected: "bg-red-50",
    };
    return statusClasses[status] || "";
  };

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCreathonSubmissionsForMentor({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sortField: sorting[0]?.id || "createdAt",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      });
      console.log("data", response);
      setData(response.data || []);
    } catch (error) {
      toast.error("Error fetching submissions");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination, sorting]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const columns = useMemo(
    () => getMentorSubmissionColumns(setPreviewSubmission),
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, globalFilter },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(data.total / pagination.pageSize),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mentor Submissions Dashboard</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableCell colSpan={columns.length}>
                  {[...Array(pagination.pageSize)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={getRowClass(row.original.status)}
                  data-state={row.getIsSelected() && "selected"}
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {previewSubmission && (
        <MentorSubmissionPreview
          submission={previewSubmission}
          onClose={() => setPreviewSubmission(null)}
          currentUserId={user?.id}
          onEvaluationAdded={fetchSubmissions}
        />
      )}
    </div>
  );
};

export default MentorSubmissionsTable;
