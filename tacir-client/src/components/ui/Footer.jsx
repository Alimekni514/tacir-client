import Link from "next/link";
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="bg-tacir-lightgray text-tacir-darkblue pt-8 pb-4"
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-8">
          <div className="col-span-1">
            <h3 className="text-2xl font-bold mb-4">Programme Tacir</h3>
            <div className="text-wrap">
              <span>
                {" "}
                <span className="font-bold text-tacir-blue">T</span>alents
              </span>
              <span className="text-tacir-blue">
                {" "}
                <span className="font-bold text-tacir-pink">A</span>rts
              </span>
              <span>
                {" "}
                <span className="font-bold text-tacir-green">C</span>réativité
              </span>
              <span>
                {" "}
                <span className="font-bold text-tacir-lightblue">I</span>
                nclusion
              </span>
              <span>
                {" "}
                <span className="font-bold text-tacir-yellow">R</span>
                echerche
              </span>
            </div>
            <p className="text-tacir-darkblue font-semibold mt-2">
              Nous sommes dédiés à fournir des opportunités innovantes pour les
              talents créatifs et techniques.
            </p>
          </div>

          <div className="ml-8">
            <h4 className="font-semibold text-lg mb-4">Liens Rapides</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-gray-700 hover:text-white transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="#workshops"
                  className="text-gray-700 hover:text-white transition-colors"
                >
                  Workshops
                </Link>
              </li>
              <li>
                <Link
                  href="#partners"
                  className="text-gray-700 hover:text-white transition-colors"
                >
                  Partenaires
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-700 hover:text-white transition-colors"
                >
                  À Propos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-700 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-700 hover:text-white transition-colors"
                >
                  Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-700 hover:text-white transition-colors"
                >
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-700">
              <li>Email: contact@organization.com</li>
              <li>Téléphone: +33 1 23 45 67 89</li>
              <li>Adresse: 123 Rue Principale, Tunis</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-600 text-sm">
          <p>&copy; {currentYear} Organization. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
