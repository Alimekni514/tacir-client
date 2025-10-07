// Enhanced EditCreathonDialog component
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  User,
  List,
  Plus,
  Trash2,
  Users,
  Award,
  Search,
  X,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { updateCreathonTeam } from "@/services/creathons/creathons";
import { archiveMembers, unarchiveMembers } from "@/services/users/members";
import { getUsersByRole } from "@/services/users/members";

export const EditCreathonDialog = ({ creathon, open, onOpenChange }) => {
  const [teamData, setTeamData] = useState({
    mentors: creathon?.mentors?.members || [],
    juryMembers: creathon?.jury?.members || [],
  });

  const [newMentor, setNewMentor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
  });

  const [newJury, setNewJury] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [sending, setSending] = useState(false);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [availableJury, setAvailableJury] = useState([]);
  const [searchMentorQuery, setSearchMentorQuery] = useState("");
  const [searchJuryQuery, setSearchJuryQuery] = useState("");
  const [selectedMentors, setSelectedMentors] = useState([]);
  const [selectedJury, setSelectedJury] = useState([]);
  const [activeTab, setActiveTab] = useState("mentors");
  const [addMethod, setAddMethod] = useState({
    mentors: "manual",
    jury: "manual",
  });

  useEffect(() => {
    if (open && creathon) {
      setTeamData({
        mentors: creathon?.mentors?.members || [],
        juryMembers: creathon?.jury?.members || [],
      });

      // Load available users when dialog opens
      loadAvailableUsers();
    }
  }, [open, creathon]);

  const loadAvailableUsers = async () => {
    try {
      // Fetch available mentors and jury members
      const mentorsData = await getUsersByRole("mentor");
      const juryData = await getUsersByRole("jury");

      setAvailableMentors(mentorsData);
      setAvailableJury(juryData);
    } catch (error) {
      console.error("Error loading available users:", error);
      toast.error("Erreur lors du chargement des utilisateurs disponibles");
    }
  };

  const addMentor = () => {
    if (newMentor.firstName && newMentor.lastName && newMentor.email) {
      const newMentorWithId = {
        ...newMentor,
        id: Date.now(),
        status: "pending",
        accessStatus: "active",
      };

      setTeamData((prev) => ({
        ...prev,
        mentors: [...prev.mentors, newMentorWithId],
      }));

      setNewMentor({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        specialization: "",
      });
    }
  };

  const addJury = () => {
    if (newJury.firstName && newJury.lastName && newJury.email) {
      const newJuryWithId = {
        ...newJury,
        id: Date.now(),
        status: "pending",
      };

      setTeamData((prev) => ({
        ...prev,
        juryMembers: [...prev.juryMembers, newJuryWithId],
      }));

      setNewJury({ firstName: "", lastName: "", email: "", phone: "" });
    }
  };

  const addSelectedMentors = () => {
    const mentorsToAdd = selectedMentors.map((mentorId) => {
      const mentor = availableMentors.find((m) => m._id === mentorId);
      return {
        user: mentor._id,
        firstName: mentor.firstName,
        lastName: mentor.lastName,
        email: mentor.email,
        phone: mentor.phone || "",
        specialization: mentor.specialization || "",
        status: "confirmed",
        accessStatus: "active",
      };
    });

    setTeamData((prev) => ({
      ...prev,
      mentors: [...prev.mentors, ...mentorsToAdd],
    }));

    setSelectedMentors([]);
    setSearchMentorQuery("");
  };

  const addSelectedJury = () => {
    const juryToAdd = selectedJury.map((juryId) => {
      const jury = availableJury.find((j) => j._id === juryId);
      return {
        user: jury._id,
        firstName: jury.firstName,
        lastName: jury.lastName,
        email: jury.email,
        phone: jury.phone || "",
        status: "confirmed",
      };
    });

    setTeamData((prev) => ({
      ...prev,
      juryMembers: [...prev.juryMembers, ...juryToAdd],
    }));

    setSelectedJury([]);
    setSearchJuryQuery("");
  };

  const toggleMentorSelection = (mentorId) => {
    setSelectedMentors((prev) =>
      prev.includes(mentorId)
        ? prev.filter((id) => id !== mentorId)
        : [...prev, mentorId]
    );
  };

  const toggleJurySelection = (juryId) => {
    setSelectedJury((prev) =>
      prev.includes(juryId)
        ? prev.filter((id) => id !== juryId)
        : [...prev, juryId]
    );
  };

  const toggleLocalMentorAccess = (index, isActive) => {
    setTeamData((prev) => {
      const updatedMentors = [...prev.mentors];
      updatedMentors[index].accessStatus = isActive ? "active" : "inactive";
      return { ...prev, mentors: updatedMentors };
    });
  };

  const removeMentor = (id) => {
    setTeamData((prev) => ({
      ...prev,
      mentors: prev.mentors.filter(
        (mentor) => mentor.id !== id && mentor.user?._id !== id
      ),
    }));
  };

  const removeJury = (id) => {
    setTeamData((prev) => ({
      ...prev,
      juryMembers: prev.juryMembers.filter(
        (jury) => jury.id !== id && jury.user?._id !== id
      ),
    }));
  };

  const handleSave = async () => {
    try {
      setSending(true);

      const teamUpdate = {
        mentors: {
          members: teamData.mentors.map((member) => ({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            phone: member.phone,
            specialization: member.specialization,
            status: member.status,
            accessStatus: member.accessStatus || "inactive",
            user: member.user,
          })),
        },
        jury: {
          members: teamData.juryMembers.map((member) => ({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            phone: member.phone,
            status: member.status,
          })),
        },
      };

      // IDs of mentors to archive (inactive with user)
      const inactiveMentorUserIds = teamData.mentors
        .filter((mentor) => mentor.accessStatus === "inactive" && mentor.user)
        .map((mentor) => mentor.user._id);

      // IDs of mentors to unarchive (active with user)
      const activeMentorUserIds = teamData.mentors
        .filter((mentor) => mentor.accessStatus === "active" && mentor.user)
        .map((mentor) => mentor.user._id);

      // Call archive API if there are inactive mentors
      if (inactiveMentorUserIds.length > 0) {
        await archiveMembers(inactiveMentorUserIds);
      }

      // Call unarchive API if there are active mentors
      if (activeMentorUserIds.length > 0) {
        await unarchiveMembers(activeMentorUserIds);
      }

      await updateCreathonTeam(creathon._id, teamUpdate);

      toast.success("Équipe mise à jour avec succès");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating team:", error);
      toast.error("Erreur lors de la mise à jour de l'équipe");
    } finally {
      setSending(false);
    }
  };

  const filteredAvailableMentors = availableMentors.filter(
    (mentor) =>
      `${mentor.firstName} ${mentor.lastName}`
        .toLowerCase()
        .includes(searchMentorQuery.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchMentorQuery.toLowerCase())
  );

  const filteredAvailableJury = availableJury.filter(
    (jury) =>
      `${jury.firstName} ${jury.lastName}`
        .toLowerCase()
        .includes(searchJuryQuery.toLowerCase()) ||
      jury.email.toLowerCase().includes(searchJuryQuery.toLowerCase())
  );

  const renderMentorAddSection = () => {
    if (addMethod.mentors === "manual") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Prénom"
              value={newMentor.firstName}
              onChange={(e) =>
                setNewMentor({ ...newMentor, firstName: e.target.value })
              }
              className="focus:ring-tacir-blue"
            />
            <Input
              placeholder="Nom"
              value={newMentor.lastName}
              onChange={(e) =>
                setNewMentor({ ...newMentor, lastName: e.target.value })
              }
              className="focus:ring-tacir-blue"
            />
            <Input
              placeholder="Email"
              type="email"
              value={newMentor.email}
              onChange={(e) =>
                setNewMentor({ ...newMentor, email: e.target.value })
              }
              className="focus:ring-tacir-blue"
            />
            <Input
              placeholder="Téléphone"
              value={newMentor.phone}
              onChange={(e) =>
                setNewMentor({ ...newMentor, phone: e.target.value })
              }
              className="focus:ring-tacir-blue"
            />
            <Input
              placeholder="Spécialisation"
              value={newMentor.specialization}
              onChange={(e) =>
                setNewMentor({
                  ...newMentor,
                  specialization: e.target.value,
                })
              }
              className="md:col-span-2 focus:ring-tacir-blue"
            />
          </div>
          <Button
            onClick={addMentor}
            className="gap-2 bg-tacir-blue hover:bg-tacir-blue/90"
            disabled={
              !newMentor.firstName || !newMentor.lastName || !newMentor.email
            }
          >
            <Plus className="h-4 w-4" />
            Ajouter Mentor
          </Button>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-tacir-darkgray" />
            <Input
              placeholder="Rechercher un mentor..."
              value={searchMentorQuery}
              onChange={(e) => setSearchMentorQuery(e.target.value)}
              className="pl-10 focus:ring-tacir-blue"
            />
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {filteredAvailableMentors.length > 0 ? (
              filteredAvailableMentors.map((mentor) => (
                <div
                  key={mentor._id}
                  className={`p-3 border-b cursor-pointer flex items-center justify-between ${
                    selectedMentors.includes(mentor._id)
                      ? "bg-tacir-blue/10"
                      : "hover:bg-tacir-lightgray/30"
                  }`}
                  onClick={() => toggleMentorSelection(mentor._id)}
                >
                  <div>
                    <div className="font-medium">
                      {mentor.firstName} {mentor.lastName}
                    </div>
                    <div className="text-sm text-tacir-darkgray">
                      {mentor.email}
                    </div>
                    {mentor.specialization && (
                      <div className="text-sm text-tacir-darkblue">
                        {mentor.specialization}
                      </div>
                    )}
                  </div>
                  {selectedMentors.includes(mentor._id) && (
                    <div className="w-5 h-5 rounded-full bg-tacir-blue flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-tacir-darkgray">
                Aucun mentor trouvé
              </div>
            )}
          </div>

          {selectedMentors.length > 0 && (
            <Button
              onClick={addSelectedMentors}
              className="gap-2 bg-tacir-blue hover:bg-tacir-blue/90"
            >
              <Plus className="h-4 w-4" />
              Ajouter {selectedMentors.length} mentor(s) sélectionné(s)
            </Button>
          )}
        </div>
      );
    }
  };

  const renderJuryAddSection = () => {
    if (addMethod.jury === "manual") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Prénom"
              value={newJury.firstName}
              onChange={(e) =>
                setNewJury({ ...newJury, firstName: e.target.value })
              }
              className="focus:ring-tacir-blue"
            />
            <Input
              placeholder="Nom"
              value={newJury.lastName}
              onChange={(e) =>
                setNewJury({ ...newJury, lastName: e.target.value })
              }
              className="focus:ring-tacir-blue"
            />
            <Input
              placeholder="Email"
              type="email"
              value={newJury.email}
              onChange={(e) =>
                setNewJury({ ...newJury, email: e.target.value })
              }
              className="focus:ring-tacir-blue"
            />
            <Input
              placeholder="Téléphone"
              value={newJury.phone}
              onChange={(e) =>
                setNewJury({ ...newJury, phone: e.target.value })
              }
              className="focus:ring-tacir-blue"
            />
          </div>
          <Button
            onClick={addJury}
            className="gap-2 bg-tacir-blue hover:bg-tacir-blue/90"
            disabled={!newJury.firstName || !newJury.lastName || !newJury.email}
          >
            <Plus className="h-4 w-4" />
            Ajouter Juré
          </Button>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-tacir-darkgray" />
            <Input
              placeholder="Rechercher un juré..."
              value={searchJuryQuery}
              onChange={(e) => setSearchJuryQuery(e.target.value)}
              className="pl-10 focus:ring-tacir-blue"
            />
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {filteredAvailableJury.length > 0 ? (
              filteredAvailableJury.map((jury) => (
                <div
                  key={jury._id}
                  className={`p-3 border-b cursor-pointer flex items-center justify-between ${
                    selectedJury.includes(jury._id)
                      ? "bg-tacir-blue/10"
                      : "hover:bg-tacir-lightgray/30"
                  }`}
                  onClick={() => toggleJurySelection(jury._id)}
                >
                  <div>
                    <div className="font-medium">
                      {jury.firstName} {jury.lastName}
                    </div>
                    <div className="text-sm text-tacir-darkgray">
                      {jury.email}
                    </div>
                  </div>
                  {selectedJury.includes(jury._id) && (
                    <div className="w-5 h-5 rounded-full bg-tacir-blue flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-tacir-darkgray">
                Aucun juré trouvé
              </div>
            )}
          </div>

          {selectedJury.length > 0 && (
            <Button
              onClick={addSelectedJury}
              className="gap-2 bg-tacir-blue hover:bg-tacir-blue/90"
            >
              <Plus className="h-4 w-4" />
              Ajouter {selectedJury.length} juré(s) sélectionné(s)
            </Button>
          )}
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl !w-full max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-tacir-blue">
            <Users className="h-5 w-5" />
            <DialogTitle className="text-tacir-darkblue">
              Gestion d'équipe du Créathon
            </DialogTitle>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="mentors"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="bg-tacir-lightgray p-1">
            <TabsTrigger
              value="mentors"
              className="data-[state=active]:bg-white data-[state=active]:text-tacir-blue data-[state=active]:shadow-sm rounded-md"
            >
              <User className="h-4 w-4 mr-2" />
              Mentors ({teamData.mentors.length})
            </TabsTrigger>
            <TabsTrigger
              value="jury"
              className="data-[state=active]:bg-white data-[state=active]:text-tacir-blue data-[state=active]:shadow-sm rounded-md"
            >
              <Award className="h-4 w-4 mr-2" />
              Jury ({teamData.juryMembers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mentors" className="space-y-4 mt-4">
            <div className="bg-tacir-lightgray/30 p-4 rounded-lg">
              <h3 className="font-medium text-tacir-darkblue mb-3">
                Ajouter un nouveau mentor
              </h3>

              <div className="flex gap-2 mb-4">
                <Button
                  variant={
                    addMethod.mentors === "manual" ? "default" : "outline"
                  }
                  onClick={() =>
                    setAddMethod({ ...addMethod, mentors: "manual" })
                  }
                  className={
                    addMethod.mentors === "manual"
                      ? "bg-tacir-blue hover:bg-tacir-blue/90"
                      : "border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray"
                  }
                >
                  Saisie manuelle
                </Button>
                <Button
                  variant={
                    addMethod.mentors === "select" ? "default" : "outline"
                  }
                  onClick={() =>
                    setAddMethod({ ...addMethod, mentors: "select" })
                  }
                  className={
                    addMethod.mentors === "select"
                      ? "bg-tacir-blue hover:bg-tacir-blue/90"
                      : "border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray"
                  }
                >
                  Sélectionner depuis la liste
                </Button>
              </div>

              {renderMentorAddSection()}
            </div>

            {teamData.mentors.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-tacir-lightblue/10 p-3 border-b">
                  <h3 className="font-medium text-tacir-darkblue">
                    Liste des mentors ({teamData.mentors.length})
                  </h3>
                </div>
                <Table>
                  <TableHeader className="bg-tacir-lightgray/50">
                    <TableRow>
                      <TableHead className="text-tacir-darkblue font-medium">
                        Nom
                      </TableHead>
                      <TableHead className="text-tacir-darkblue font-medium">
                        Email
                      </TableHead>
                      <TableHead className="text-tacir-darkblue font-medium">
                        Téléphone
                      </TableHead>
                      <TableHead className="text-tacir-darkblue font-medium">
                        Spécialisation
                      </TableHead>
                      <TableHead className="text-tacir-darkblue font-medium">
                        Statut du compte
                      </TableHead>
                      <TableHead className="text-tacir-darkblue font-medium">
                        Accès aux soumissions
                      </TableHead>
                      <TableHead className="text-tacir-darkblue font-medium">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamData.mentors.map((mentor, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-tacir-lightgray/20"
                      >
                        <TableCell className="font-medium">
                          {mentor.firstName} {mentor.lastName}
                          {mentor.user && (
                            <Badge
                              variant="outline"
                              className="ml-2 bg-tacir-green/10 text-tacir-green border-tacir-green/20 text-xs"
                            >
                              Compte existant
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{mentor.email}</TableCell>
                        <TableCell>{mentor.phone}</TableCell>
                        <TableCell>{mentor.specialization}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              mentor.status === "confirmed"
                                ? "bg-tacir-green/20 text-tacir-green border-tacir-green/30"
                                : "bg-tacir-yellow/20 text-tacir-yellow border-tacir-yellow/30"
                            }
                          >
                            {mentor.status === "confirmed"
                              ? "Confirmé"
                              : "En attente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                mentor.accessStatus === "active"
                                  ? "bg-tacir-green/20 text-tacir-green border-tacir-green/30"
                                  : "bg-tacir-pink/20 text-tacir-pink border-tacir-pink/30"
                              }
                            >
                              {mentor.accessStatus === "active"
                                ? "Actif"
                                : "Inactif"}
                            </Badge>

                            <Switch
                              checked={mentor.accessStatus === "active"}
                              onCheckedChange={(checked) =>
                                toggleLocalMentorAccess(index, checked)
                              }
                              className="data-[state=checked]:bg-tacir-green"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeMentor(mentor.id || mentor.user?._id)
                            }
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
            ) : (
              <div className="text-center py-8 text-tacir-darkgray bg-tacir-lightgray/30 rounded-lg">
                <User className="h-10 w-10 mx-auto text-tacir-darkgray/50 mb-2" />
                <p>Aucun mentor ajouté pour le moment</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="jury" className="space-y-4 mt-4">
            <div className="bg-tacir-lightgray/30 p-4 rounded-lg">
              <h3 className="font-medium text-tacir-darkblue mb-3">
                Ajouter un nouveau juré
              </h3>

              <div className="flex gap-2 mb-4">
                <Button
                  variant={addMethod.jury === "manual" ? "default" : "outline"}
                  onClick={() => setAddMethod({ ...addMethod, jury: "manual" })}
                  className={
                    addMethod.jury === "manual"
                      ? "bg-tacir-blue hover:bg-tacir-blue/90"
                      : "border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray"
                  }
                >
                  Saisie manuelle
                </Button>
                <Button
                  variant={addMethod.jury === "select" ? "default" : "outline"}
                  onClick={() => setAddMethod({ ...addMethod, jury: "select" })}
                  className={
                    addMethod.jury === "select"
                      ? "bg-tacir-blue hover:bg-tacir-blue/90"
                      : "border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray"
                  }
                >
                  Sélectionner depuis la liste
                </Button>
              </div>

              {renderJuryAddSection()}
            </div>

            {teamData.juryMembers.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-tacir-lightblue/10 p-3 border-b">
                  <h3 className="font-medium text-tacir-darkblue">
                    Liste des jurés ({teamData.juryMembers.length})
                  </h3>
                </div>
                <Table>
                  <TableHeader className="bg-tacir-lightgray/50">
                    <TableRow>
                      <TableHead className="text-tacir-darkblue font-medium">
                        Nom
                      </TableHead>
                      <TableHead className="text-tacir-darkblue font-medium">
                        Email
                      </TableHead>
                      <TableHead className="text-tacir-darkblue font-medium">
                        Téléphone
                      </TableHead>
                      <TableHead className="text-tacir-darkblue font-medium">
                        Statut
                      </TableHead>
                      <TableHead className="text-tacir-darkblue font-medium">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamData.juryMembers.map((jury, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-tacir-lightgray/20"
                      >
                        <TableCell className="font-medium">
                          {jury.firstName} {jury.lastName}
                          {jury.user && (
                            <Badge
                              variant="outline"
                              className="ml-2 bg-tacir-green/10 text-tacir-green border-tacir-green/20 text-xs"
                            >
                              Compte existant
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{jury.email}</TableCell>
                        <TableCell>{jury.phone}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              jury.status === "confirmed"
                                ? "bg-tacir-green/20 text-tacir-green border-tacir-green/30"
                                : "bg-tacir-yellow/20 text-tacir-yellow border-tacir-yellow/30"
                            }
                          >
                            {jury.status === "confirmed"
                              ? "Confirmé"
                              : "En attente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeJury(jury.id || jury.user?._id)
                            }
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
            ) : (
              <div className="text-center py-8 text-tacir-darkgray bg-tacir-lightgray/30 rounded-lg">
                <Award className="h-10 w-10 mx-auto text-tacir-darkgray/50 mb-2" />
                <p>Aucun juré ajouté pour le moment</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-tacir-lightgray">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
            className="border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={sending}
            className="bg-tacir-green hover:bg-tacir-green/90"
          >
            {sending ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
