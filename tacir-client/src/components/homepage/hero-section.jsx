import Link from "next/link";
import { Button } from "../ui/button";
import { Check, Calendar, Users, Award, Gift } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  const benefitsList = [
    {
      title: "Mentors experts",
      description:
        "Apprenez directement auprès de professionnels de l'industrie ayant des années d'expérience.",
    },
    {
      title: "Projets pratiques",
      description:
        "Mettez en application vos connaissances immédiatement grâce à des exercices guidés.",
    },
    {
      title: "Opportunités de réseautage",
      description:
        "Connectez-vous avec des créateurs partageant les mêmes idées et des collaborateurs potentiels.",
    },
    {
      title: "Certificat de réussite",
      description:
        "Recevez une reconnaissance officielle de vos nouvelles compétences et connaissances.",
    },
    {
      title: "Prix honorables",
      description:
        "Des récompenses financières pour les meilleurs projets présentés durant les ateliers.",
    },
  ];

  return (
    <section className="relative px-10  overflow-hidden min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center">
          {/* Text Content - Centered */}
          <div className="space-y-4 flex flex-col items-center text-center lg:text-left lg:items-start">
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-2xl font-bold text-tacir-pink">
                Pourquoi nous rejoindre ?
              </h3>
              {benefitsList.map((benefit, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-tacir-lightblue" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-tacir-blue">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600 font-medium mt-1">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 w-full flex justify-center lg:justify-start">
              <Link href="/tacir-program/candidature">
                <Button className="bg-tacir-green hover:bg-green-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-transform hover:scale-105">
                  Postuler maintenant
                </Button>
              </Link>
            </div>
          </div>

          {/* Image Container - Centered with adjusted dimensions */}
          <div className="relative flex justify-center items-center w-full h-full">
            <div className="relative w-full max-w-4xl h-[550px] overflow-hidden">
              <Image
                src="/images/hero.png"
                alt="tacir-program"
                fill
                quality={100}
                style={{ objectFit: "cover" }}
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
