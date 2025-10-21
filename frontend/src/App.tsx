import React, { useState } from 'react';
import Navbar from './components/Navbar';

import TestPage from './pages/TestPage'; 
import Footer from './components/Footer'; 
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';

import backgroundImage from './assets/image1.jpg';


function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavLinkClick = (page: string) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'test':
      // Añadimos un wrapper para elevar el TestPage por encima del overlay
      return (
        <div className="relative z-10 flex justify-center items-center min-h-[calc(100vh-80px)] p-4"> 
          <TestPage />
        </div>
      );
      case 'login':
         return <LoginPage />;
      case 'about':
        return (
            <div className="relative z-10 flex justify-center items-center pt-24 min-h-[calc(100vh-80px)] p-4">
              <AboutPage />
            </div>
        );
      default:
        // Contenido de la página de inicio
        return (
          <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 text-center">
            <h2 className="text-white text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              Bienvenido a la Plataforma de Detección de Alzheimer
            </h2>
            <p className="text-white text-xl md:text-2xl mb-8 max-w-2xl drop-shadow-md">
              ¡Detecta el Alzheimer a Tiempo! Una plataforma que monitorea tu salud cognitiva
            </p>
            <button
              onClick={() => handleNavLinkClick('test')}
              className="bg-white text-gray-800 font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-gray-200 transition-colors duration-300 transform hover:scale-105"
            >
              Realizar Test
            </button>
          </main>
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <Navbar onNavLinkClick={handleNavLinkClick} />

      {/* 2. Llama a la función que renderiza el contenido dinámicamente */}
      {renderContent()}
      <Footer />
    </div>
  );
}

export default App;