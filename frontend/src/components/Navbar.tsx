import React, { useState } from "react";
import { Home, Info, Phone, LogIn, ClipboardList, Menu, X } from "lucide-react";

interface NavbarProps {
  onNavLinkClick: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavLinkClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "test", label: "Realizar Test", icon: ClipboardList },
    { id: "about", label: "Acerca de", icon: Info },
    { id: "login", label: "Iniciar Sesión", icon: LogIn },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg fixed top-[5px] left-1/2 -translate-x-1/2 w-[calc(100%-10px)] z-50 rounded-xl">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg md:text-xl font-semibold text-gray-800 tracking-wide">
          Detección de Alzheimer
        </h1>

        <button
          className="md:hidden text-gray-800 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="hidden md:flex space-x-6 items-center">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavLinkClick(id)}
              className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
            >
              <Icon size={18} className="mr-1" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Menú desplegable (móvil) */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-gray-100">
          <div className="flex flex-col space-y-2 p-4">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  onNavLinkClick(id);
                  setMenuOpen(false);
                }}
                className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors duration-150 py-1"
              >
                <Icon size={18} className="mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
