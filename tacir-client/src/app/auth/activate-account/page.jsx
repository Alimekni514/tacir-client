"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { activateAccount } from "@/services/auth/activate";
import { Eye, EyeOff, Check, X } from "lucide-react";

// Enhanced password validation schema
const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
      .regex(/[a-z]/, "Doit contenir au moins une minuscule")
      .regex(/[0-9]/, "Doit contenir au moins un chiffre")
      .regex(/[^A-Za-z0-9]/, "Doit contenir au moins un caractère spécial"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  });

export default function ActivateAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = form.watch("password");

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  const onSubmit = async (values) => {
    if (!userId) {
      toast.error("Lien d'activation invalide");
      return;
    }

    setLoading(true);

    try {
      const response = await activateAccount({
        userId,
        newPassword: values.password,
      });

      if (response.success) {
        toast.success("Compte activé avec succès!");
        router.push("/auth/login");
      } else {
        toast.error(response.error || "Échec de l'activation");
      }
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center max-h-screen bg-gradient-to-br from-tacir-lightgray to-gray-100 px-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tacir-darkblue my-8">
            Activation du Compte
          </h1>
          <p className="text-tacir-darkgray">
            Créez un mot de passe sécurisé pour votre compte
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Password field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Saisissez un mot de passe sécurisé"
                      {...field}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-tacir-darkgray hover:text-tacir-blue"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormMessage />

                  {/* Password strength meter */}
                  <div className="mt-2">
                    <div className="flex gap-1 h-1 mb-2">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-full w-full rounded-full ${
                            i < passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-tacir-darkgray space-y-2">
                      <div className="flex items-center gap-2">
                        {password.length >= 8 ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <X className="w-3 h-3 text-red-500" />
                        )}
                        <span>Minimum 8 caractères</span>
                      </div>
                      <div className="flex items-center gap-2">
                        /[A-Z]/.test(password) ? (
                        <Check className="w-3 h-3 text-green-500" />
                        ) : (
                        <X className="w-3 h-3 text-red-500" />
                        )
                        <span>Au moins une majuscule</span>
                      </div>
                      <div className="flex items-center gap-2">
                        /[0-9]/.test(password) ? (
                        <Check className="w-3 h-3 text-green-500" />
                        ) : (
                        <X className="w-3 h-3 text-red-500" />
                        )
                        <span>Au moins un chiffre</span>
                      </div>
                      <div className="flex items-center gap-2">
                        /[^A-Za-z0-9]/.test(password) ? (
                        <Check className="w-3 h-3 text-green-500" />
                        ) : (
                        <X className="w-3 h-3 text-red-500" />
                        )
                        <span>Au moins un caractère spécial</span>
                      </div>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Confirm password field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              className="mt-4"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmez le mot de passe</FormLabel>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmez votre mot de passe"
                      {...field}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute py-4 right-3 top-1/2 -translate-y-1/2 text-tacir-darkgray hover:text-tacir-blue"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-tacir-green text-white hover:from-green-600 hover:to-tacir-green transition-all duration-300"
              disabled={loading || passwordStrength < 4}
            >
              {loading ? "Activation en cours..." : "Activer le compte"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
