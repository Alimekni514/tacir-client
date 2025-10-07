"use client";
import { useEffect, useState, useMemo } from "react";
import {
  getCreathonsForComponentCoordinator,
  validateCreathonLogistics,
} from "@/services/creathons/creathons";
import { EditCreathonDialog } from "@/features/creathons/EditCreathonDialog";
import AcceptedCandidatesTab from "@/features/creathons/AcceptedCandidatesTab";
import CreathonTable from "@/features/creathons/CreathonTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ValidationModal } from "@/features/creathons/regional/ValidationModal";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Eye,
  Edit,
  ChevronLeft,
  Search,
  FileText,
  CheckCircle,
  Grid,
  List,
  Clock,
  Trophy,
  BookOpen,
  UserCheck,
  Sparkles,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import { CreathonDetails } from "@/features/creathons/regional/CreathonDetails";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Pagination from "@/components/common/CustomPagination";
import Image from "next/image";
import { toast } from "react-toastify";

export default function ComponentCoordinatorCreathons() {
  const [creathons, setCreathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreathon, setSelectedCreathon] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [creathonToValidate, setCreathonToValidate] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [creathonToEdit, setCreathonToEdit] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [isGridView, setIsGridView] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(3);

  const handleEdit = (creathon) => {
    setCreathonToEdit(creathon);
    setEditModalOpen(true);
  };

  const openValidationModal = (creathon) => {
    setCreathonToValidate(creathon);
    setValidationModalOpen(true);
  };

  const handleConfirmValidation = async (comments) => {
    if (creathonToValidate) {
      await validateCreathonLogistics(creathonToValidate._id, comments);
      toast.success("Créathon validé avec succès");
      setValidationModalOpen(false);
      await fetchCreathons();
    }
  };

  // Request sort function
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Sort creathons
  const sortedCreathons = useMemo(() => {
    if (!sortConfig.key) return creathons;

    return [...creathons].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [creathons, sortConfig]);

  const filteredCreathons = sortedCreathons
    .filter((c) => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((c) => {
      if (activeTab === "all") return true;
      if (activeTab === "pending")
        return !c.validations?.componentValidation?.validatedAt;
      if (activeTab === "validated")
        return c.validations?.componentValidation?.validatedAt;
      return true;
    });

  // Paginated creathons
  const paginatedCreathons = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredCreathons.slice(startIndex, startIndex + limit);
  }, [filteredCreathons, page, limit]);

  const fetchCreathons = async () => {
    try {
      setLoading(true);
      const res = await getCreathonsForComponentCoordinator();
      setCreathons(res.creathons);
    } catch (err) {
      console.error("Erreur lors de la récupération", err);
      toast.error("Erreur lors du chargement des créathons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreathons();
  }, []);

  const handleView = (creathon) => setSelectedCreathon(creathon);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Non spécifié";
    return format(new Date(dateStr), "PPP", { locale: fr });
  };

  if (loading) {
    return <Loader />;
  }

  if (selectedCreathon) {
    return (
      <div className="p-6 space-y-6 bg-tacir-lightgray min-h-screen">
        <Button
          variant="outline"
          onClick={() => setSelectedCreathon(null)}
          className="flex items-center gap-2 bg-white border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour à la liste
        </Button>
        <CreathonDetails creathon={selectedCreathon} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="bg-white rounded-2xl shadow-md p-4 border border-tacir-lightgray/30 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-tacir-blue rounded-xl shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-lg font-bold text-tacir-darkblue">
                Gestion des Créathons
              </h1>
              <p className="text-tacir-darkgray mt-1">
                {creathons.length} créathon{creathons.length !== 1 ? "s" : ""}{" "}
                assigné{creathons.length !== 1 ? "s" : ""} - Gérez et validez
                vos événements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tacir-darkgray" />
              <Input
                placeholder="Rechercher un créathon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-tacir-blue focus:ring-tacir-blue"
              />
            </div>

            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-tacir-lightgray">
              <Button
                variant={isGridView ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsGridView(true)}
                className={`h-8 w-8 p-0 ${
                  isGridView
                    ? "bg-tacir-blue text-white"
                    : "text-tacir-darkgray"
                }`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={!isGridView ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsGridView(false)}
                className={`h-8 w-8 p-0 ${
                  !isGridView
                    ? "bg-tacir-blue text-white"
                    : "text-tacir-darkgray"
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setPage(1);
        }}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 w-full md:w-auto shadow-xl bg-white p-1 rounded-lg">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-tacir-blue data-[state=active]:text-white rounded-md flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Tous
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-tacir-yellow data-[state=active]:text-white rounded-md flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />À valider
          </TabsTrigger>
          <TabsTrigger
            value="validated"
            className="data-[state=active]:bg-tacir-green data-[state=active]:text-white rounded-md flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Validés
          </TabsTrigger>
          <TabsTrigger
            value="accepted-candidates"
            className="data-[state=active]:bg-tacir-pink data-[state=active]:text-white rounded-md flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Candidats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredCreathons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-white rounded-lg mt-6">
              <FileText className="h-12 w-12 text-tacir-darkgray" />
              <p className="text-tacir-darkgray text-lg">
                Aucun créathon trouvé
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white"
                >
                  Effacer la recherche
                </Button>
              )}
            </div>
          ) : isGridView ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 my-2">
                {paginatedCreathons.map((creathon) => (
                  <EnhancedCreathonCard
                    key={creathon._id}
                    creathon={creathon}
                    onView={handleView}
                    onEdit={handleEdit}
                    onValidateRequest={openValidationModal}
                    formatDate={formatDate}
                  />
                ))}
              </div>
              <Pagination
                page={page}
                limit={limit}
                total={filteredCreathons.length}
                entityName="créathons"
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            </>
          ) : (
            <>
              <CreathonTable
                creathons={paginatedCreathons}
                onView={handleView}
                onEdit={handleEdit}
                onValidateRequest={openValidationModal}
                formatDate={formatDate}
                sortConfig={sortConfig}
                requestSort={requestSort}
              />
              <Pagination
                page={page}
                limit={limit}
                total={filteredCreathons.length}
                entityName="créathons"
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {isGridView ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-4">
                {paginatedCreathons
                  .filter(
                    (c) => !c.validations?.componentValidation?.validatedAt
                  )
                  .map((creathon) => (
                    <EnhancedCreathonCard
                      key={creathon._id}
                      creathon={creathon}
                      onView={handleView}
                      onEdit={handleEdit}
                      onValidateRequest={openValidationModal}
                      formatDate={formatDate}
                    />
                  ))}
              </div>
              <Pagination
                page={page}
                limit={limit}
                total={
                  filteredCreathons.filter(
                    (c) => !c.validations?.componentValidation?.validatedAt
                  ).length
                }
                entityName="créathons"
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            </>
          ) : (
            <>
              <CreathonTable
                creathons={paginatedCreathons.filter(
                  (c) => !c.validations?.componentValidation?.validatedAt
                )}
                onView={handleView}
                onEdit={handleEdit}
                onValidateRequest={openValidationModal}
                formatDate={formatDate}
                sortConfig={sortConfig}
                requestSort={requestSort}
              />
              <Pagination
                page={page}
                limit={limit}
                total={
                  filteredCreathons.filter(
                    (c) => !c.validations?.componentValidation?.validatedAt
                  ).length
                }
                entityName="créathons"
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="validated" className="mt-6">
          {isGridView ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-4">
                {paginatedCreathons
                  .filter(
                    (c) => c.validations?.componentValidation?.validatedAt
                  )
                  .map((creathon) => (
                    <EnhancedCreathonCard
                      key={creathon._id}
                      creathon={creathon}
                      onView={handleView}
                      onEdit={handleEdit}
                      onValidateRequest={openValidationModal}
                      formatDate={formatDate}
                    />
                  ))}
              </div>
              <Pagination
                page={page}
                limit={limit}
                total={
                  filteredCreathons.filter(
                    (c) => c.validations?.componentValidation?.validatedAt
                  ).length
                }
                entityName="créathons"
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            </>
          ) : (
            <>
              <CreathonTable
                creathons={paginatedCreathons.filter(
                  (c) => c.validations?.componentValidation?.validatedAt
                )}
                onView={handleView}
                onEdit={handleEdit}
                onValidateRequest={openValidationModal}
                formatDate={formatDate}
                sortConfig={sortConfig}
                requestSort={requestSort}
              />
              <Pagination
                page={page}
                limit={limit}
                total={
                  filteredCreathons.filter(
                    (c) => c.validations?.componentValidation?.validatedAt
                  ).length
                }
                entityName="créathons"
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="accepted-candidates" className="mt-6">
          <AcceptedCandidatesTab />
        </TabsContent>
      </Tabs>

      <ValidationModal
        open={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        onConfirm={handleConfirmValidation}
      />
      {creathonToEdit && (
        <EditCreathonDialog
          creathon={creathonToEdit}
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open);
            if (!open) setCreathonToEdit(null);
          }}
        />
      )}
    </div>
  );
}

const StatsCard = ({ title, value, icon, color, bgColor }) => (
  <Card className="hover:shadow-md transition-shadow border-0 bg-white">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-tacir-darkgray">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <div className={color}>{icon}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const EnhancedCreathonCard = ({
  creathon,
  onView,
  onEdit,
  onValidateRequest,
  formatDate,
}) => {
  const validationStatus =
    creathon.validations?.componentValidation?.validatedAt;

  const getComponentIcon = (component) => {
    switch (component) {
      case "crea":
        return <Sparkles className="h-5 w-5" />;
      case "innov":
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
        return "bg-tacir-pink text-white border-tacir-pink";
      case "inniv":
        return "bg-tacir-lightblue text-white border-tacir-lightblue";
      default:
        return "bg-tacir-blue text-white border-tacir-blue";
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white group overflow-hidden relative rounded-2xl">
      <div
        className={`h-2 ${
          validationStatus ? "bg-tacir-green" : "bg-tacir-yellow"
        }`}
      ></div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className={getComponentColor(creathon.component)}>
          {getComponentIcon(creathon.component)}
          <span className="ml-1 font-medium">
            {creathon.component?.toUpperCase()}
          </span>
        </Badge>
      </div>

      {/* Image Section */}
      <div className="h-40 relative overflow-hidden">
        {creathon.image ? (
          <Image
            src={creathon.image}
            alt={creathon.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-tacir-blue/20 to-tacir-lightblue/20 flex items-center justify-center">
            <div className="p-4 bg-white/80 rounded-full">
              <Calendar className="h-8 w-8 text-tacir-blue" />
            </div>
          </div>
        )}
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60"></div>

        {/* Date Badge on Image */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 text-tacir-darkblue border-0 font-medium">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(creathon.dates?.startDate)}
          </Badge>
        </div>
      </div>

      <CardContent className="space-y-2">
        <div>
          <CardTitle className="text-xl font-bold text-tacir-darkblue group-hover:text-tacir-blue text-center transition-colors line-clamp-2 mb-2">
            {creathon.title}
          </CardTitle>
          <CardDescription className="text-tacir-darkgray line-clamp-2">
            {creathon.description}
          </CardDescription>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-tacir-darkgray">
            <MapPin className="h-4 w-4 text-tacir-blue flex-shrink-0" />
            <span className="line-clamp-1">
              {creathon.location?.venue || "Lieu à définir"},{" "}
              {creathon.location?.city}
            </span>
          </div>
          <div className="flex items-center gap-3 text-tacir-darkgray">
            <Users className="h-4 w-4 text-tacir-blue flex-shrink-0" />
            <span>
              {creathon.capacity?.maxParticipants || 0} participants maximum
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
          <div className="flex flex-col items-center p-3 bg-tacir-lightgray/20 rounded-lg">
            <Users className="h-4 w-4 mb-1 text-tacir-blue" />
            <span className="font-bold text-tacir-darkblue">
              {creathon.capacity?.maxParticipants || 0}
            </span>
            <span className="text-tacir-darkgray">Participants</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-tacir-lightgray/20 rounded-lg">
            <BookOpen className="h-4 w-4 mb-1 text-tacir-lightblue" />
            <span className="font-bold text-tacir-darkblue">
              {creathon.mentors?.numberOfMentors || 0}
            </span>
            <span className="text-tacir-darkgray">Mentors</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-tacir-lightgray/20 rounded-lg">
            <Trophy className="h-4 w-4 mb-1 text-tacir-pink" />
            <span className="font-bold text-tacir-darkblue">
              {creathon.jury?.numberOfJuries || 0}
            </span>
            <span className="text-tacir-darkgray">Jurés</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-tacir-lightgray">
          <div>
            {validationStatus ? (
              <Badge className="bg-tacir-green text-white flex items-center gap-1 px-3 py-1">
                <CheckCircle className="h-3 w-3" />
                Validé
              </Badge>
            ) : (
              <Badge className="bg-tacir-yellow text-white px-3 py-1">
                À valider
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(creathon)}
              className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white h-9 w-9 p-0"
              title="Voir les détails"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(creathon)}
              className="border-tacir-lightblue text-tacir-lightblue hover:bg-tacir-lightblue hover:text-white h-9 w-9 p-0"
              title="Modifier"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {!validationStatus && (
              <Button
                size="sm"
                onClick={() => onValidateRequest(creathon)}
                className="bg-tacir-blue hover:bg-tacir-blue/90 h-9 px-3"
                title="Valider le créathon"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Valider
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
