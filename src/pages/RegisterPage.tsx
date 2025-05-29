import React, { useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    setIsError(false);

    try {
      console.log('Attempting registration with:', formData);
      const response = await axios.post('http://localhost:8080/api/utilisateurs', formData);
      console.log('Registration response:', response.data);

      if (response.status === 200 || response.status === 201) {
        setMessage('Inscription réussie. Votre compte est en attente de confirmation par l\'administrateur.');
        // Optionally navigate to login page after a delay or on button click
        // navigate('/login');
      } else {
        setIsError(true);
        setMessage(response.data?.message || 'Une erreur est survenue lors de l\'inscription.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setIsError(true);
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.');
      } else {
        setMessage('Une erreur est survenue lors de l\'inscription.');
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Créer un compte</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="email@university.fr"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="********"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {message && (
            <div className={`text-sm text-center ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</div>
          )}

          <button 
            type="submit" 
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Créer le compte
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          Déjà un compte ? {' '} 
          <button onClick={() => navigate('/')} className="font-medium text-blue-600 hover:text-blue-500">Se connecter</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
