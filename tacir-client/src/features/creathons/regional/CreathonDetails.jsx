"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  Box,
  Trash2,
  User,
  List,
  Mail,
  Settings2,
  Eye,
  Edit,
  ChevronLeft,
  FileText,
  Trophy,
  BookOpen,
  Sparkles,
  Cpu,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sendCreathonInvitations } from "@/services/creathons/creathons";
import { fetchCurrentUser } from "@/services/users/user";
import Image from "next/image";

const formatDate = (dateStr) => {
  if (!dateStr) return "Non spécifié";
  const date = new Date(dateStr);
  if (isNaN(date)) return "Date invalide";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const InvitationButton = ({
  type,
  members,
  creathonId,
  canSendInvitations,
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSendInvitations = async () => {
    try {
      setIsSending(true);
      const response = await sendCreathonInvitations(creathonId, type);

      if (response.error) {
        throw new Error(response.message || "Failed to send invitations");
      }

      toast.success(response.message || `Invitations envoyées aux ${type}`);
    } catch (error) {
      console.error("Invitation error:", error);
      toast.error(
        error.message || `Erreur lors de l'envoi des invitations aux ${type}`,
        { autoClose: 5000 }
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!canSendInvitations) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-end gap-4">
      <span className="text-sm text-tacir-darkgray">
        {members.length} {type === "mentors" ? "mentors" : "jurés"} à inviter
      </span>
      <Button
        onClick={handleSendInvitations}
        disabled={isSending || members.length === 0}
        className="flex items-center gap-2 bg-tacir-blue hover:bg-tacir-blue/90"
      >
        <Mail className="h-4 w-4" />
        {isSending
          ? "Envoi en cours..."
          : `Envoyer à tous les ${type === "mentors" ? "mentors" : "jurés"}`}
      </Button>
    </div>
  );
};

export const CreathonDetails = ({ creathon, onBack }) => {
  const [activeTeamTab, setActiveTeamTab] = useState("mentors");
  const [mentors, setMentors] = useState(creathon.mentors?.members || []);
  const [juryMembers, setJuryMembers] = useState(creathon.jury?.members || []);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userData = await fetchCurrentUser();
        setCurrentUser(userData.user);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        toast.error(
          "Erreur lors de la récupération des informations utilisateur"
        );
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const isGeneralCoordinator =
    currentUser?.roles?.includes("GeneralCoordinator");
  const isCreathonValidated =
    creathon.validations?.componentValidation?.validatedAt &&
    creathon.validations?.generalValidation?.validatedAt;
  const canSendInvitations = isGeneralCoordinator && isCreathonValidated;
  const shouldShowMemberLists = isCreathonValidated;

  const removeMentor = (id) => {
    setMentors(mentors.filter((mentor) => mentor.id !== id));
  };

  const removeJury = (id) => {
    setJuryMembers(juryMembers.filter((jury) => jury.id !== id));
  };

  const getComponentIcon = (component) => {
    switch (component) {
      case "crea":
        return <Sparkles className="h-5 w-5" />;
      case "tech":
        return <Cpu className="h-5 w-5" />;
      case "business":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getComponentColor = (component) => {
    switch (component) {
      case "crea":
        return "bg-tacir-pink/10 text-tacir-pink border-tacir-pink";
      case "tech":
        return "bg-tacir-lightblue/10 text-tacir-lightblue border-tacir-lightblue";
      case "business":
        return "bg-tacir-green/10 text-tacir-green border-tacir-green";
      default:
        return "bg-tacir-blue/10 text-tacir-blue border-tacir-blue";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-tacir-darkgray">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-h-screen">
      {/* Header Card */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          {creathon.image && (
            <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
              <Image
                src={creathon.image}
                alt={creathon.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl md:text-3xl text-tacir-darkblue">
                {creathon.title}
              </CardTitle>
              <p className="text-tacir-darkgray mt-2">{creathon.description}</p>
            </div>
            <Badge className={getComponentColor(creathon.component)}>
              {getComponentIcon(creathon.component)}
              <span className="ml-1 font-medium">
                {creathon.component?.toUpperCase()}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm text-tacir-darkgray">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-tacir-blue" />
              <span>
                {creathon.location?.venue || "Lieu non spécifié"},{" "}
                {creathon.location?.city}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle
                className={`h-4 w-4 ${
                  isCreathonValidated ? "text-tacir-green" : "text-tacir-yellow"
                }`}
              />
              <span>
                {creathon.validations?.componentValidation?.validatedAt
                  ? "Validé composante"
                  : "Non validé composante"}
                {" / "}
                {creathon.validations?.generalValidation?.validatedAt
                  ? "Publié"
                  : "Non publié"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates & Capacity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-tacir-darkblue">
              <Calendar className="h-5 w-5 text-tacir-blue" />
              <span>Calendrier</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-tacir-darkgray">
            <div className="flex justify-between items-center p-3 bg-tacir-lightgray/30 rounded-lg">
              <span className="font-medium">Début</span>
              <span>{formatDate(creathon.dates?.startDate)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-tacir-lightgray/30 rounded-lg">
              <span className="font-medium">Fin</span>
              <span>{formatDate(creathon.dates?.endDate)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-tacir-lightgray/30 rounded-lg">
              <span className="font-medium">Clôture inscriptions</span>
              <span>{formatDate(creathon.dates?.registrationDeadline)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-tacir-lightgray/30 rounded-lg">
              <span className="font-medium">Durée</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-tacir-orange" />
                {creathon.duration} jours
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-tacir-darkblue">
              <Users className="h-5 w-5 text-tacir-blue" />
              <span>Capacité</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-tacir-blue/10 rounded-lg">
                <Users className="h-8 w-8 mx-auto text-tacir-blue mb-2" />
                <p className="text-2xl font-bold text-tacir-darkblue">
                  {creathon.capacity?.maxParticipants || 0}
                </p>
                <p className="text-sm text-tacir-darkgray">Participants max</p>
              </div>
              <div className="text-center p-4 bg-tacir-green/10 rounded-lg">
                <User className="h-8 w-8 mx-auto text-tacir-green mb-2" />
                <p className="text-2xl font-bold text-tacir-darkblue">
                  {creathon.capacity?.maxTeams || 0}
                </p>
                <p className="text-sm text-tacir-darkgray">Équipes max</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Management Section */}
      {shouldShowMemberLists ? (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-tacir-darkblue">Équipe</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTeamTab} onValueChange={setActiveTeamTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger
                  value="mentors"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Mentors ({mentors.length})
                </TabsTrigger>
                <TabsTrigger value="jury" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Jury ({juryMembers.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mentors">
                <div className="space-y-4">
                  {mentors.length > 0 ? (
                    <>
                      <div className="rounded-lg border border-tacir-lightgray overflow-hidden">
                        <Table>
                          <TableHeader className="bg-tacir-lightgray/30">
                            <TableRow>
                              <TableHead className="text-tacir-darkblue font-semibold">
                                Nom
                              </TableHead>
                              <TableHead className="text-tacir-darkblue font-semibold">
                                Email
                              </TableHead>
                              <TableHead className="text-tacir-darkblue font-semibold">
                                Téléphone
                              </TableHead>
                              <TableHead className="text-tacir-darkblue font-semibold">
                                Spécialisation
                              </TableHead>
                              <TableHead className="text-tacir-darkblue font-semibold">
                                Statut
                              </TableHead>
                              <TableHead className="text-tacir-darkblue font-semibold">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mentors.map((mentor, index) => (
                              <TableRow
                                key={index}
                                className="hover:bg-tacir-lightgray/20"
                              >
                                <TableCell className="font-medium">
                                  {mentor.firstName} {mentor.lastName}
                                </TableCell>
                                <TableCell>{mentor.email}</TableCell>
                                <TableCell>{mentor.phone}</TableCell>
                                <TableCell>{mentor.specialization}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      mentor.status === "confirmed"
                                        ? "bg-tacir-green text-white"
                                        : "bg-tacir-yellow text-white"
                                    }
                                  >
                                    {mentor.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMentor(mentor.id)}
                                    className="text-tacir-pink hover:text-tacir-pink/80 hover:bg-tacir-pink/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <InvitationButton
                        type="mentors"
                        members={mentors}
                        creathonId={creathon._id}
                        canSendInvitations={canSendInvitations}
                      />
                    </>
                  ) : (
                    <div className="text-center py-12 text-tacir-darkgray">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-tacir-lightblue/40" />
                      <p>Aucun mentor ajouté</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="jury">
                <div className="space-y-4">
                  {juryMembers.length > 0 ? (
                    <>
                      <div className="rounded-lg border border-tacir-lightgray overflow-hidden">
                        <Table>
                          <TableHeader className="bg-tacir-lightgray/30">
                            <TableRow>
                              <TableHead className="text-tacir-darkblue font-semibold">
                                Nom
                              </TableHead>
                              <TableHead className="text-tacir-darkblue font-semibold">
                                Email
                              </TableHead>
                              <TableHead className="text-tacir-darkblue font-semibold">
                                Statut
                              </TableHead>
                              <TableHead className="text-tacir-darkblue font-semibold">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {juryMembers.map((jury, index) => (
                              <TableRow
                                key={index}
                                className="hover:bg-tacir-lightgray/20"
                              >
                                <TableCell className="font-medium">
                                  {jury.firstName} {jury.lastName}
                                </TableCell>
                                <TableCell>{jury.email}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      jury.status === "confirmed"
                                        ? "bg-tacir-green text-white"
                                        : "bg-tacir-yellow text-white"
                                    }
                                  >
                                    {jury.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeJury(jury.id)}
                                    className="text-tacir-pink hover:text-tacir-pink/80 hover:bg-tacir-pink/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <InvitationButton
                        type="jury"
                        members={juryMembers}
                        creathonId={creathon._id}
                        canSendInvitations={canSendInvitations}
                      />
                    </>
                  ) : (
                    <div className="text-center py-12 text-tacir-darkgray">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-tacir-pink/40" />
                      <p>Aucun juré ajouté</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center py-12 text-tacir-darkgray">
              <Settings2 className="h-16 w-16 mx-auto mb-4 text-tacir-darkgray/40" />
              <p className="text-lg font-medium mb-2">
                Équipe en attente de validation
              </p>
              <p className="text-sm">
                Les listes des mentors et jurés seront disponibles après
                validation complète du créathon.
              </p>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <span className="flex items-center gap-2">
                  Validation composante:{" "}
                  <Badge
                    className={
                      creathon.validations?.componentValidation?.validatedAt
                        ? "bg-tacir-green text-white"
                        : "bg-tacir-yellow text-white"
                    }
                  >
                    {creathon.validations?.componentValidation?.validatedAt
                      ? "✓"
                      : "✗"}
                  </Badge>
                </span>
                <span className="flex items-center gap-2">
                  Validation générale:{" "}
                  <Badge
                    className={
                      creathon.validations?.generalValidation?.validatedAt
                        ? "bg-tacir-green text-white"
                        : "bg-tacir-yellow text-white"
                    }
                  >
                    {creathon.validations?.generalValidation?.validatedAt
                      ? "✓"
                      : "✗"}
                  </Badge>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget & Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-tacir-darkblue">
              <DollarSign className="h-5 w-5 text-tacir-green" />
              <span>Budget</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-tacir-green/10 rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto text-tacir-green mb-2" />
                <p className="text-2xl font-bold text-tacir-darkblue">
                  {creathon.budget?.totalBudget?.toLocaleString("fr-FR") || 0}
                </p>
                <p className="text-sm text-tacir-darkgray">Total (DT)</p>
              </div>
              <div className="text-center p-4 bg-tacir-blue/10 rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto text-tacir-blue mb-2" />
                <p className="text-2xl font-bold text-tacir-darkblue">
                  {creathon.budget?.allocatedBudget?.toLocaleString("fr-FR") ||
                    0}
                </p>
                <p className="text-sm text-tacir-darkgray">Alloué (DT)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-tacir-darkblue">
              <Box className="h-5 w-5 text-tacir-orange" />
              <span>Ressources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-tacir-darkblue mb-2">
                Matériels
              </h4>
              {creathon.resources?.materials?.length > 0 ? (
                <div className="space-y-1">
                  {creathon.resources.materials.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 bg-tacir-lightgray/30 rounded"
                    >
                      <Box className="h-3 w-3 text-tacir-orange" />
                      <span className="text-sm text-tacir-darkgray">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-tacir-darkgray/60 text-sm">Aucun matériel</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-tacir-darkblue mb-2">
                Équipements
              </h4>
              {creathon.resources?.equipment?.length > 0 ? (
                <div className="space-y-1">
                  {creathon.resources.equipment.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 bg-tacir-lightgray/30 rounded"
                    >
                      <Box className="h-3 w-3 text-tacir-orange" />
                      <span className="text-sm text-tacir-darkgray">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-tacir-darkgray/60 text-sm">
                  Aucun équipement
                </p>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-tacir-darkblue mb-2">
                Installations
              </h4>
              {creathon.resources?.facilities?.length > 0 ? (
                <div className="space-y-1">
                  {creathon.resources.facilities.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 bg-tacir-lightgray/30 rounded"
                    >
                      <Box className="h-3 w-3 text-tacir-orange" />
                      <span className="text-sm text-tacir-darkgray">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-tacir-darkgray/60 text-sm">
                  Aucune installation
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
