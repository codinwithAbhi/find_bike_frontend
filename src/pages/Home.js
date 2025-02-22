import React, { useState, useEffect, useContext } from "react";
import MapComponent from "../components/LeafletMap";
import Sidebar from "../components/Sidebar";
import "../styles/home.css";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { DataContext } from "../components/contexts";

export default function Home() {
  const [userLocation, setUserLocation] = useState(null);
  const [garages, setGarages] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [selectedGarageDistance, setSelectedGarageDistance] = useState(null); // [NEW] Distance
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { auth, setAuth } = useContext(DataContext);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          if(auth){
            const response = await api.get(`/garages/nearby?lat=${latitude}&lng=${longitude}`);
            if (response.status === 200) {
              setGarages(response.data);
              if (response.data.length > 0) {
                toast.success("Garage data found near by you");
              } else {
                toast.success("No garage data found nearby");
              }
            } else {
              toast.error("No garage nearby!");
            }
          }
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  // Function to calculate distance using Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRadians = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km

    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance in meters
  };

  // Handle garage selection
  const handleGarageSelection = (garage) => {
    setSelectedGarage(garage);
    setSidebarOpen(true);

    if (userLocation) {
      const distance = calculateDistance(
        userLocation[0], userLocation[1],
        garage.latitude, garage.longitude
      );
      setSelectedGarageDistance(distance.toFixed(2)); // Store distance in meters
    }
  };

  return (
    <div className={`home-container ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        selectedGarage={selectedGarage}
        selectedGarageDistance={selectedGarageDistance} // [NEW]
        closeGarage={() => setSelectedGarage(null)}
      />

      <div className="map-container">
        {userLocation && (
          <MapComponent
            center={userLocation}
            userLocation={userLocation}
            markers={garages}
            setSidebarOpen={setSidebarOpen}
            setSelectedGarage={handleGarageSelection}
            selectedGarage={selectedGarage}
            selectedGarageDistance={selectedGarageDistance}
          />
        )}
      </div>
    </div>
  );
}
