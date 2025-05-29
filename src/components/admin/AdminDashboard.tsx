import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SalleResponseDTO } from '../../types/salle';
import type { Reservation } from '../../types/Reservation';
import { getAllSalles } from '../../services/salleService';
import { getAllReservations } from '../../services/reservationService';
import axios from 'axios';
import type { Utilisateur } from '../../types/Utilisateur';

// Define types for pending data and statistics
interface PendingData {
  reservations: number;
  users: number;
}

interface RoomStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number; // Based on current reservations
  blockedRooms: number; // Based on dispo: false
}

interface BookingStats {
  thisWeek: number;
  today: number;
  previousWeek: number; // Added previous week stat
  percentageChange: number; // Added percentage change
}

function AdminDashboard() {
  const [pendingData, setPendingData] = useState<PendingData | null>(null);
  const [roomStats, setRoomStats] = useState<RoomStats | null>(null); // Add state for room stats
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null); // Add state for booking stats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all necessary data
        const [roomsResponse, reservationsResponse]: [SalleResponseDTO[], Reservation[]] = await Promise.all([
          getAllSalles(),
          getAllReservations() // Fetch all reservations
        ]);

        // Simulate fetching pending users (replace with actual API call)
        // const simulatedPendingUsers = 2; // Example count - Removed

        // Calculate pending reservations
        const pendingReservations = reservationsResponse.filter(res => res.statut === 'EN_ATTENTE').length;

        // Fetch users from the backend
        const usersResponse = await axios.get('http://localhost:8080/api/utilisateurs'); // Replace with your actual API endpoint
        const allUsers: Utilisateur[] = usersResponse.data; // Assuming the response data is the array of users, specify Utilisateur type

        // Calculate pending users from fetched data
        const pendingUsers = allUsers.filter((user: Utilisateur) => user.status === 'EN_ATTENTE').length; // Adjust filtering based on your user object structure, use Utilisateur type

        setPendingData({
          reservations: pendingReservations,
          users: pendingUsers, // Use the actual pending users count
        });

        // Calculate Room Stats
        const totalRooms = roomsResponse.length;
        const blockedRooms = roomsResponse.filter((room: SalleResponseDTO) => room.dispo === false).length;
        
        const now = new Date();
        // Filter reservations that are currently active
        const currentlyActiveReservations = reservationsResponse.filter((res: Reservation) => {
          const startDate = new Date(res.dateDebut);
          const endDate = new Date(res.dateFin);
          // Check if the current time is within the reservation period
          return startDate <= now && endDate >= now;
        });
        
        // Count unique rooms with active reservations (occupied rooms)
        const occupiedRooms = new Set(currentlyActiveReservations.map(res => res.salle.id)).size;

        // Available rooms are those with dispo: true AND not currently occupied
        const availableRoomsCount = roomsResponse.filter((room: SalleResponseDTO) => room.dispo === true && !currentlyActiveReservations.some(res => res.salle.id === room.id)).length;

        setRoomStats({
          totalRooms,
          availableRooms: availableRoomsCount,
          occupiedRooms,
          blockedRooms,
        });

        // Calculate Booking Stats (This Week and Today)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of the current week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (6 - now.getDay())); // End of the current week (Saturday)
        endOfWeek.setHours(23, 59, 59, 999);

        const bookingsThisWeek = reservationsResponse.filter((res: Reservation) => {
          const startDate = new Date(res.dateDebut);
          return startDate >= startOfWeek && startDate <= endOfWeek;
        }).length;

        // Calculate Booking Stats (Previous Week)
        const startOfPreviousWeek = new Date(startOfWeek);
        startOfPreviousWeek.setDate(startOfWeek.getDate() - 7); // Start of previous week
        startOfPreviousWeek.setHours(0, 0, 0, 0);

        const endOfPreviousWeek = new Date(endOfWeek);
        endOfPreviousWeek.setDate(endOfWeek.getDate() - 7); // End of previous week
        endOfPreviousWeek.setHours(23, 59, 59, 999);

        const bookingsPreviousWeek = reservationsResponse.filter((res: Reservation) => {
            const startDate = new Date(res.dateDebut);
            return startDate >= startOfPreviousWeek && startDate <= endOfPreviousWeek;
        }).length;

        // Calculate percentage change
        const percentageChange = bookingsPreviousWeek === 0 
            ? (bookingsThisWeek > 0 ? 100 : 0) // Handle division by zero
            : ((bookingsThisWeek - bookingsPreviousWeek) / bookingsPreviousWeek) * 100;


        const bookingsToday = reservationsResponse.filter((res: Reservation) => {
          const startDate = new Date(res.dateDebut);
          // Check if the reservation starts today
          return startDate.toDateString() === now.toDateString();
        }).length;

        setBookingStats({
          thisWeek: bookingsThisWeek,
          today: bookingsToday,
          previousWeek: bookingsPreviousWeek,
          percentageChange: parseFloat(percentageChange.toFixed(1)), // Format to one decimal place
        });

      } catch (err: unknown) { // Changed type to unknown
        console.error('Error fetching data for dashboard:', err);
        let errorMessage = 'Erreur lors du chargement des données du tableau de bord.';

        if (axios.isAxiosError(err)) {
          console.error('Axios error details:', err.response?.data, err.response?.status);
          errorMessage = `Erreur API: ${err.response?.status || 'inconnu'} - ${err.response?.data?.message || err.message || 'Erreur inconnue'}`;
        } else if (err instanceof Error) {
          errorMessage = `Erreur: ${err.message}`;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval for periodic fetching (e.g., every 30 seconds)
    // const intervalId = setInterval(fetchData, 30000); // 30000 milliseconds = 30 seconds

    // // Clean up interval on component unmount
    // return () => clearInterval(intervalId);

  }, []); // Empty dependency array to run only once on mount

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-gray-600">Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  const hasPendingItems = pendingData && (pendingData.reservations > 0 || pendingData.users > 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h2>

      {/* Pending Items Section */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Éléments en attente</h2>

      {!hasPendingItems && pendingData && ( // Ensure pendingData is loaded before showing message
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
          Aucune nouvelle réservation ou utilisateur en attente.
        </div>
      )}

      {hasPendingItems && pendingData && ( // Ensure pendingData is loaded before showing cards
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"> {/* Added mb-8 for spacing below pending items */}
          {pendingData.reservations > 0 && (
            <div 
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/admin/reservations?status=EN_ATTENTE')}
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Réservations en attente</h3>
              <p className="text-3xl font-bold text-indigo-600">{pendingData.reservations}</p>
            </div>
          )}

          {pendingData.users > 0 && (
            <div 
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/admin/users?status=EN_ATTENTE')}
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Utilisateurs en attente</h3>
              <p className="text-3xl font-bold text-indigo-600">{pendingData.users}</p>
            </div>
          )}
        </div>
      )}

      {/* Statistics Cards */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-8">Statistiques générales</h2> {/* Added title and mt-8 for spacing */}
      {loading ? ( // Keep loading/error state for stats and charts
         <div className="flex justify-center items-center h-48">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
           <p className="ml-4 text-gray-600">Chargement des statistiques et graphiques...</p>
         </div>
      ) : error ? ( // Display error if fetching failed
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"> {/* Added mb-8 for spacing below stats */}
          {/* Booking This Week Card */}
          {bookingStats && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Réservations cette semaine</h3>
              <div className="flex items-center mb-4">
                <p className="text-3xl font-bold text-indigo-600 mr-4">{bookingStats.thisWeek}</p>
                {bookingStats.previousWeek !== undefined && ( // Only show percentage if previous week data is available
                  <span className={`text-sm font-semibold ${
                    bookingStats.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {bookingStats.percentageChange >= 0 ? '+' : ''}{bookingStats.percentageChange}%
                  </span>
                )}
              </div>
              {bookingStats.previousWeek !== undefined && (
                 <p className="text-sm text-gray-500">Semaine précédente: {bookingStats.previousWeek}</p>
              )}
            </div>
          )}

          {/* Today Activities Card */}
          {roomStats && bookingStats && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Activités aujourd'hui</h3>
              <div className="flex justify-around text-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-green-600">{roomStats.availableRooms}</p>
                  <p className="text-sm text-gray-500">Disponibles</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{roomStats.occupiedRooms}</p>
                  <p className="text-sm text-gray-500">Occupées</p>
                </div>
                 <div>
                  <p className="text-2xl font-bold text-yellow-600">{roomStats.blockedRooms}</p>
                  <p className="text-sm text-gray-500">Bloquées</p>
                </div>
              </div>
               <div className="text-center">
                <p className="text-xl font-bold text-indigo-600">{bookingStats.today} réservations aujourd'hui</p>
              </div>
            </div>
          )}

          {/* Total Rooms Card */}
           {roomStats && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total des Salles</h3>
              <p className="text-3xl font-bold text-indigo-600">{roomStats.totalRooms}</p>
            </div>
          )}
           {/* Placeholder for Total Revenue Card (if applicable later) */}
           {/* <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">Rs.XXk</p>
           </div> */}
            {/* Placeholder for Guest Card (if applicable later) */}
           {/* <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Guests</h3>
              <p className="text-3xl font-bold text-purple-600">YY</p>
           </div> */}
        </div>
      )}

    </div>
  );
}

export default AdminDashboard; 