import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white p-6 text-center">
      <div className="container mx-auto">
        <p className="text-sm mb-2">
          © {new Date().getFullYear()} Detección de Alzheimer. Todos los derechos reservados.
        </p>
        <p className="text-xs">
          Aviso: Esta página y sus herramientas tienen fines exclusivamente educativos. 
          No constituyen un diagnóstico médico y no reemplazan la consulta con un profesional de la salud calificado.
        </p>
      </div>
    </footer>
  );
};

export default Footer;