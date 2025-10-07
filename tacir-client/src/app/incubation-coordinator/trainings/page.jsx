"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  approveTrainingRequest,
  rejectTrainingRequest,
} from "@/services/trainings/training";
import { getStatusBadge } from "@/features/trainings/components/style.config";
import {
  Check,
  X,
  ChevronLeft,
  Clock,
  Calendar,
  MapPin,
  BookOpen,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getTrainings } from "@/services/trainings/training";
import Loader from "@/components/ui/Loader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "@/components/common/CustomPagination";
import InteractiveCalendar from "@/features/trainings/components/InteractiveCalendar";
import { ApprovalModal } from "@/features/trainings/modals/ApprovalModal";
import { RejectionModal } from "@/features/trainings/modals/RejectionModal";
import TrainingFilters from "@/features/trainings/components/TrainingFilters";
import { TrainingStatsCard } from "@/features/trainings/components/TrainingStatsCard";
import TrainingDetailsModal from "@/features/trainings/components/TrainingDetailsModal";
import { typeConfig } from "@/features/trainings/components/style.config";
export const getTrainerNames = (trainers) => {
  if (!trainers || trainers.length === 0) return "Non spécifié";
  return trainers
    .map((t) => t.personalInfo?.fullName || "Formateur inconnu")
    .join(", ");
};
export default function TrainingValidationPage() {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [sessionType, setSessionType] = useState("in-person");
  const [meetingLink, setMeetingLink] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "pending",
    cohorts: "all",
    type: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    formation: 0,
    bootcamp: 0,
    mentoring: 0,
  });
  const [allCohorts, setAllCohorts] = useState([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);

  // Format date to locale string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  useEffect(() => {
    console.log("Fetching approved trainings...");
    const fetchApprovedTrainings = async () => {
      try {
        const response = await getTrainings({
          status: "approved",
          limit: 1000,
        });
        console.log("API Response:", response);
        setCalendarEvents(response.data);
        console.log("Calendar Events:", calendarEvents);
      } catch (error) {
        console.error("Failed to fetch approved trainings:", error);
        setCalendarEvents([]);
      }
    };

    if (activeTab === "calendar") {
      fetchApprovedTrainings();
    }
  }, [activeTab]);
  // Fetch training requests with filters
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await getTrainings({
          status: filters.status === "all" ? undefined : filters.status,
          type: filters.type === "all" ? undefined : filters.type,
          cohort: filters.cohorts === "all" ? undefined : filters.cohorts,
          search: filters.search || undefined,
          page: pagination.page,
          limit: pagination.limit,
        });

        setRequests(response.data || []);
        setPagination(
          response.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
          }
        );

        // Extract unique cohorts for filter
        const cohorts = new Set();
        (response.data || []).forEach((request) => {
          (request.cohorts || []).forEach((cohort) => cohorts.add(cohort));
        });
        setAllCohorts(Array.from(cohorts));

        // Calculate stats
        if (response.pagination?.total) {
          const statsResponse = await getTrainings({ limit: 1000 });
          const allData = statsResponse.data || [];

          setStats({
            total: allData.length,
            pending: allData.filter((t) => t.status === "pending").length,
            approved: allData.filter((t) => t.status === "approved").length,
            rejected: allData.filter((t) => t.status === "rejected").length,
            formation: allData.filter((t) => t.type === "formation").length,
            bootcamp: allData.filter((t) => t.type === "bootcamp").length,
            mentoring: allData.filter((t) => t.type === "mentoring").length,
          });
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error);
        toast.error("Erreur lors du chargement des demandes");
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [filters, pagination.page, pagination.limit]);

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setApproveOpen(true);
    setSessionType(request.sessionType || "in-person");
    setLocation(request.location || "");
    setMeetingLink(request.meetLink || "");
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectOpen(true);
    setRejectReason("");
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;
  
    if (sessionType === "in-person" && !location) {
      toast.error("Veuillez sélectionner un emplacement");
      return;
    }
  
    setIsProcessing(true);
    try {
      const approvalData = {
        location: sessionType === "in-person" ? location : undefined,
        sessionType,
        meetingLink:
          sessionType === "online"
            ? meetingLink || "https://meet.jit.si/temp-" + Date.now() // temp hidden link
            : undefined,
      };
  
      const updatedTraining = await approveTrainingRequest(
        selectedRequest._id,
        approvalData
      );
  
      setRequests((prev) =>
        prev.map((r) => (r._id === updatedTraining._id ? updatedTraining : r))
      );
      setIsApprovalModalOpen(false);
      toast.success("Demande approuvée avec succès");
    } catch (error) {
      console.error("Error approving training:", error);
      toast.error("Erreur lors de l'approbation");
    } finally {
      setIsProcessing(false);
    }
  };
  

  const confirmReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason || rejectReason.trim().length < 10) {
      toast.error(
        "Veuillez fournir une raison de refus (au moins 10 caractères)"
      );
      return;
    }

    setIsProcessing(true);
    try {
      const updatedTraining = await rejectTrainingRequest(selectedRequest._id, {
        rejectionReason: rejectReason,
      });

      setRequests(
        requests.map((req) =>
          req._id === selectedRequest._id
            ? {
                ...req,
                status: "rejected",
                rejectionReason: updatedTraining.rejectionReason,
                rejectedAt: new Date().toISOString(),
              }
            : req
        )
      );

      setRejectOpen(false);
      toast.success(updatedTraining.message || "Demande rejetée avec succès");
    } catch (error) {
      toast.error(error.message);
      console.error("Rejection failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleViewDetails = (training) => {
    setSelectedTraining(training);
    setDetailsModalOpen(true);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex py-6 items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r bg-tacir-blue shadow-md">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-tacir-darkblue">
            Validation des Demandes
          </h1>
          <p className="text-sm text-tacir-darkgray">
            Consultez et validez les demandes de formation
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full bg-white shadow-sm rounded-lg border border-tacir-lightgray">
          <TabsTrigger
            value="requests"
            className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white"
          >
            Demandes
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white"
          >
            Calendrier
          </TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <TrainingStatsCard
              title="Total"
              value={stats.total}
              icon={BookOpen}
              color="tacir-blue"
              borderColor="tacir-blue"
            />
            <TrainingStatsCard
              title="En Attente"
              value={stats.pending}
              icon={Clock}
              color="tacir-yellow"
              borderColor="tacir-yellow"
            />
            <TrainingStatsCard
              title="Approuvés"
              value={stats.approved}
              icon={Check}
              color="tacir-green"
              borderColor="tacir-green"
            />
            <TrainingStatsCard
              title="Rejetés"
              value={stats.rejected}
              icon={X}
              color="tacir-pink"
              borderColor="tacir-pink"
            />
          </div>

          <TrainingFilters
            filters={filters}
            setFilters={setFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            cohorts={allCohorts.map((c) => ({ value: c, label: c }))}
          />

          <div className="space-y-4">
            {requests.length === 0 ? (
              <Card className="p-6 text-center border-tacir-lightblue">
                <p className="text-tacir-darkgray">
                  Aucune demande trouvée avec les filtres actuels
                </p>
              </Card>
            ) : (
              requests.map((request) => (
                <Card
                  key={request._id}
                  className={`p-6 border-l-4 ${
                    typeConfig[request.type]?.borderColor ||
                    "border-tacir-lightblue"
                  } hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => handleViewDetails(request)}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-semibold text-tacir-darkblue">
                        {request.title}
                      </h2>
                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            typeConfig[request.type]?.bgColor ||
                            "bg-tacir-darkblue"
                          } text-white`}
                        >
                          {typeConfig[request.type]?.title || request.type}
                        </span>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-tacir-darkgray">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-tacir-blue" />
                        {formatDate(request.startDate)} • {request.time}
                      </div>
                      {request.proposedLocation && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-tacir-blue" />
                          {request.proposedLocation}
                        </div>
                      )}
                    </div>

                    {request.description && (
                      <p className="text-sm text-tacir-darkgray line-clamp-2">
                        {request.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-tacir-darkgray">
                      <div>
                        <p>
                          <span className="font-medium text-tacir-darkblue">
                            Formateur:
                          </span>{" "}
                          {getTrainerNames(request.trainers)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-tacir-darkblue">
                          Cohortes:
                        </span>
                        <span className="ml-1">
                          {request.cohorts?.join(", ") || "Non spécifié"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="mt-4 pt-4 border-t border-tacir-lightblue flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-tacir-pink text-tacir-pink hover:bg-tacir-pink/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(request);
                        }}
                      >
                        <X className="w-4 h-4 mr-1" /> Refuser
                      </Button>
                      <Button
                        size="sm"
                        className="bg-tacir-green hover:bg-tacir-darkblue"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(request);
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" /> Valider
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>

          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
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

      {/* Modals */}
      <ApprovalModal
        isOpen={approveOpen}
        onClose={() => setApproveOpen(false)}
        training={selectedRequest}
        sessionType={sessionType}
        setSessionType={setSessionType}
        location={location}
        setLocation={setLocation}
        meetingLink={meetingLink}
        setMeetingLink={setMeetingLink}
        isProcessing={isProcessing}
        onApprove={confirmApprove}
      />

      <RejectionModal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        training={selectedRequest}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        isProcessing={isProcessing}
        onReject={confirmReject}
      />

      {detailsModalOpen && selectedTraining && (
        <TrainingDetailsModal
          training={selectedTraining}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedTraining(null); // Also clear the selected training
          }}
        />
      )}
    </div>
  );
}
