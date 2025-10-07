"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { addMember } from "../../services/users/members";
import { getRegions } from "@/services/users/regions";

const roleOptions = [
  { value: "admin", label: "Administrateur" },
  { value: "mentor", label: "Mentor" },
  { value: "projectHolder", label: "Porteur de projet" },
  { value: "IncubationCoordinator", label: "Coordinateur d'incubation" },
  { value: "ComponentCoordinator", label: "Coordinateur de composante" },
  { value: "RegionalCoordinator", label: "Coordinateur régional" },
];

// ✅ Corrected schema
const formSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est obligatoire"),
    lastName: z.string().min(1, "Le nom est obligatoire"),
    email: z.string().email("Adresse email invalide"),
    role: z.string().min(1, "Le rôle est obligatoire"),
    region: z.string().optional(),
    component: z.string().optional(), // ✅ Added optional()
  })
  .superRefine((data, ctx) => {
    if (data.role === "RegionalCoordinator" && !data.region) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La région est obligatoire pour les coordinateurs régionaux",
        path: ["region"],
      });
    }
  })
  .superRefine((data, ctx) => {
    if (data.role === "ComponentCoordinator" && !data.component) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Le composant est obligatoire pour les coordinateurs de composante",
        path: ["component"],
      });
    }
  });

export default function AddMemberForm({ onSuccess }) {
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      region: "",
      component: "",
    },
  });

  const role = form.watch("role");

  useEffect(() => {
    const fetchRegions = async () => {
      if (role === "RegionalCoordinator") {
        setLoadingRegions(true);
        try {
          const regionsData = await getRegions();
          setRegions(regionsData);
        } catch (error) {
          toast.error("Erreur lors du chargement des régions");
        } finally {
          setLoadingRegions(false);
        }
      }
    };
    fetchRegions();
  }, [role]);

  const onSubmit = async (data) => {
    try {
      const memberData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        ...(data.role === "RegionalCoordinator" && { region: data.region }),
        ...(data.role === "ComponentCoordinator" && {
          component: data.component,
        }),
      };

      await addMember(memberData);
      toast.success("Membre créé avec succès !");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(error.message || "Erreur lors de la création du membre");
    }
  };

  return (
    <div className="max-w-3xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Ajouter un nouveau membre
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Entrez le prénom" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Entrez le nom" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Entrez l'email" type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role Select */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rôle</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roleOptions.map((roleOption) => (
                      <SelectItem
                        key={roleOption.value}
                        value={roleOption.value}
                      >
                        {roleOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Region Select - Conditional Rendering */}
          {role === "RegionalCoordinator" && (
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Région</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingRegions}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingRegions
                              ? "Chargement des régions..."
                              : "Sélectionnez une région"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region._id} value={region._id}>
                          {region.name.fr} / {region.name.ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Component Select - Conditional Rendering */}
          {role === "ComponentCoordinator" && (
            <FormField
              control={form.control}
              name="component"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Composante</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez entre Crea ou Inov" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="crea">Crea</SelectItem>
                      <SelectItem value="inov">Inov</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button
            type="submit"
            className="w-full bg-tacir-green hover:bg-green-700"
          >
            Créer le membre
          </Button>
        </form>
      </Form>
    </div>
  );
}
