import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Login = () => {
const navigate = useNavigate();
  const [email, setEmail] = useState('email@university.fr');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginData = {
      email,
      password
    };

    try {
      const response = await axios.post('http://localhost:8080/api/utilisateurs/login', loginData);

      if (response.status === 200) {
        // If the login is successful, you can redirect the user
        console.log(response.data);

        const userData = response.data;
        console.log(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        if(userData.role === "PROFESSOR"){
            navigate("/salles");
        }

      }
    } catch (error) {
      // Handle the error when login fails
      setErrorMessage('Erreur de connexion, veuillez vérifier vos informations.');
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
              placeholder="email@university.fr"
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

          {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

          <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Se connecter
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span>Besoin d'aide ? </span>
          <a href="#" className="text-blue-500">Contactez le support</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
