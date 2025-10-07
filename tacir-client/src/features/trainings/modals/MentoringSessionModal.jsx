"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Loader from "@/components/ui/Loader";
import { toast } from "react-toastify";
import {
  PlayCircle,
  Edit,
  Trash,
  PlusCircle,
  CheckCircle,
  UserX,
  FileText,
  BookOpen,
  X
} from "lucide-react";
import { formatDate } from "@/utils/date";
import {
  getTrainingSessions,
  createTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
  fetchCohortParticipants,
  saveSessionAttendance,
} from "@/services/trainings/sessionService";
import { generateTrainingReport } from "@/services/trainings/pdfGenerator";

const MentoringSessionModal = ({ training, isOpen, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    participantId: "",
    meetLink: "",
  });
  const [selectedCohort, setSelectedCohort] = useState("");
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [editSessionData, setEditSessionData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    meetLink: "",
  });
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [savingAttendance, setSavingAttendance] = useState({});

  useEffect(() => {
    if (isOpen && training) {
      loadSessions();
      if (training.cohorts && training.cohorts.length === 1) {
        setSelectedCohort(training.cohorts[0]);
        fetchParticipants(training.cohorts[0]);
      }
    }
  }, [isOpen, training]);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await getTrainingSessions(training._id);
      if (response.success) {
        setSessions(response.sessions);
        // Initialize attendance
        const initialAttendance = {};
        response.sessions.forEach((session) => {
          initialAttendance[session._id] = session.attendance || "absent";
        });
        setAttendance(initialAttendance);
      } else {
        throw new Error(response.message || "Failed to fetch sessions");
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error("Erreur lors du chargement des sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchParticipants = async (cohortName) => {
    setLoadingParticipants(true);
    try {
      const response = await fetchCohortParticipants(training._id, cohortName);
      if (response.success) {
        setParticipants(
          response.data.map((participant) => ({
            _id: participant._id,
            user: {
              firstName: participant.user?.firstName || "Unknown",
              lastName: participant.user?.lastName || "Participant",
              email: participant.user?.email || "No email",
              phone: participant.user?.phone || "",
            },
          }))
        );
      } else {
        throw new Error(response.message || "Failed to fetch participants");
      }
    } catch (error) {
      console.error("Error loading participants:", error);
      toast.error("Erreur lors du chargement des participants");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleCohortChange = (value) => {
    setSelectedCohort(value);
    fetchParticipants(value);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSession = async () => {
    if (!formData.participantId) {
      toast.error("Veuillez sélectionner un participant");
      return;
    }

    try {
      const selectedParticipant = participants.find(
        (p) => p._id === formData.participantId
      );
      const sessionData = {
        trainingId: training._id,
        trainingTitle: training.title,
        participantId: formData.participantId,
        participantName: `${selectedParticipant.user.firstName} ${selectedParticipant.user.lastName}`,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        cohort: selectedCohort,
        meetLink: formData.meetLink,
      };

      const response = await createTrainingSession(sessionData);
      if (response.success) {
        toast.success("Session créée avec succès !");
        setFormData({
          date: "",
          startTime: "09:00",
          endTime: "10:00",
          participantId: "",
          meetLink: "",
        });
        loadSessions();
      } else {
        throw new Error(response.message || "Failed to create session");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error(error.message || "Erreur lors de la création de la session");
    }
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setEditSessionData({
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      meetLink: session.meetLink || "",
    });
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;

    try {
      const response = await updateTrainingSession(
        editingSession._id,
        editSessionData
      );
      if (response.success) {
        toast.success("Session mise à jour avec succès !");
        setEditingSession(null);
        loadSessions();
      } else {
        throw new Error(response.message || "Failed to update session");
      }
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error(error.message || "Erreur lors de la mise à jour de la session");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette session ?"
    );
    if (!confirmed) return;

    setDeletingSessionId(sessionId);
    try {
      const response = await deleteTrainingSession(sessionId);
      if (response.success) {
        toast.success("Session supprimée avec succès !");
        loadSessions();
      } else {
        throw new Error(response.message || "Failed to delete session");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error(error.message || "Erreur lors de la suppression de la session");
    } finally {
      setDeletingSessionId(null);
    }
  };

  const toggleAttendance = (sessionId) => {
    setAttendance((prev) => ({
      ...prev,
      [sessionId]: prev[sessionId] === "present" ? "absent" : "present",
    }));
  };

  const saveAttendance = async (sessionId) => {
    setSavingAttendance((prev) => ({ ...prev, [sessionId]: true }));
    try {
      const response = await saveSessionAttendance(
        sessionId,
        attendance[sessionId]
      );
      if (response.success) {
        toast.success("Présence enregistrée !");
      } else {
        throw new Error(response.message || "Failed to save attendance");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement de la présence");
    } finally {
      setSavingAttendance((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  const generatePDF = () => {
    if (!training) {
      toast.warning("Aucune formation sélectionnée");
      return;
    }

    try {
      const attendanceSessions = sessions.filter(
        (session) => session.attendance !== undefined
      );
      if (attendanceSessions.length === 0) {
        toast.warning("Aucune donnée de présence à exporter");
        return;
      }
      generateTrainingReport(training, attendanceSessions);
      toast.success("Rapport PDF généré avec succès");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  // FIXED: Proper date formatting for input fields
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // FIXED: Correct date display with UTC adjustment
  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    
    // Adjust for timezone offset
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return adjustedDate.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (!training) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl p-6 rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <PlusCircle className="w-5 h-5 text-tacir-blue" />
            Gestion des sessions:{" "}
            <span className="text-tacir-blue">{training.title}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="plan" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plan">Planifier une session</TabsTrigger>
            <TabsTrigger value="booked">
              Sessions planifiées ({sessions.length})
            </TabsTrigger>
            <TabsTrigger value="attendance">Présence</TabsTrigger>
          </TabsList>

          {/* Plan Session Tab */}
          <TabsContent value="plan" className="space-y-6 pt-6">
            {(() => {
              const now = new Date();
              const trainingEndDate = new Date(training.endDate);
              const isTrainingEnded = now > trainingEndDate;

              if (isTrainingEnded) {
                return (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <X className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-red-800 mb-2">
                      Formation terminée
                    </h3>
                    <p className="text-red-600 mb-4">
                      Cette formation s'est terminée le{" "}
                      {formatDateDisplay(training.endDate)}. Vous ne pouvez plus
                      planifier de nouvelles sessions.
                    </p>
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="border-red-300 text-red-600 hover:bg-red-100"
                    >
                      Fermer
                    </Button>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Training Type */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Type de formation
                        </Label>
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-md ${
                    
                              "bg-tacir-blue"
                            }`}
                          >
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-800">
                            { training.type}
                          </span>
                        </div>
                      </div>

                      {/* Cohort */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Cohorte
                        </Label>
                        <Select
                          value={selectedCohort}
                          onValueChange={handleCohortChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une cohorte" />
                          </SelectTrigger>
                          <SelectContent>
                            {training.cohorts?.map((cohort, index) => (
                              <SelectItem key={index} value={cohort}>
                                {cohort}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Participant */}
                      {selectedCohort && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Participant
                          </Label>
                          {loadingParticipants ? (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-tacir-blue"></div>
                            </div>
                          ) : participants.length > 0 ? (
                            <Select
                              value={formData.participantId}
                              onValueChange={(value) =>
                                setFormData({ ...formData, participantId: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un participant" />
                              </SelectTrigger>
                              <SelectContent>
                                {participants.map((participant) => (
                                  <SelectItem
                                    key={participant._id}
                                    value={participant._id}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="bg-gray-200 border border-gray-300 rounded-full w-8 h-8" />
                                      <div className="text-left">
                                        <p className="text-sm font-medium">
                                          {participant.user.firstName}{" "}
                                          {participant.user.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {participant.user.email}
                                        </p>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="text-center py-3 text-gray-500 italic text-sm">
                              Aucun participant trouvé pour cette cohorte
                            </div>
                          )}
                        </div>
                      )}

                      {/* Session Link */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Lien de session (optionnel)
                        </Label>
                        <Input
                          type="url"
                          name="meetLink"
                          value={formData.meetLink}
                          onChange={handleFormChange}
                          placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Ajoutez un lien de visioconférence (Google Meet, Zoom,
                          etc.)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Date de la session
                      </Label>
                      <Input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleFormChange}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Heure de la session
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="startTime"
                            className="text-xs text-gray-600 block mb-1"
                          >
                            Début
                          </Label>
                          <Input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleFormChange}
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="endTime"
                            className="text-xs text-gray-600 block mb-1"
                          >
                            Fin
                          </Label>
                          <Input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Create button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleCreateSession}
                      disabled={!formData.participantId}
                      className="bg-tacir-blue hover:bg-tacir-darkblue text-white px-6 py-2 flex items-center"
                    >
                      Créer la session
                    </Button>
                  </div>
                </div>
              );
            })()}
          </TabsContent>

          {/* Booked Sessions Tab */}
          <TabsContent value="booked" className="pt-6">
            {loadingSessions ? (
              <div className="flex justify-center py-6">
                <Loader size="sm" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune session planifiée pour cette formation
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center text-sm text-gray-500 font-medium">
                    <div className="w-1/6">Date & Heure</div>
                    <div className="w-1/6">Participant</div>
                    <div className="w-1/6">Statut</div>
                    <div className="w-1/6">Cohorte</div>
                    <div className="w-1/6">Lien de session</div>
                    <div className="w-1/6">Actions</div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {sessions.map((session) => {
                      // FIXED: Correct date handling for session date/time
                      const sessionDate = new Date(session.date);
                      const sessionDateStr = sessionDate.toISOString().split('T')[0];
                      const sessionDateTime = new Date(`${sessionDateStr}T${session.startTime}`);
                      const now = new Date();
                      const isPast = sessionDateTime < now;
                      const status = isPast ? "Terminée" : "Confirmée";
                      const statusClass = isPast
                        ? "bg-gray-100 text-gray-800"
                        : "bg-green-100 text-green-800";

                      return (
                        <div
                          key={session._id}
                          className="px-4 py-3 flex items-center text-sm"
                        >
                          {editingSession?._id === session._id ? (
                            // Edit mode
                            <>
                              <div className="w-1/6">
                                <Input
                                  type="date"
                                  value={formatDateForInput(editSessionData.date)}
                                  onChange={(e) =>
                                    setEditSessionData({
                                      ...editSessionData,
                                      date: e.target.value,
                                    })
                                  }
                                  className="mb-1"
                                />
                                <div className="flex gap-1">
                                  <Input
                                    type="time"
                                    value={editSessionData.startTime}
                                    onChange={(e) =>
                                      setEditSessionData({
                                        ...editSessionData,
                                        startTime: e.target.value,
                                      })
                                    }
                                  />
                                  <Input
                                    type="time"
                                    value={editSessionData.endTime}
                                    onChange={(e) =>
                                      setEditSessionData({
                                        ...editSessionData,
                                        endTime: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              <div className="w-1/6">
                                <div className="font-medium">
                                  {session.participantName}
                                </div>
                              </div>

                              <div className="w-1/6">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${statusClass}`}
                                >
                                  {status}
                                </span>
                              </div>

                              <div className="w-1/6 text-gray-600">
                                {session.cohort}
                              </div>

                              <div className="w-1/6">
                                <Input
                                  type="text"
                                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                  value={editSessionData.meetLink}
                                  onChange={(e) =>
                                    setEditSessionData({
                                      ...editSessionData,
                                      meetLink: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div className="w-1/6 flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleUpdateSession}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Enregistrer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingSession(null)}
                                >
                                  Annuler
                                </Button>
                              </div>
                            </>
                          ) : (
                            // View mode
                            <>
                              <div className="w-1/6">
                                <div className="font-medium">
                                  {formatDateDisplay(session.date)}
                                </div>
                                <div className="text-gray-500">
                                  {session.startTime} - {session.endTime}
                                </div>
                              </div>

                              <div className="w-1/6">
                                <div className="font-medium">
                                  {session.participantName}
                                </div>
                              </div>

                              <div className="w-1/6">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${statusClass}`}
                                >
                                  {status}
                                </span>
                              </div>

                              <div className="w-1/6 text-gray-600">
                                {session.cohort}
                              </div>

                              <div className="w-1/6">
                                {session.meetLink ? (
                                  <a
                                    href={session.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-tacir-blue hover:underline text-sm truncate block"
                                    title={session.meetLink}
                                  >
                                    {session.meetLink.substring(0, 20)}...
                                  </a>
                                ) : (
                                  <span className="text-gray-400 italic text-sm">
                                    Non spécifié
                                  </span>
                                )}
                              </div>

                              <div className="w-1/6 flex gap-2">
                                {!isPast && (
                                  <Button
                                    size="sm"
                                    className="bg-tacir-green hover:bg-green-600"
                                    onClick={() => {
                                      if (session.meetLink) {
                                        window.open(session.meetLink, "_blank");
                                      } else if (
                                        training.sessionDetails?.meetLink
                                      ) {
                                        window.open(
                                          training.sessionDetails.meetLink,
                                          "_blank"
                                        );
                                      } else {
                                        toast.error(
                                          "Aucun lien de session disponible"
                                        );
                                      }
                                    }}
                                  >
                                    <PlayCircle className="w-4 h-4 mr-1" />
                                    Rejoindre
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditSession(session)}
                                  disabled={isPast}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteSession(session._id)}
                                  disabled={deletingSessionId === session._id}
                                >
                                  {deletingSessionId === session._id ? (
                                    <Loader size="sm" />
                                  ) : (
                                    <Trash className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm text-gray-500">
                    Total: {sessions.length} session
                    {sessions.length !== 1 ? "s" : ""}
                  </div>
                  <div className="text-sm text-gray-500">
                    {
                      sessions.filter(
                        (s) => {
                          const sessionDate = new Date(s.date);
                          const sessionDateStr = sessionDate.toISOString().split('T')[0];
                          const sessionDateTime = new Date(`${sessionDateStr}T${s.startTime}`);
                          return sessionDateTime > new Date();
                        }
                      ).length
                    }{" "}
                    session
                    {sessions.filter(
                      (s) => {
                        const sessionDate = new Date(s.date);
                        const sessionDateStr = sessionDate.toISOString().split('T')[0];
                        const sessionDateTime = new Date(`${sessionDateStr}T${s.startTime}`);
                        return sessionDateTime > new Date();
                      }
                    ).length !== 1
                      ? "s"
                      : ""}{" "}
                    à venir
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Attendance Management Tab */}
          <TabsContent value="attendance" className="pt-6">
            <div className="flex justify-end mb-4">
              <Button
                onClick={generatePDF}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Générer PDF
              </Button>
            </div>
            {loadingSessions ? (
              <div className="flex justify-center py-6">
                <Loader size="sm" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune session planifiée pour cette formation
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center text-sm text-gray-500 font-medium">
                    <div className="w-1/5">Date & Heure</div>
                    <div className="w-1/5">Participant</div>
                    <div className="w-1/5">Cohorte</div>
                    <div className="w-1/5">Présence</div>
                    <div className="w-1/5">Actions</div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {sessions.map((session) => {
                      // FIXED: Correct date handling for attendance tab
                      const sessionDate = new Date(session.date);
                      const sessionDateStr = sessionDate.toISOString().split('T')[0];
                      const sessionDateTime = new Date(`${sessionDateStr}T${session.startTime}`);
                      const now = new Date();
                      const isPast = sessionDateTime < now;

                      return (
                        <div
                          key={session._id}
                          className="px-4 py-3 flex items-center text-sm"
                        >
                          <div className="w-1/5">
                            <div className="font-medium">
                              {formatDateDisplay(session.date)}
                            </div>
                            <div className="text-gray-500">
                              {session.startTime} - {session.endTime}
                            </div>
                          </div>

                          <div className="w-1/5">
                            <div className="font-medium">
                              {session.participantName}
                            </div>
                          </div>

                          <div className="w-1/5 text-gray-600">
                            {session.cohort}
                          </div>

                          <div className="w-1/5">
                            {isPast ? (
                              <div className="flex items-center">
                                <span
                                  className={`mr-2 ${
                                    attendance[session._id] === "present"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {attendance[session._id] === "present"
                                    ? "Présent"
                                    : "Absent"}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleAttendance(session._id)}
                                  className="h-6 w-6"
                                >
                                  {attendance[session._id] === "present" ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <UserX className="w-4 h-4 text-red-600" />
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-400">
                                Session à venir
                              </span>
                            )}
                          </div>

                          <div className="w-1/5">
                            {isPast && (
                              <Button
                                size="sm"
                                onClick={() => saveAttendance(session._id)}
                                disabled={savingAttendance[session._id]}
                              >
                                {savingAttendance[session._id] ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Enregistrement...
                                  </div>
                                ) : (
                                  "Enregistrer"
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4 py-2"
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MentoringSessionModal;