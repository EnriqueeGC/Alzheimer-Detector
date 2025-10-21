import React, { useState } from 'react';
import RegisterModal from '../components/RegisterModal'; 

const LoginPage: React.FC = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manejador genérico para actualizar el estado del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardamos el token JWT en el almacenamiento local
      console.log('Login exitoso, token:', data.token);
      localStorage.setItem('userToken', data.token);
      
      // Aquí podrías redirigir al usuario, por ejemplo:
      // window.location.href = '/dashboard';

    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }; 

  return (
    <>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 text-white">
        
        {/* Tarjeta central de login */}
        <div className="container mx-auto max-w-md bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 md:p-8">
          <div className="text-gray-800 text-left">
            
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              Iniciar Sesión
            </h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Correo Electrónico
                </label>
                <input 
                  type="email"
                  id="email"
                  name="email" 
                  value={formData.email} // Conectamos el estado
                  onChange={handleInputChange} // Conectamos el handler
                  placeholder="tu@correo.com"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                />
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contraseña
                </label>
                <input 
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password} // Conectamos el estado
                  onChange={handleInputChange} // Conectamos el handler
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                />
              </div>

              <div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-105"
                  disabled={isLoading} 
                >
                  {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-600 mt-8">
              ¿No tienes cuenta?{' '}
              <button 
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Regístrate aquí
              </button>
            </p>

          </div>
        </div>
      </div>

      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
      />
    </>
  );
};

export default LoginPage;