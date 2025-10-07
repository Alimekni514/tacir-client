"use client";
import React, { useState, useEffect, useCallback } from "react";
import { typeConfig } from "@/features/trainings/components/style.config";
import {
  calculateTrainingStats,
  displayText,
  getPhoneNumber,
  getBirthDate,
  getProjectTitle,
} from "@/features/participants/participantDataUtils";
import { Search } from "lucide-react";
import { getParticipantsForMentor } from "@/services/trainings/trainingTracking";
import { getMentorTrainings } from "@/services/trainings/training";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, X } from "lucide-react";
// Components
import DashboardHeader from "@/features/participants/DashboardHeader";
import StatsOverview from "@/features/participants/StatsOverview";
import ParticipantDetailModal from "@/features/participants/ParticipantDetailModal";
import LoadingState from "@/features/participants/LoadingState";
import EmptyState from "@/features/participants/EmptyState";
import Pagination from "@/components/common/CustomPagination";

const ParticipantsDashboard = () => {
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [trainings, setTrainings] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    byType: {},
    byStatus: { active: 0, upcoming: 0, completed: 0 },
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const fetchTrainings = async () => {
    try {
      const response = await getMentorTrainings();
      setTrainings(response.data || []);
      if (response.data?.length > 0) {
        setSelectedTraining(response.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching trainings:", error);
    }
  };

  const fetchParticipants = useCallback(async () => {
    if (!selectedTraining) return;

    setLoading(true);
    try {
      const params = {
        trainingId: selectedTraining,
        search: debouncedSearchTerm,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await getParticipantsForMentor(params);
      const allParticipants =
        response.data?.flatMap((group) => group.participants) || [];

      setParticipants(allParticipants);
      setStats(calculateTrainingStats(allParticipants));
      setPagination(
        response.pagination || {
          total: allParticipants.length,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil(allParticipants.length / params.limit),
        }
      );
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  }, [
    selectedTraining,
    debouncedSearchTerm,
    sortConfig,
    pagination.page,
    pagination.limit,
  ]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleExportData = () => {
    const csvData = participants.map((participant) => ({
      Name: `${participant.user?.firstName || ""} ${
        participant.user?.lastName || ""
      }`,
      Email: participant.user?.email || "",
      Phone: getPhoneNumber(participant),
      Region: displayText(participant.region?.name),
      ProjectTitle: getProjectTitle(participant),
      BirthDate: getBirthDate(participant),
      JoinedDate: new Date(participant.createdAt).toLocaleDateString(),
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers
          .map(
            (header) =>
              `"${(row[header] || "").toString().replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `participants_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const TrainingFilter = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Training Select */}
        <div>
          <label className="block text-sm font-medium text-tacir-darkblue mb-2">
            Sélectionnez une formation
          </label>
          <Select
            value={selectedTraining}
            onValueChange={(value) => {
              setSelectedTraining(value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            <SelectTrigger className="w-full !h-13 px-4  border border-gray-300 rounded-lg hover:border-tacir-lightblue focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-colors">
              <SelectValue placeholder="Sélectionnez une formation" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {trainings.map((training) => {
                const type = typeConfig[training.type];
                const Icon = type?.icon || GraduationCap;
                return (
                  <SelectItem
                    key={training._id}
                    value={training._id}
                    className="focus:bg-tacir-lightblue/10 data-[state=checked]:bg-tacir-lightblue/10"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${type?.textColor}`} />
                      <span className="truncate flex-1">{training.title}</span>
                      <span
                        className={`ml-2 text-xs px-2 py-1 rounded-full ${type?.lightBg} ${type?.textColor} whitespace-nowrap`}
                      >
                        {type?.title || training.type}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Search Input with Debouncing */}
        <div>
          <label className="block text-sm font-medium text-tacir-darkblue mb-2">
            Rechercher des participants
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg hover:border-tacir-lightblue focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-tacir-pink transition-colors" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const TableHeader = ({ label, sortKey }) => (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium text-tacir-darkblue uppercase tracking-wider cursor-pointer hover:bg-tacir-lightblue/10"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center">
        {label}
        {sortConfig.key === sortKey && (
          <span className="ml-1">
            {sortConfig.direction === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );

  const ParticipantRow = ({ participant }) => (
    <tr className="hover:bg-tacir-lightblue/5 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-tacir-lightblue/10 flex items-center justify-center">
            <span className="text-tacir-lightblue font-medium">
              {participant.user?.firstName?.charAt(0)}
              {participant.user?.lastName?.charAt(0)}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-tacir-darkblue">
              {participant.user?.firstName} {participant.user?.lastName}
            </div>
            <div className="text-sm text-tacir-darkgray">
              {getBirthDate(participant)}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-tacir-darkblue">
          {participant.user?.email}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-tacir-darkblue">
          {getPhoneNumber(participant)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-tacir-lightblue/10 text-tacir-darkblue">
          {displayText(participant.region?.name)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-tacir-darkgray">
        {new Date(participant.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-tacir-darkblue line-clamp-1">
          {getProjectTitle(participant)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => setSelectedParticipant(participant)}
          className="text-tacir-lightblue hover:text-tacir-blue hover:underline"
        >
          Détails
        </button>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-tacir-lightgray p-4 sm:p-6">
      <DashboardHeader
        title={`Participants - ${
          trainings.find((t) => t._id === selectedTraining)?.title || ""
        }`}
        description="Gérer les participants de la formation sélectionnée"
        onExport={handleExportData}
        exportDisabled={participants.length === 0}
      />

      <TrainingFilter />

      {loading ? (
        <LoadingState />
      ) : participants.length === 0 ? (
        <EmptyState
          title="Aucun participant trouvé"
          description={
            debouncedSearchTerm
              ? "Aucun participant ne correspond à votre recherche"
              : "Cette formation n'a pas encore de participants"
          }
        />
      ) : (
        <>
          <StatsOverview stats={stats} />

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-tacir-lightblue/5">
                  <tr>
                    <TableHeader label="Nom" sortKey="firstName" />
                    <TableHeader label="Email" sortKey="email" />
                    <TableHeader label="Téléphone" sortKey="phone" />
                    <th className="px-6 py-3 text-left text-xs font-medium text-tacir-darkblue uppercase tracking-wider">
                      Région
                    </th>
                    <TableHeader
                      label="Date d'inscription"
                      sortKey="createdAt"
                    />
                    <th className="px-6 py-3 text-left text-xs font-medium text-tacir-darkblue uppercase tracking-wider">
                      Projet
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-tacir-darkblue uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {participants.map((participant) => (
                    <ParticipantRow
                      key={participant._id}
                      participant={participant}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <Pagination
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              entityName="participants"
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        </>
      )}

      {selectedParticipant && (
        <ParticipantDetailModal
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </div>
  );
};

export default ParticipantsDashboard;
