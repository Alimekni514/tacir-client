"use client";

import { useState, useEffect, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  getFormsRegions,
  getOpenRegionForms,
  updateSubmissionStatus,
  validatePreselectionSubmissions,
  addOrUpdatePreselectionEvaluation,
  withdrawCandidate,
  getReplacementCandidates,
  selectReplacementCandidate,
} from "@/services/forms/submissionService";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableViewOptions } from "@/components/common/table/DataTableViewOptions";
import { DataTablePagination } from "@/components/common/table/DataTablePagination";
import { Input } from "@/components/ui/input";
import { getSubmissionColumns } from "./submission-columns";
import { toast } from "react-toastify";
import {
  Download,
  Users,
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  ArrowUpDown,
} from "lucide-react";
import { handleExportAll } from "./export-excel";
import SubmissionPreview from "./SubmissionPreview";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useCurrentUser from "@/hooks/useCurrentUser";
import { statusOptions } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/ui/Loader";
import WithdrawalManager from "./WithdrawalManager";
import { StatsCard } from "./statsCard";

const CandidatureSubmissionTable = () => {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [loadingRegions, setLoadingRegions] = useState(true);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { user } = useCurrentUser();
  const [previewSubmission, setPreviewSubmission] = useState(null);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [replacementDialogOpen, setReplacementDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [replacementCandidates, setReplacementCandidates] = useState([]);
  const [selectedReplacement, setSelectedReplacement] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    under_review: 0,
    accepted: 0,
    acceptedAfterCreathon: 0,
    rejected: 0,
  });

  const getRowClass = (status) => statusOptions[status]?.rowClass || "";

  useEffect(() => {
    let isMounted = true;

    const fetchRegions = async () => {
      try {
        const response = await getFormsRegions();
        const fetchedRegions = response?.data || [];
        if (isMounted) {
          setRegions(fetchedRegions);
          if (fetchedRegions.length > 0) {
            setSelectedRegion(fetchedRegions[0]._id);
          }
          setLoadingRegions(false);
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
        if (isMounted) {
          setLoadingRegions(false);
          toast.error("Erreur de chargement des régions");
        }
      }
    };

    fetchRegions();

    return () => {
      isMounted = false;
    };
  }, []);

  const { pageIndex, pageSize } = pagination;
  const sortField = sorting[0]?.id || "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  useEffect(() => {
    if (!selectedRegion) return;

    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const { data: openForms = [] } = await getOpenRegionForms(
          selectedRegion,
          {
            page: pageIndex + 1,
            pageSize,
            sortField,
            sortOrder,
          }
        );

        const allSubmissions = openForms.map((sub) => {
          const answerMap = {};
          sub?.answers?.forEach((ans) => {
            const label = ans.field?.label?.fr;
            if (label) answerMap[label] = ans.value;
          });
          return { ...sub, ...answerMap, formTitle: sub?.form?.title?.fr };
        });

        setData(allSubmissions.filter((s) => s?._id));

        // Calculate statistics - only for relevant statuses
        const statusCounts = allSubmissions.reduce(
          (acc, submission) => {
            acc.total++;

            // Only count the statuses we care about
            if (
              [
                "submitted",
                "accepted",
                "acceptedAfterCreathon",
                "rejected",
              ].includes(submission.status)
            ) {
              acc[submission.status] = (acc[submission.status] || 0) + 1;
            }

            return acc;
          },
          {
            total: 0,
            under_review: 0,
            accepted: 0,
            acceptedAfterCreathon: 0,
            rejected: 0,
          }
        );

        setStats(statusCounts);
      } catch (err) {
        toast.error("Erreur lors du chargement des soumissions.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [
    selectedRegion,
    pageIndex,
    pageSize,
    sortField,
    sortOrder,
    refreshCounter,
  ]);

  const handlePreview = (submission) => setPreviewSubmission(submission);

  const refreshSubmissions = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  const handleWithdrawal = async (submission) => {
    setSelectedWithdrawal(submission);
    setWithdrawalDialogOpen(true);
  };

  const confirmWithdrawal = async (note = "") => {
    setIsProcessing(true);
    try {
      const response = await withdrawCandidate(selectedWithdrawal._id, note);
      toast.success(response.message);

      setData((prevData) =>
        prevData.map((item) =>
          item._id === selectedWithdrawal._id
            ? {
                ...item,
                status: "rejected",
                attendanceStatus: "declined",
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        rejected: prev.rejected + 1,
        [selectedWithdrawal.status]: prev[selectedWithdrawal.status] - 1,
      }));

      const { data } = await getReplacementCandidates(
        response.submission.submission.form
      );

      setReplacementCandidates(data);
      setWithdrawalDialogOpen(false);
      setReplacementDialogOpen(true);
    } catch (error) {
      toast.error(error.message || "Erreur lors du désistement");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectReplacement = async () => {
    if (!selectedReplacement) return;

    setIsProcessing(true);
    try {
      const response = await selectReplacementCandidate(selectedReplacement);
      toast.success(response.message);

      setData((prevData) =>
        prevData.map((item) =>
          item._id === selectedReplacement
            ? {
                ...item,
                status: "accepted",
                isReplacement: true,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      // Update stats
      const replacedSubmission = data.find(
        (item) => item._id === selectedReplacement
      );
      if (replacedSubmission) {
        setStats((prev) => ({
          ...prev,
          accepted: prev.accepted + 1,
          [replacedSubmission.status]: prev[replacedSubmission.status] - 1,
        }));
      }

      setReplacementDialogOpen(false);
    } catch (error) {
      toast.error(error.message || "Erreur lors de la sélection du remplaçant");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusUpdate = async (submissionId, newStatus) => {
    try {
      const oldStatus = data.find((item) => item._id === submissionId)?.status;

      const response = await updateSubmissionStatus(submissionId, newStatus);
      toast.success(response.message || "Statut mis à jour avec succès");

      setData((prevData) =>
        prevData.map((item) =>
          item._id === submissionId ? { ...item, status: newStatus } : item
        )
      );

      // Update stats only if both old and new status are in our tracked statuses
      if (
        ["submitted", "accepted", "acceptedAfterCreathon", "rejected"].includes(
          oldStatus
        ) ||
        ["submitted", "accepted", "acceptedAfterCreathon", "rejected"].includes(
          newStatus
        )
      ) {
        setStats((prev) => ({
          ...prev,
          [newStatus]: (prev[newStatus] || 0) + 1,
          [oldStatus]: prev[oldStatus] - 1,
        }));
      }
    } catch (error) {
      toast.error(error.message || "Échec de la mise à jour du statut");
    }
  };

  const handleEvaluationChange = async (submissionId, evaluationText) => {
    try {
      // Show loading state if needed
      setIsProcessing(true);
      // Make API call
      await addOrUpdatePreselectionEvaluation(submissionId, evaluationText);
      toast.success("Évaluation enregistrée");
      // Final refresh to ensure complete sync
      refreshSubmissions();
    } catch (error) {
      // Revert on error
      toast.error("Erreur lors de l'enregistrement");
      console.error("Evaluation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidatePreselection = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (!selectedRows.length) return;
    try {
      await validatePreselectionSubmissions(
        selectedRows.map((row) => row.original._id)
      );
      toast.success("Soumissions validées avec succès.");
      table.resetRowSelection();
      refreshSubmissions();
    } catch {
      toast.error("Échec de la validation des soumissions.");
    }
  };

  const staticColumns = useMemo(
    () =>
      getSubmissionColumns(
        handlePreview,
        handleStatusUpdate,
        handleEvaluationChange,
        handleWithdrawal
      ),
    [
      handlePreview,
      handleStatusUpdate,
      handleEvaluationChange,
      handleWithdrawal,
    ]
  );

  const uniqueLabels = useMemo(() => {
    const labels = new Set();
    data.forEach((sub) =>
      sub.answers?.forEach((ans) => {
        const label = ans.field?.label?.fr;
        if (label) labels.add(label);
      })
    );
    return Array.from(labels);
  }, [data]);

  // Add maxWidth to each column definition
  const dynamicColumns = useMemo(
    () =>
      uniqueLabels.map((label) => ({
        accessorKey: label,
        header: label,
        cell: ({ row }) => {
          const value = row.original[label] || "-";
          return (
            <div className="truncate max-w-[200px]" title={value}>
              {value}
            </div>
          );
        },
        size: 220, // Set column size for better resizing
        minSize: 100,
        maxSize: 300,
      })),
    [uniqueLabels]
  );

  const coreStaticColumns = useMemo(
    () => staticColumns.filter((col) => col.id !== "actions"),
    [staticColumns]
  );
  const actionsColumn = useMemo(
    () => staticColumns.find((col) => col.id === "actions"),
    [staticColumns]
  );

  // Add maxWidth to static columns
  const enhancedStaticColumns = useMemo(
    () =>
      coreStaticColumns.map((col) => {
        // Set appropriate max widths for each column type
        let maxWidth = 150;
        if (col.accessorKey === "status") maxWidth = 140;
        if (col.accessorKey === "submittedAt") maxWidth = 130;
        if (col.accessorKey === "preselectionEvaluations") maxWidth = 230;
        if (col.accessorKey === "attendanceStatus") maxWidth = 150;

        return {
          ...col,
          cell: (props) => {
            const cellValue = col.cell?.(props);
            return (
              <div className="truncate" style={{ maxWidth: `${maxWidth}px` }}>
                {cellValue}
              </div>
            );
          },
          size: maxWidth,
          minSize: 80,
          maxSize: maxWidth + 50,
        };
      }),
    [coreStaticColumns]
  );

  // Add maxWidth to actions column
  const enhancedActionsColumn = useMemo(
    () => ({
      ...actionsColumn,
      cell: (props) => {
        const cellValue = actionsColumn.cell?.(props);
        return <div className="truncate max-w-[180px]">{cellValue}</div>;
      },
      size: 180,
      minSize: 120,
      maxSize: 200,
    }),
    [actionsColumn]
  );

  const columns = useMemo(
    () =>
      [
        ...enhancedStaticColumns,
        ...dynamicColumns,
        enhancedActionsColumn,
      ].filter(Boolean),
    [enhancedStaticColumns, dynamicColumns, enhancedActionsColumn]
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
    manualPagination: false,
  });

  if (loadingRegions || !selectedRegion) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 p-6 bg-white min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-md p-4 border border-tacir-lightgray/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-tacir-darkblue rounded-xl shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-tacir-darkblue">
                Gestion des Soumissions
              </h1>
              <p className="text-tacir-darkgray">
                Consultez et gérez toutes les soumissions de candidature
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleValidatePreselection}
              disabled={table.getSelectedRowModel().rows.length === 0}
              className="bg-tacir-green hover:bg-tacir-darkgreen text-white px-4 py-3"
            >
              Valider la présélection
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportAll(data)}
              className="gap-2 border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white"
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray h-4 w-4" />
          <Input
            placeholder="Rechercher..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 !min-w-lg w-full"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <Select
            value={selectedRegion}
            onValueChange={(value) => setSelectedRegion(value)}
          >
            <SelectTrigger className="w-full md:w-[250px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-tacir-darkgray" />
                <SelectValue placeholder="Sélectionnez une région" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region._id} value={region._id}>
                  {region.name.fr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatsCard
          title="Total"
          value={stats.total}
          icon={Users}
          color="tacir-lightblue"
          percentage={
            stats.total > 0 ? Math.round((stats.total / stats.total) * 100) : 0
          }
        />
        <StatsCard
          title="En revue"
          value={stats.submitted}
          icon={Clock}
          color="tacir-yellow"
          percentage={
            stats.total > 0
              ? Math.round((stats.submitted / stats.total) * 100)
              : 0
          }
        />
        <StatsCard
          title="Acceptées"
          value={stats.accepted}
          icon={CheckCircle}
          color="tacir-green"
          percentage={
            stats.total > 0
              ? Math.round((stats.accepted / stats.total) * 100)
              : 0
          }
        />
        <StatsCard
          title="Après Créathon"
          value={stats.acceptedAfterCreathon}
          icon={Star}
          color="tacir-blue"
          percentage={
            stats.total > 0
              ? Math.round((stats.acceptedAfterCreathon / stats.total) * 100)
              : 0
          }
        />
        <StatsCard
          title="Rejetées"
          value={stats.rejected}
          icon={XCircle}
          color="tacir-pink"
          percentage={
            stats.total > 0
              ? Math.round((stats.rejected / stats.total) * 100)
              : 0
          }
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-md border border-tacir-lightgray/30 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="bg-tacir-darkblue">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-tacir-blue hover:bg-tacir-blue/90 transition-colors"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="px-4 py-2 text-left text-xs bg-tacir-darkblue font-semibold text-white uppercase tracking-wider"
                        style={{
                          width: header.getSize(),
                          maxWidth: header.column.columnDef.maxSize,
                        }}
                      >
                        <div className="flex items-center truncate">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <ArrowUpDown className="ml-1 h-3 w-3 opacity-70" />
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="p-4">
                      <div className="space-y-2">
                        {[...Array(pagination.pageSize)].map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-12 w-full rounded-lg"
                          />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={`${getRowClass(
                        row.original.status
                      )} hover:bg-tacir-lightgray/30 transition-colors border-tacir-lightgray/20 group`}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-4 py-3 text-sm group-hover:bg-white/50"
                          style={{
                            width: cell.column.getSize(),
                            maxWidth: cell.column.columnDef.maxSize,
                          }}
                        >
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
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center text-tacir-darkgray">
                        <Search className="h-8 w-8 mb-2 opacity-50" />
                        <p className="font-medium">Aucune soumission trouvée</p>
                        <p className="text-sm mt-1">
                          Essayez de modifier vos filtres de recherche
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-tacir-lightgray/30 bg-tacir-lightgray/20">
          <DataTablePagination table={table} />
        </div>
      </div>

      {/* Dialogs */}
      <WithdrawalManager
        withdrawalDialogOpen={withdrawalDialogOpen}
        setWithdrawalDialogOpen={setWithdrawalDialogOpen}
        replacementDialogOpen={replacementDialogOpen}
        setReplacementDialogOpen={setReplacementDialogOpen}
        selectedWithdrawal={selectedWithdrawal}
        replacementCandidates={replacementCandidates}
        selectedReplacement={selectedReplacement}
        setSelectedReplacement={setSelectedReplacement}
        isProcessing={isProcessing}
        onConfirmWithdrawal={confirmWithdrawal}
        onSelectReplacement={handleSelectReplacement}
      />

      {/* Preview Modal */}
      {user && previewSubmission && (
        <SubmissionPreview
          submission={previewSubmission}
          onClose={() => setPreviewSubmission(null)}
          currentUserId={user.id}
        />
      )}
    </div>
  );
};

export default CandidatureSubmissionTable;
