"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "react-toastify";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { loginAction } from "../../../features/login/login-action";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react"; // Import des icônes

const formSchema = z.object({
  email: z.string().email({ message: "Addresse email invalide " }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
});

export default function LoginSection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // État pour afficher/masquer le mot de passe

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await loginAction(data);

      if (response.isArchived) {
        const message =
          response.message ||
          "Votre compte a été archivé. Vous n'avez plus accès.";
        setErrorMessage(message);
        setIsLoading(false);
        return;
      }

      if (response.requiresActivation) {
        toast.info(response.message);
        router.push(`/auth/activate-account?id=${response.userId}`);
        return;
      }

      if (!response.success) {
        setErrorMessage(response.error || "Échec de la connexion");
        toast.error(response.error || "Échec de la connexion");
        return;
      }

      toast.success("Connexion réussie!");

      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get("redirect");

      let finalRedirect = response.redirect || "/dashboard";

      if (redirectParam && redirectParam !== "/auth/login") {
        finalRedirect = redirectParam;
      }

      router.push(finalRedirect);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Une erreur inattendue s'est produite");
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 px-10 py-10">
      <div className="flex flex-col items-center justify-center">
        <h2 className="my-2 text-3xl font-bold text-center text-tacir-darkblue uppercase tracking-wide">
          Bienvenue dans le programme de TACIR
        </h2>
        <span className="font-medium tracking-wide text-tacir-darkgray ">
          Se connecter à votre compte !
        </span>
      </div>

      {errorMessage && (
        <div className="w-full max-w-md p-4 mb-4 text-red-600 bg-red-50 border border-red-200 rounded-md text-sm text-center">
          {errorMessage}
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-md"
        >
          <div className="space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Saisir votre email"
                    disabled={isLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field avec icône œil */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Mot de passe</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Saisir votre mot de passe"
                      disabled={isLoading}
                      className="pr-10" // Ajoute du padding à droite pour l'icône
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-tacir-green hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Se Connecter"}
            </Button>
          </div>
        </form>
      </Form>

      <div className="flex items-center gap-2">
        <p className="tracking-wide text-tacir-darkgray">
          Vous avez oublié votre mot de passe ?
        </p>
        <Link
          className="tracking-wider underline text-tacir-lightblue"
          href="/forgot-password"
        >
          Cliquez ici
        </Link>
      </div>
    </div>
  );
}
