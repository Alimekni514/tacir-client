import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown, Eye, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
const CreathonTable = ({
  creathons,
  onView,
  onEdit,
  onValidateRequest,
  formatDate,
  sortConfig,
  requestSort,
}) => {
  const getClassNamesFor = (name) => {
    if (!sortConfig) return;
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="rounded-md border border-tacir-lightgray overflow-hidden">
        <Table>
          <TableHeader className="bg-tacir-lightgray/30">
            <TableRow>
              <TableHead
                className="text-tacir-darkblue font-semibold cursor-pointer"
                onClick={() => requestSort("title")}
              >
                <div className="flex items-center">
                  Titre
                  {getClassNamesFor("title") === "ascending" ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : getClassNamesFor("title") === "descending" ? (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  ) : null}
                </div>
              </TableHead>
              <TableHead className="text-tacir-darkblue font-semibold">
                Lieu
              </TableHead>
              <TableHead className="text-tacir-darkblue font-semibold">
                Dates
              </TableHead>
              <TableHead className="text-tacir-darkblue font-semibold">
                Participants
              </TableHead>
              <TableHead className="text-tacir-darkblue font-semibold">
                Statut
              </TableHead>
              <TableHead className="text-tacir-darkblue font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creathons.length > 0 ? (
              creathons.map((creathon) => {
                const validationStatus =
                  creathon.validations?.componentValidation?.validatedAt;

                return (
                  <TableRow
                    key={creathon._id}
                    className="hover:bg-tacir-lightgray/20"
                  >
                    <TableCell className="font-medium text-tacir-darkblue">
                      {creathon.title}
                    </TableCell>
                    <TableCell className="text-tacir-darkgray">
                      {creathon.location?.venue || "Lieu non spécifié"},{" "}
                      {creathon.location?.city}
                    </TableCell>
                    <TableCell className="text-tacir-darkgray">
                      {formatDate(creathon.dates?.startDate)} -{" "}
                      {formatDate(creathon.dates?.endDate)}
                    </TableCell>
                    <TableCell className="text-tacir-darkgray">
                      {creathon.capacity?.maxParticipants || 0} participants
                    </TableCell>
                    <TableCell>
                      {validationStatus ? (
                        <Badge variant="success" className="bg-tacir-green">
                          Validé
                        </Badge>
                      ) : (
                        <Badge
                          variant="warning"
                          className="bg-tacir-yellow text-white"
                        >
                          À valider
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!validationStatus && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onValidateRequest(creathon)}
                            className="bg-tacir-blue hover:bg-tacir-blue/90"
                          >
                            Valider
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(creathon)}
                          className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(creathon)}
                          className="border-tacir-lightblue text-tacir-lightblue hover:bg-tacir-lightblue hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-tacir-darkgray"
                >
                  Aucun créathon trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CreathonTable;
