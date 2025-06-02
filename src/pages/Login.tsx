import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import type { Utilisateur } from '../types/Utilisateur';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    const loginData = {
      email,
      password
    };

    try {
      console.log('Attempting login with:', loginData);
      const response = await axios.post<Utilisateur>('http://localhost:8080/api/utilisateurs/login', loginData);
      console.log('Login response:', response.data);

      if (response.status === 200) {
        const userData = response.data;

        console.log('User data:', userData);

        if (userData.status === 'CONFIRMEE') {
          localStorage.setItem("user", JSON.stringify(userData));
          console.log('Navigating to rooms page...');
          navigate("/salles");
        } else if (userData.status === 'EN_ATTENTE') {
          setErrorMessage('Votre compte est en attente de confirmation par l\'administrateur.');
        } else if (userData.status === 'REJETE') {
          setErrorMessage('Votre compte a été rejeté. Veuillez contacter l\'administrateur.');
        } else {
          // Handle unexpected status
          setErrorMessage('Statut utilisateur inconnu. Veuillez contacter l\'administrateur.');
        }
      } else {
        setErrorMessage('Erreur de connexion, veuillez vérifier vos informations.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        if (error.response?.status === 401 || error.response?.status === 403) {
             setErrorMessage('Identifiants incorrects.');
        } else {
             setErrorMessage('Une erreur est survenue lors de la connexion.');
        }
      } else {
        setErrorMessage('Une erreur est survenue lors de la connexion.');
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Réservation des salles</h1>
        <h2 className="text-lg text-center text-gray-500 mb-6">Système de réservation de salles universitaires</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@um5r.ac.ma"
              className="w-full p-2 border border-gray-300 rounded-md mt-2"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full p-2 border border-gray-300 rounded-md mt-2"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="mr-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-600">Se souvenir de moi</label>
            </div>
            <a href="#" className="text-sm text-blue-500">Mot de passe oublié ?</a>
          </div>

          {errorMessage && (
            <div className="text-red-500 text-sm text-center">{errorMessage}</div>
          )}

          <button 
            type="submit" 
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/register')}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Créer un compte
          </button>
        </div>

        <div className="mt-4 text-center text-sm">
          <span>Besoin d'aide ? </span>
          <a href="#" className="text-blue-500">Contactez le support</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
