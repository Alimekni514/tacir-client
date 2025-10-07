"use client";
import { useState, useEffect } from "react";
import { ParticipantOutputCard } from "@/features/output/ParticipantOutputCard";
import { SubmissionDialog } from "@/features/output/OutputSubmissionDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/features/output/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  List,
  Grid,
  Target,
  Clock,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getMyOutputs,
  submitParticipantOutput,
  updateParticipantSubmission,
} from "@/services/outputs/output";
import { toast } from "react-toastify";
const ParticipantOutputsPage = () => {
  const [outputs, setOutputs] = useState([]);
  const [filteredOutputs, setFilteredOutputs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    notStarted: 0,
    submitted: 0,
    approved: 0,
    overdue: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(1);

  // Add this function to get paginated outputs
  const getPaginatedOutputs = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOutputs.slice(startIndex, endIndex);
  };
  const [loading, setLoading] = useState(true);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    sort: "dueDate-asc",
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const outputsRes = await getMyOutputs();
        console.log("outputs", outputsRes);
        setOutputs(outputsRes.data);
        setFilteredOutputs(outputsRes.data);
        setStats(outputsRes.stats);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...outputs];

    // Apply search filter
    if (filters.search) {
      result = result.filter(
        (output) =>
          output.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          output.description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      result = result.filter((output) => {
        if (filters.status === "not_started") return !output.submission;
        if (filters.status === "submitted")
          return output.submission?.submitted && !output.submission?.approved;
        if (filters.status === "approved") return output.submission?.approved;
        if (filters.status === "overdue") {
          const due = new Date(output.dueDate);
          const today = new Date();
          return due < today && !output.submission?.approved;
        }
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      if (filters.sort === "dueDate-asc") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (filters.sort === "dueDate-desc") {
        return new Date(b.dueDate) - new Date(a.dueDate);
      } else if (filters.sort === "title-asc") {
        return a.title.localeCompare(b.title);
      } else if (filters.sort === "title-desc") {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    setFilteredOutputs(result);
  }, [filters, outputs]);

  const handleSubmission = async (submissionData) => {
    try {
      const result = await submitParticipantOutput(submissionData.outputId, {
        notes: submissionData.notes,
        attachments: submissionData.attachments,
      });
      toast.success(result.message || "Soumission réussie !");
      setIsDialogOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdate = async (outputId, submissionData, attachments) => {
    try {
      await updateParticipantSubmission(outputId, submissionData, attachments);
      // Refresh data
      const res = await getMyOutputs();
      setOutputs(res.data);
      setStats(res.stats);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const openSubmissionDialog = (output, isUpdate = false) => {
    setSelectedOutput(output);
    setIsUpdating(isUpdate);
    setIsDialogOpen(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-tacir-darkblue mb-2">
          Mes Livrables
        </h1>
        <p className="text-tacir-darkgray">
          Gérez vos soumissions et suivez votre progression
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total"
          value={stats.total}
          icon={<Target className="w-5 h-5" />}
          color="bg-tacir-blue/10 text-tacir-blue"
        />
        <StatCard
          title="À faire"
          value={stats.notStarted}
          icon={<Clock className="w-5 h-5" />}
          color="bg-tacir-orange/10 text-tacir-orange"
        />
        <StatCard
          title="Soumis"
          value={stats.submitted}
          icon={<Upload className="w-5 h-5" />}
          color="bg-tacir-lightblue/10 text-tacir-lightblue"
        />
        <StatCard
          title="Approuvés"
          value={stats.approved}
          icon={<CheckCircle className="w-5 h-5" />}
          color="bg-tacir-green/10 text-tacir-green"
        />
        <StatCard
          title="En retard"
          value={stats.overdue}
          icon={<AlertCircle className="w-5 h-5" />}
          color="bg-tacir-pink/10 text-tacir-pink"
        />
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-tacir-lightgray/30 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tacir-darkgray" />
            <Input
              placeholder="Rechercher un livrable..."
              className="pl-10"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 ${
                viewMode === "list"
                  ? "bg-tacir-blue hover:bg-tacir-blue/90 text-white"
                  : "bg-transparent hover:bg-tacir-lightgray/20"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Liste</span>
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 ${
                viewMode === "grid"
                  ? "bg-tacir-blue hover:bg-tacir-blue/90 text-white"
                  : "bg-transparent hover:bg-tacir-lightgray/20"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Grille</span>
            </Button>
          </div>{" "}
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Status Filter */}
          <div>
            <Label className="text-sm text-tacir-darkgray mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Statut
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="not_started">À faire</SelectItem>
                <SelectItem value="submitted">Soumis</SelectItem>
                <SelectItem value="approved">Approuvés</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div>
            <Label className="text-sm text-tacir-darkgray mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Trier par
            </Label>
            <Select
              value={filters.sort}
              onValueChange={(value) => handleFilterChange("sort", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate-asc">
                  Date limite (croissant)
                </SelectItem>
                <SelectItem value="dueDate-desc">
                  Date limite (décroissant)
                </SelectItem>
                <SelectItem value="title-asc">Titre (A-Z)</SelectItem>
                <SelectItem value="title-desc">Titre (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  search: "",
                  status: "all",
                  sort: "dueDate-asc",
                })
              }
              className="w-full"
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger
            value="all"
            onClick={() => handleFilterChange("status", "all")}
          >
            Tous ({stats.total})
          </TabsTrigger>
          <TabsTrigger
            value="not_started"
            onClick={() => handleFilterChange("status", "not_started")}
          >
            À faire ({stats.notStarted})
          </TabsTrigger>
          <TabsTrigger
            value="submitted"
            onClick={() => handleFilterChange("status", "submitted")}
          >
            Soumis ({stats.submitted})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            onClick={() => handleFilterChange("status", "approved")}
          >
            Approuvés ({stats.approved})
          </TabsTrigger>
          <TabsTrigger
            value="overdue"
            onClick={() => handleFilterChange("status", "overdue")}
          >
            En retard ({stats.overdue})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Outputs List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-tacir-blue animate-spin" />
        </div>
      ) : filteredOutputs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-tacir-lightgray/30 p-8 text-center">
          <div className="mx-auto max-w-md">
            <div className="p-4 bg-tacir-lightgray/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-8 h-8 text-tacir-darkgray" />
            </div>
            <h3 className="text-lg font-medium text-tacir-darkblue mb-2">
              Aucun livrable trouvé
            </h3>
            <p className="text-tacir-darkgray mb-4">
              {filters.search || filters.status !== "all"
                ? "Essayez de modifier vos critères de recherche"
                : "Vous n'avez aucun livrable pour le moment"}
            </p>
            {(filters.search || filters.status !== "all") && (
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    search: "",
                    status: "all",
                    sort: "dueDate-asc",
                  })
                }
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getPaginatedOutputs().map((output) => (
            <ParticipantOutputCard
              key={output._id}
              output={output}
              compact={true}
              onSubmit={() => openSubmissionDialog(output)}
              onUpdateSubmission={() => openSubmissionDialog(output, true)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {getPaginatedOutputs().map((output) => (
            <ParticipantOutputCard
              key={output._id}
              output={output}
              compact={false}
              onSubmit={() => openSubmissionDialog(output)}
              onUpdateSubmission={() => openSubmissionDialog(output, true)}
            />
          ))}
        </div>
      )}
      <Pagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredOutputs.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
      />
      {/* Submission Dialog */}
      <SubmissionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        output={selectedOutput}
        onSubmit={handleSubmission}
      />
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div
      className={`p-4 rounded-xl ${color} flex items-center justify-between`}
    >
      <div>
        <p className="text-sm font-medium text-tacir-darkgray">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="p-2 bg-white/30 rounded-full">{icon}</div>
    </div>
  );
};
export default ParticipantOutputsPage;
