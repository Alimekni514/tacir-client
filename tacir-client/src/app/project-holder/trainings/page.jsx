"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getTrainings } from "@/services/trainings/training";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "@/components/common/CustomPagination";
import InteractiveCalendar from "@/features/trainings/components/InteractiveCalendar";
import { TrainingStatsCard } from "@/features/trainings/components/TrainingStatsCard";
import TrainingDetailsModal from "@/features/trainings/components/TrainingDetailsModal";
import { typeConfig } from "@/features/trainings/components/style.config";
import { apiClient } from "@/hooks/apiClient";
import { apiBaseUrl } from "@/utils/constants";
import TrainingFiltersProjectHolder from "@/features/trainings/components/TrainingFiltersProjectHolder";
import MentoringPresenceModal from "@/features/trainings/modals/MentoringPresenceModal";

 const getTrainerNames = (trainers) => {
  if (!trainers || trainers.length === 0) return "Non spécifié";
  return trainers
    .map((t) => t.personalInfo?.fullName || "Formateur inconnu")
    .join(", ");
};

// Define training types for filtering
const TRAINING_TYPES = [
  { value: "all", label: "Tous les types" },
  { value: "formation", label: "Formations" },
  { value: "bootcamp", label: "Bootcamps" },
  { value: "mentoring", label: "Sessions de mentorat" },
];

export default function ProjectHolderTrainingsPage() {
  const [activeTab, setActiveTab] = useState("trainings");
  const [trainingSubTab, setTrainingSubTab] = useState("upcoming");
  const [allTrainings, setAllTrainings] = useState([]);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [displayedTrainings, setDisplayedTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    formation: 0,
    bootcamp: 0,
    mentoring: 0,
    upcoming: 0,
    past: 0,
  });
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [userRegion, setUserRegion] = useState(null);
  const [regionLoading, setRegionLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mentoringModalOpen, setMentoringModalOpen] = useState(false);
  const [selectedMentoring, setSelectedMentoring] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const matchesUserRegion = (cohort) => {
    if (!userRegion || !cohort) return false;

    const expectedCohortFormat = `${userRegion.name} / ${userRegion.arabicName}`;
    return cohort.toLowerCase() === expectedCohortFormat.toLowerCase();
  };

  const fetchUserRegion = async () => {
    try {
      setRegionLoading(true);
      const response = await apiClient(
        `${apiBaseUrl}/accepted-participants/me`
      );

      if (response.data?.region) {
        setUserRegion({
          _id: response.data.region._id,
          name: response.data.region.name.fr.toLowerCase(),
          arabicName: response.data.region.name.ar,
        });
      } else {
        throw new Error("No region assigned");
      }
    } catch (err) {
      console.error("Region fetch error:", err);
      setError("Failed to load region information");
      toast.error("Erreur lors du chargement de votre région");
    } finally {
      setRegionLoading(false);
    }
  };

  const filterTrainingsByRegion = (trainings) => {
    if (!userRegion) return [];
    return trainings.filter(
      (training) =>
        training.cohorts &&
        training.cohorts.some((cohort) => matchesUserRegion(cohort))
    );
  };

  const applyFilters = (trainings) => {
    const now = new Date();
    return trainings.filter((training) => {
      // Filtre par date
      const trainingDate = new Date(training.startDate);
      if (trainingSubTab === "upcoming" && trainingDate < now) return false;
      if (trainingSubTab === "past" && trainingDate >= now) return false;

      // Type filter
      if (filters.type !== "all" && training.type !== filters.type) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = training.title
          ?.toLowerCase()
          .includes(searchLower);
        const matchesDescription = training.description
          ?.toLowerCase()
          .includes(searchLower);
        const matchesLocation = training.location
          ?.toLowerCase()
          .includes(searchLower);
        const matchesTrainer = getTrainerNames(training.trainers)
          .toLowerCase()
          .includes(searchLower);

        if (
          !(
            matchesTitle ||
            matchesDescription ||
            matchesLocation ||
            matchesTrainer
          )
        ) {
          return false;
        }
      }

      return true;
    });
  };

  const fetchTrainingsData = async () => {
    try {
      setLoading(true);
      const response = await getTrainings({
        status: "approved",
        limit: 1000,
      });

      const regionTrainings = filterTrainingsByRegion(response.data || []);
      setAllTrainings(regionTrainings);

      // Calcul des stats avec séparation upcoming/past
      const now = new Date();
      const upcomingTrainings = regionTrainings.filter(
        (t) => new Date(t.startDate) >= now
      );
      const pastTrainings = regionTrainings.filter(
        (t) => new Date(t.startDate) < now
      );

      setStats({
        total: regionTrainings.length,
        formation: regionTrainings.filter((t) => t.type === "formation").length,
        bootcamp: regionTrainings.filter((t) => t.type === "bootcamp").length,
        mentoring: regionTrainings.filter((t) => t.type === "mentoring").length,
        upcoming: upcomingTrainings.length,
        past: pastTrainings.length,
      });
    } catch (err) {
      console.error("Trainings fetch error:", err);
      setError("Failed to load trainings");
      toast.error("Erreur lors du chargement des formations");
      setAllTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const response = await getTrainings({
        status: "approved",
        limit: 1000,
      });

      setCalendarEvents(filterTrainingsByRegion(response.data || []));
    } catch (err) {
      console.error("Calendar events error:", err);
      setCalendarEvents([]);
    }
  };

  useEffect(() => {
    fetchUserRegion();
  }, []);

  useEffect(() => {
    if (userRegion) {
      fetchTrainingsData();
      if (activeTab === "calendar") {
        fetchCalendarEvents();
      }
    }
  }, [userRegion, activeTab]);

  // Appliquer les filtres et la pagination
  useEffect(() => {
    if (!userRegion) return;

    // Appliquer les filtres
    const filtered = applyFilters(allTrainings);
    setFilteredTrainings(filtered);

    // Calculer la pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / pagination.limit);

    setPagination((prev) => ({
      ...prev,
      page: 1,
      total,
      totalPages,
    }));
  }, [allTrainings, filters, userRegion, trainingSubTab]);

  // Mettre à jour les formations affichées
  useEffect(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    setDisplayedTrainings(filteredTrainings.slice(start, end));
  }, [filteredTrainings, pagination.page, pagination.limit]);

  // Réinitialiser la pagination lors du changement d'onglet
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [trainingSubTab]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  // Update handleViewDetails function
  const handleViewDetails = (training) => {
    // For online mentoring, open the special modal
    if (training.type === "mentoring" && training.sessionType === "online") {
      setSelectedMentoring(training);
      setMentoringModalOpen(true);
    }
    // For other types, use the regular modal
    else {
      setSelectedTraining(training);
      setDetailsModalOpen(true);
    }
  };

  if (regionLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-tacir-blue" />
      </div>
    );
  }

  if (error || !userRegion) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h3 className="font-medium">Erreur</h3>
            <p className="text-sm">
              {error ||
                "Vous n'êtes pas associé à une région. Veuillez contacter l'administrateur."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row py-6 items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r bg-tacir-blue shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-tacir-darkblue">
              Mes Formations
            </h1>
            <p className="text-sm text-tacir-darkgray">
              Consultez vos formations, bootcamps et sessions de mentorat
            </p>
          </div>
        </div>
        <div className="ml-auto bg-tacir-lightblue px-4 py-2 rounded-lg">
          <p className="text-sm font-medium text-tacir-darkblue">
            Région:{" "}
            {userRegion.name.charAt(0).toUpperCase() + userRegion.name.slice(1)}
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mt-4"
      >
        <TabsList className="flex w-full bg-white shadow-sm rounded-lg border border-tacir-lightgray">
          <TabsTrigger
            value="trainings"
            className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white"
          >
            Liste
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white"
          >
            Calendrier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trainings" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TrainingStatsCard
              title="Total"
              value={stats.total}
              icon={BookOpen}
              color="tacir-blue"
              borderColor="tacir-blue"
            />
            <TrainingStatsCard
              title="Formations"
              value={stats.formation}
              icon={BookOpen}
              color="tacir-blue"
              borderColor="tacir-blue"
            />
            <TrainingStatsCard
              title="Bootcamps"
              value={stats.bootcamp}
              icon={BookOpen}
              color="tacir-yellow"
              borderColor="tacir-yellow"
            />
            <TrainingStatsCard
              title="Mentorat"
              value={stats.mentoring}
              icon={BookOpen}
              color="tacir-green"
              borderColor="tacir-green"
            />
          </div>

          <TrainingFiltersProjectHolder
            filters={filters}
            setFilters={setFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            showStatusFilter={false}
            showCohortFilter={false}
            trainingTypes={TRAINING_TYPES}
          />

          {/* Nouveaux onglets pour formations à venir/passées */}
          <Tabs
            value={trainingSubTab}
            onValueChange={setTrainingSubTab}
            className="w-full"
          >
            <TabsList className="flex w-full bg-white shadow-sm rounded-lg border border-tacir-lightgray">
              <TabsTrigger
                value="upcoming"
                className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white"
              >
                Formations à venir
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white"
              >
                Formations passées
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {displayedTrainings.length === 0 ? (
              <Card className="p-6 text-center border-tacir-lightblue">
                <p className="text-tacir-darkgray">
                  {trainingSubTab === "upcoming"
                    ? "Aucune formation à venir ne correspond à vos critères"
                    : "Aucune formation passée ne correspond à vos critères"}
                </p>
              </Card>
            ) : (
              displayedTrainings.map((training) => (
                <Card
                  key={training._id}
                  className={`p-6 border-l-4 ${
                    typeConfig[training.type]?.borderColor ||
                    "border-tacir-lightblue"
                  } hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => handleViewDetails(training)}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-semibold text-tacir-darkblue">
                        {training.title}
                      </h2>
                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            typeConfig[training.type]?.bgColor ||
                            "bg-tacir-darkblue"
                          } text-white`}
                        >
                          {typeConfig[training.type]?.title || training.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-tacir-darkgray">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-tacir-blue" />
                        {formatDate(training.startDate)} • {training.time}
                      </div>
                      {training.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-tacir-blue" />
                          {training.location}
                        </div>
                      )}
                    </div>

                    {training.description && (
                      <p className="text-sm text-tacir-darkgray line-clamp-2">
                        {training.description}
                      </p>
                    )}

                    <div className="text-sm text-tacir-darkgray">
                      <p>
                        <span className="font-medium text-tacir-darkblue">
                          Formateur:
                        </span>{" "}
                        {getTrainerNames(training.trainers)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {filteredTrainings.length > 0 && (
            <Pagination
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6 mt-6">
          <Card className="p-6 shadow rounded-lg bg-white border border-tacir-lightgray">
            <InteractiveCalendar
              events={calendarEvents}
              eventColors={{
                formation: typeConfig.formation.bgColor,
                bootcamp: typeConfig.bootcamp.bgColor,
                mentoring: typeConfig.mentoring.bgColor,
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>
      {/* Special modal for online mentoring */}
      <MentoringPresenceModal
        open={mentoringModalOpen}
        onOpenChange={setMentoringModalOpen}
        training={selectedMentoring}
      />

      {/* <TrainingDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        training={selectedTraining}
      /> */}
    </div>
  );
}
