"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="">
            <Link href="/">
              <Image
                src="/images/tacir-logo.png"
                alt="tacir-logo"
                width={200}
                height={200}
                style={{ height: "40px", width: "200px" }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="#"
              className="text-gray-700 hover:text-brand-blue transition-colors"
            >
              Accueil
            </Link>
            <Link
              href="#workshops"
              className="text-gray-700 hover:text-brand-blue transition-colors"
            >
              Workshops
            </Link>
            <Link
              href="#partners"
              className="text-gray-700 hover:text-brand-blue transition-colors"
            >
              Partenaires
            </Link>
            <Link
              href="#contact"
              className="text-gray-700 hover:text-brand-blue transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button className="bg-tacir-yellow hover:bg-tacir-orange p-6 text-white">
              <Link href={"/auth/login"}>Se Connecter</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-brand-blue focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 space-y-3">
            <Link
              href="#"
              className="block text-gray-700 hover:text-brand-blue transition-colors px-3 py-2 rounded-md"
            >
              Accueil
            </Link>
            <Link
              href="#workshops"
              className="block text-gray-700 hover:text-brand-blue transition-colors px-3 py-2 rounded-md"
            >
              Workshops
            </Link>
            <Link
              href="#partners"
              className="block text-gray-700 hover:text-brand-blue transition-colors px-3 py-2 rounded-md"
            >
              Partenaires
            </Link>
            <Link
              href="#contact"
              className="block text-gray-700 hover:text-brand-blue transition-colors px-3 py-2 rounded-md"
            >
              Contact
            </Link>
            <div className="pt-2">
              <Button className="bg-brand-blue hover:bg-brand-lightBlue text-white w-full">
                S'inscrire
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
