"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  FileText,
  Users,
  Calendar,
  UserMinus,
  Download,
  BarChart2,
  BookOpen,
  UserCheck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/utils/date";
import { TrainingStats } from "@/features/training-tracking/TrainingStats";
import { ParticipantList } from "@/features/training-tracking/ParticipantList";
import { SessionCalendar } from "@/features/training-tracking/SessionCalendar";
import { OutputManagement } from "@/features/training-tracking/OutputManagement";
import { AttendanceTracker } from "@/features/training-tracking/AttendanceTracker";
import { getTrainingTrackingData } from "@/services/trainings/trainingTracking";
import { getApprovedTrainings } from "@/services/trainings/trainingTracking";
import TrainingTrackingFilters from "@/features/trainings/components/TrainingTrackingFilters";
import { ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/hooks/apiClient";
import { apiBaseUrl } from "@/utils/constants";
import EliminationModal from "@/features/trainings/modals/EliminatioonModal";

const TrainingCoordinatorDashboard = () => {
  const router = useRouter();

  // State declarations
  const [trainings, setTrainings] = useState({
    upcoming: [],
    active: [],
    past: [],
  });
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingDataLoading, setTrackingDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showFilters, setShowFilters] = useState(false);
  const [showEliminationModal, setShowEliminationModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    cohorts: "all",
  });
  const [participantsData, setParticipantsData] = useState({
    participants: [],
    trainings: [],
    attendance: [],
  });
  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedRegionName, setSelectedRegionName] = useState("");
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setRegionsLoading(true);
        console.log("[fetchRegions] Fetching regions from:", `${apiBaseUrl}/regions/`);
        const response = await apiClient(`${apiBaseUrl}/regions/`);
        console.log("[fetchRegions] Regions response:", JSON.stringify(response, null, 2));

        if (Array.isArray(response)) {
          setRegions(response);
          console.log("[fetchRegions] Set regions:", response);
          if (response.length > 0) {
            const firstRegion = response[0];
            const regionName = firstRegion.name?.fr || firstRegion.name?.ar || "N/A";
            setSelectedRegionId(firstRegion._id);
            setSelectedRegionName(regionName);
            console.log(`[fetchRegions] Set default region: ID=${firstRegion._id}, Name=${regionName}`);
          } else {
            console.warn("[fetchRegions] No regions found in response");
            setError("No regions available");
          }
        } else {
          console.error("[fetchRegions] Response is not an array:", response);
          setError("Failed to fetch regions: Invalid response format");
        }
      } catch (error) {
        console.error("[fetchRegions] Error fetching regions:", error.message, {
          stack: error.stack,
        });
        setError("Error fetching regions");
      } finally {
        setRegionsLoading(false);
      }
    };

    fetchRegions();
  }, []);

  // Fetch participants and attendance data when region changes
  useEffect(() => {
    if (!selectedRegionId) {
      console.log("[fetchParticipantsAttendance] No selectedRegionId, skipping fetch");
      return;
    }

    const fetchParticipantsAttendance = async () => {
      try {
        setAttendanceLoading(true);
        setError(null);
        console.log(
          "[fetchParticipantsAttendance] Fetching attendance for regionId:",
          selectedRegionId
        );
        const response = await apiClient(
          `${apiBaseUrl}/trainingsTracking/${selectedRegionId}/attendancebyregion`
        );
        console.log("[fetchParticipantsAttendance] Attendance response:", JSON.stringify(response, null, 2));

        if (response.success) {
          setParticipantsData(response.data);
          console.log("[fetchParticipantsAttendance] Set participantsData:", JSON.stringify(response.data, null, 2));
        } else {
          console.error("[fetchParticipantsAttendance] Failed to fetch attendance:", response.message);
          setError(response.message || "Failed to fetch attendance data");
          setParticipantsData({ participants: [], trainings: [], attendance: [] });
        }
      } catch (error) {
        console.error("[fetchParticipantsAttendance] Error fetching attendance:", error.message, {
          stack: error.stack,
        });
        setError("Error fetching attendance data");
        setParticipantsData({ participants: [], trainings: [], attendance: [] });
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchParticipantsAttendance();
  }, [selectedRegionId]);

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      search: "",
      type: "all",
      status: "all",
      cohorts: "all",
    });
  };

  // Fetch all trainings with filters
  useEffect(() => {
    const fetchApprovedTrainings = async () => {
      try {
        setLoading(true);
        const params = {
          type: filters.type === "all" ? undefined : filters.type,
          cohorts: filters.cohorts === "all" ? undefined : filters.cohorts,
          search: filters.search || undefined,
          status: filters.status === "all" ? undefined : filters.status,
        };

        const response = await getApprovedTrainings(params);
        setTrainings(response.data || { upcoming: [], active: [], past: [] });

        const firstTraining =
          response.data?.active?.length > 0
            ? response.data.active[0]._id
            : response.data?.upcoming?.length > 0
            ? response.data.upcoming[0]._id
            : response.data?.past?.length > 0
            ? response.data.past[0]._id
            : null;

        setSelectedTraining(firstTraining);
      } catch (error) {
        console.error("Failed to fetch approved trainings:", error);
        setError("Failed to fetch trainings");
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedTrainings();
  }, [filters]);

  // Fetch tracking data when selected training changes
  useEffect(() => {
    if (!selectedTraining) {
      setTrackingData({
        training: null,
        participants: [],
        sessions: [],
        outputs: { trainingOutputs: [], participantOutputs: [] },
        attendance: [],
        stats: {
          totalParticipants: 0,
          attendanceRate: 0,
          outputsCompleted: 0,
          outputsPending: 0,
          outputsOverdue: 0,
          sessionsCompleted: 0,
          totalSessions: 0,
          sessionCompletionRate: 0,
          outputCompletionRate: 0,
        },
      });
      return;
    }

    const fetchTrainingTrackingData = async () => {
      try {
        setTrackingDataLoading(true);
        const response = await getTrainingTrackingData(selectedTraining);

        if (response.success) {
          setTrackingData(response.data);
        } else {
          setError(response.message || "Failed to fetch tracking data");
        }
      } catch (error) {
        console.error("Failed to fetch training tracking data:", error);
        setError("Error fetching training tracking data");
      } finally {
        setTrackingDataLoading(false);
      }
    };

    fetchTrainingTrackingData();
  }, [selectedTraining]);

  // Training tracking data state
  const [trackingData, setTrackingData] = useState({
    training: null,
    participants: [],
    sessions: [],
    outputs: {
      trainingOutputs: [],
      participantOutputs: [],
    },
    attendance: [],
    stats: {
      totalParticipants: 0,
      attendanceRate: 0,
      outputsCompleted: 0,
      outputsPending: 0,
      outputsOverdue: 0,
      sessionsCompleted: 0,
      totalSessions: 0,
      sessionCompletionRate: 0,
      outputCompletionRate: 0,
    },
  });

  // Get unique cohorts
  const getUniqueCohorts = useMemo(() => {
    const cohortSet = new Set();
    [...trainings.upcoming, ...trainings.active, ...trainings.past].forEach(
      (training) => {
        training.cohorts?.forEach((cohort) => cohortSet.add(cohort));
      }
    );
    return Array.from(cohortSet).map((cohort) => ({
      value: cohort,
      label: cohort,
    }));
  }, [trainings.upcoming, trainings.active, trainings.past]);

  // Generate report
  const handleGenerateReport = async () => {
    if (!selectedTraining || !trackingData.training) return;
    try {
      await Promise.resolve(); // Placeholder for generateTrainingReport
      console.log("Report generation placeholder");
    } catch (error) {
      console.error("Failed to generate report:", error);
      setError("Failed to generate report");
    }
  };

  // Handle training selection
  const handleTrainingSelect = (trainingId) => {
    setSelectedTraining(trainingId);
    setActiveTab("overview");
  };

  // Handle participant elimination
  const handleEliminate = (participantId) => {
    console.log(`Eliminating participant with ID: ${participantId}`);
    // In real implementation, call API to eliminate participant
  };

  // Handle region selection
  const handleRegionChange = (value) => {
    console.log("[handleRegionChange] Region selected with value:", value);
    const selectedRegion = regions.find((region) => region._id === value);
    if (selectedRegion) {
      const regionName = selectedRegion.name?.fr || selectedRegion.name?.ar || "N/A";
      console.log(
        `[handleRegionChange] Found region: ID=${value}, Name=${regionName}, Full region object:`,
        JSON.stringify(selectedRegion, null, 2)
      );
      setSelectedRegionId(value);
      setSelectedRegionName(regionName);
    } else {
      console.warn("[handleRegionChange] No region found for ID:", value);
      setSelectedRegionId(value);
      setSelectedRegionName("N/A");
    }
  };

  // Elimination threshold
  const eliminationThreshold = 3;

  if (loading && !selectedTraining) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tacir-blue"></div>
      </div>
    );
  }

  const allTrainingsList = [
    ...trainings.active.map((t) => ({ ...t, status: "active" })),
    ...trainings.upcoming.map((t) => ({ ...t, status: "upcoming" })),
    ...trainings.past.map((t) => ({ ...t, status: "completed" })),
  ];

  return (
    <div className="min-h-screen mx-4 sm:p-6 bg-tacir-lightgray/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-tacir-lightgray">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-tacir-blue shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-tacir-darkblue">Suivi des formations</h2>
            <p className="text-tacir-darkgray">
              Suivre et gérer tous les programmes de formation et les données
              associées
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            onClick={handleGenerateReport}
            disabled={!selectedTraining || !trackingData.training}
            className="bg-tacir-blue hover:bg-tacir-blue/90 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Générer Rapport
          </Button>
          <Button
            onClick={() => setShowEliminationModal(true)}
            disabled={attendanceLoading || !selectedRegionId}
            className="bg-tacir-pink hover:bg-tacir-pink/90 text-white"
          >
            <UserMinus className="w-4 h-4 mr-2" />
            Élimination
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-xl">{error}</div>
      )}

      {/* Elimination Modal */}
      <EliminationModal
        showEliminationModal={showEliminationModal}
        setShowEliminationModal={setShowEliminationModal}
        selectedRegionName={selectedRegionName}
        attendanceLoading={attendanceLoading}
        participantsData={participantsData}
        eliminationThreshold={eliminationThreshold}
        handleEliminate={handleEliminate}
        regions={regions}
        selectedRegionId={selectedRegionId}
        regionsLoading={regionsLoading}
        handleRegionChange={handleRegionChange}
      />

      {/* Filters */}
      <TrainingTrackingFilters
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        cohorts={getUniqueCohorts}
        resetFilters={resetFilters}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Trainings List */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-tacir-lightgray">
            <CardHeader className="bg-tacir-lightgray/30 border-b border-tacir-lightgray">
              <CardTitle className="flex items-center gap-2 text-tacir-darkblue">
                <BookOpen className="w-5 h-5 text-tacir-blue" />
                Formations
              </CardTitle>
              <CardDescription className="text-tacir-darkgray">
                {allTrainingsList.length} programme
                {allTrainingsList.length !== 1 ? "s" : ""} de formation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {allTrainingsList.map((training) => (
                  <div
                    key={training._id}
                    className={`p-4 border-b border-tacir-lightgray cursor-pointer transition-colors hover:bg-tacir-lightgray/30 ${
                      selectedTraining === training._id ? "bg-tacir-blue/10 border-tacir-blue" : ""
                    }`}
                    onClick={() => handleTrainingSelect(training._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm text-tacir-darkblue">{training.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={training.status}
                            className="text-xs"
                            style={{
                              backgroundColor:
                                training.status === "active"
                                  ? "#56A632"
                                  : training.status === "upcoming"
                                  ? "#F29F05"
                                  : "#BF1573",
                              color: "white",
                            }}
                          >
                            {training.status === "active"
                              ? "En cours"
                              : training.status === "upcoming"
                              ? "À venir"
                              : "Terminé"}
                          </Badge>
                          <span className="text-xs text-tacir-darkgray">
                            {formatDate(training.startDate)} - {formatDate(training.endDate)}
                          </span>
                        </div>
                        {training.cohorts && training.cohorts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {training.cohorts.slice(0, 2).map((cohort, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs border-tacir-blue text-tacir-blue"
                              >
                                {cohort}
                              </Badge>
                            ))}
                            {training.cohorts.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs border-tacir-blue text-tacir-blue"
                              >
                                +{training.cohorts.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-tacir-darkgray" />
                    </div>
                  </div>
                ))}
                {allTrainingsList.length === 0 && (
                  <div className="p-4 text-center text-tacir-darkgray">
                    Aucune formation trouvée correspondant à vos filtres
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training Details */}
        {selectedTraining && trackingData.training ? (
          <div className="lg:col-span-3 space-y-4">
            <Card className="border-tacir-lightgray">
              <CardHeader className="border-b border-tacir-lightgray">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-tacir-darkblue">{trackingData.training.title}</CardTitle>
                    <Badge
                      className={`mt-2 text-white ${
                        trackingData.training.type === "formation"
                          ? "bg-tacir-blue"
                          : trackingData.training.type === "bootcamp"
                          ? "bg-green-600"
                          : trackingData.training.type === "mentoring"
                          ? "bg-purple-600"
                          : "bg-gray-500"
                      }`}
                    >
                      {trackingData.training.type
                        ? trackingData.training.type.charAt(0).toUpperCase() + trackingData.training.type.slice(1)
                        : "Unknown"}
                    </Badge>
                    <CardDescription className="flex items-center gap-2 mt-1 text-tacir-darkgray">
                      <span>
                        {formatDate(trackingData.training.startDate)} - {formatDate(trackingData.training.endDate)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-4">
                    <Badge
                      style={{
                        backgroundColor:
                          trackingData.training.progress?.status === "active"
                            ? "#56A632"
                            : trackingData.training.progress?.status === "upcoming"
                            ? "#F29F05"
                            : "#BF1573",
                        color: "white",
                      }}
                    >
                      {trackingData.training.progress?.status === "active"
                        ? "En cours"
                        : trackingData.training.progress?.status === "upcoming"
                        ? "À venir"
                        : "Terminé"}
                    </Badge>
                    {trackingData.training.progress && (
                      <span className="text-xs text-tacir-darkgray">{trackingData.training.progress.percentage}% complété</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {trackingDataLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-8 border-t-2 border-b-2 border-tacir-blue"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <TrainingStats
                      icon={<Users className="w-5 h-5 text-tacir-blue" />}
                      title="Participants"
                      value={trackingData.stats.totalParticipants}
                    />
                    <TrainingStats
                      icon={<UserCheck className="w-5 h-5 text-tacir-green" />}
                      title="Présence"
                      value={`${trackingData.stats.attendanceRate}%`}
                    />
                    <TrainingStats
                      icon={<FileText className="w-5 h-5 text-tacir-lightblue" />}
                      title="Livrables"
                      value={`${trackingData.outputs.trainingOutputs.length} (${trackingData.stats.outputsCompleted} terminés)`}
                    />
                    <TrainingStats
                      icon={<Calendar className="w-5 h-5 text-tacir-yellow" />}
                      title="Sessions"
                      value={`${trackingData.stats.totalSessions} (${trackingData.stats.sessionsCompleted} terminées)`}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 border-2 bg-white">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-tacir-blue data-[state=active]:text-white"
                >
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Aperçu
                </TabsTrigger>
                <TabsTrigger
                  value="participants"
                  className="data-[state=active]:bg-tacir-blue data-[state=active]:text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Participants
                </TabsTrigger>
                <TabsTrigger
                  value="sessions"
                  className="data-[state=active]:bg-tacir-blue data-[state=active]:text-white"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger
                  value="outputs"
                  className="data-[state=active]:bg-tacir-blue data-[state=active]:text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Livrables
                </TabsTrigger>
                <TabsTrigger
                  value="attendance"
                  className="data-[state=active]:bg-tacir-blue data-[state=active]:text-white"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Présence
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card className="border-tacir-lightgray">
                  <CardHeader>
                    <CardTitle className="text-tacir-darkblue">Progression de la formation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-tacir-darkblue">Progression générale</span>
                          <span className="text-sm text-tacir-darkgray">{trackingData.training.progress?.percentage || 0}%</span>
                        </div>
                        <Progress
                          value={trackingData.training.progress?.percentage || 0}
                          className="h-2 bg-tacir-lightgray"
                          indicatorClassName="bg-tacir-blue"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-tacir-darkblue">Taux de présence</span>
                          <span className="text-sm text-tacir-darkgray">{trackingData.stats.attendanceRate}%</span>
                        </div>
                        <Progress
                          value={trackingData.stats.attendanceRate}
                          className="h-2 bg-tacir-lightgray"
                          indicatorClassName="bg-tacir-green"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-tacir-darkblue">Sessions terminées</span>
                          <span className="text-sm text-tacir-darkgray">{trackingData.stats.sessionCompletionRate}%</span>
                        </div>
                        <Progress
                          value={trackingData.stats.sessionCompletionRate}
                          className="h-2 bg-tacir-lightgray"
                          indicatorClassName="bg-tacir-yellow"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-tacir-darkblue">Livrables terminés</span>
                          <span className="text-sm text-tacir-darkgray">{trackingData.stats.outputCompletionRate}%</span>
                        </div>
                        <Progress
                          value={trackingData.stats.outputCompletionRate}
                          className="h-2 bg-tacir-lightgray"
                          indicatorClassName="bg-tacir-lightblue"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-tacir-lightgray">
                    <CardHeader>
                      <CardTitle className="text-tacir-darkblue">Sessions récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader className="bg-tacir-lightgray/30">
                          <TableRow>
                            <TableHead className="text-tacir-darkblue">Date</TableHead>
                            <TableHead className="text-tacir-darkblue">Participant</TableHead>
                            <TableHead className="text-tacir-darkblue">Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trackingData.sessions.slice(0, 5).map((session) => (
                            <TableRow key={session._id}>
                              <TableCell className="text-tacir-darkblue">{formatDate(session.date)}</TableCell>
                              <TableCell className="text-tacir-darkblue">{session.participantName}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    session.attendance === "present"
                                      ? "bg-tacir-green text-white"
                                      : "bg-tacir-pink text-white"
                                  }
                                >
                                  {session.attendance === "present" ? "Présent" : "Absent"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card className="border-tacir-lightgray">
                    <CardHeader>
                      <CardTitle className="text-tacir-darkblue">Livrables récents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader className="bg-tacir-lightgray/30">
                          <TableRow>
                            <TableHead className="text-tacir-darkblue">Livrable</TableHead>
                            <TableHead className="text-tacir-darkblue">Échéance</TableHead>
                            <TableHead className="text-tacir-darkblue">Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trackingData.outputs.trainingOutputs.slice(0, 5).map((output) => (
                            <TableRow key={output._id}>
                              <TableCell className="text-tacir-darkblue">{output.title}</TableCell>
                              <TableCell className="text-tacir-darkblue">{formatDate(output.dueDate)}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    output.status === "published"
                                      ? "bg-tacir-green text-white"
                                      : output.status === "draft"
                                      ? "bg-tacir-yellow text-white"
                                      : output.status === "archived"
                                      ? "bg-tacir-pink text-white"
                                      : "bg-tacir-lightblue text-white"
                                  }
                                >
                                  {output.status === "published"
                                    ? "Publié"
                                    : output.status === "draft"
                                    ? "Brouillon"
                                    : output.status === "archived"
                                    ? "Archivé"
                                    : output.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="participants">
                <ParticipantList participants={trackingData.participants} attendance={trackingData.attendance} />
              </TabsContent>

              <TabsContent value="sessions">
                <SessionCalendar sessions={trackingData.sessions} training={trackingData.training} />
              </TabsContent>

              <TabsContent value="outputs">
                <OutputManagement
                  outputs={trackingData.outputs.trainingOutputs}
                  participantOutputs={trackingData.outputs.participantOutputs}
                  trainingId={selectedTraining}
                />
              </TabsContent>

              <TabsContent value="attendance">
                <AttendanceTracker
                  attendance={trackingData.attendance}
                  sessions={trackingData.sessions}
                  participants={trackingData.participants}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : selectedTraining ? (
          <div className="lg:col-span-3 flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tacir-blue"></div>
          </div>
        ) : (
          <div className="lg:col-span-3 flex items-center justify-center h-64">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto text-tacir-lightgray" />
              <h3 className="mt-2 text-lg font-medium text-tacir-darkblue">Aucune formation sélectionnée</h3>
              <p className="mt-1 text-tacir-darkgray">
                Sélectionnez une formation dans la liste pour voir les détails
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingCoordinatorDashboard;