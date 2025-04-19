import React, { useState, useEffect, useContext } from "react";
import MapComponent from "../components/LeafletMap";
import Sidebar from "../components/Sidebar";
import "../styles/home.css";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { DataContext } from "../components/contexts";
import { MDBIcon, MDBSpinner } from "mdb-react-ui-kit";

export default function Home() {
  const [userLocation, setUserLocation] = useState(null);
  const [garages, setGarages] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [selectedGarageDistance, setSelectedGarageDistance] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const { auth, setAuth } = useContext(DataContext);

  useEffect(() => {
    const fetchNearbyGarages = async (latitude, longitude) => {
      try {
        if (!auth) {
          setIsLoading(false);
          return;
        }
        
        const response = await api.get(`/garages/nearby?lat=${latitude}&lng=${longitude}`);
        
        if (response.status === 200) {
          setGarages(response.data);
          if (response.data.length > 0) {
            toast.success(`${response.data.length} garages found nearby`);
          } else {
            toast.info("No garages found in your area");
          }
        }
      } catch (error) {
        console.error("Error fetching garages:", error);
        toast.error("Failed to load nearby garages");
      } finally {
        setIsLoading(false);
      }
    };

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          fetchNearbyGarages(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(error.message);
          setIsLoading(false);
          
          // Show appropriate error message based on error code
          switch(error.code) {
            case error.PERMISSION_DENIED:
              toast.error("Location access denied. Please enable location services to find nearby garages.");
              break;
            case error.POSITION_UNAVAILABLE:
              toast.error("Location information is unavailable. Please try again later.");
              break;
            case error.TIMEOUT:
              toast.error("Location request timed out. Please try again.");
              break;
            default:
              toast.error("An unknown error occurred while getting your location.");
          }
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser");
      setIsLoading(false);
      toast.error("Geolocation is not supported by your browser");
    }
  }, [auth]);

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
    
    // Distance in meters with appropriate unit
    const distanceInMeters = R * c * 1000;
    
    if (distanceInMeters < 1000) {
      return `${distanceInMeters.toFixed(0)} m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(2)} km`;
    }
  };

  // Handle garage selection
  const handleGarageSelection = (garage) => {
    setSelectedGarage(garage);
    
    // Auto-open sidebar on mobile when a garage is selected
    setSidebarOpen(true);

    if (userLocation) {
      const distance = calculateDistance(
        userLocation[0], userLocation[1],
        garage.latitude, garage.longitude
      );
      setSelectedGarageDistance(distance);
    }
  };

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <MDBSpinner grow color="primary">
          <span className="visually-hidden">Loading...</span>
        </MDBSpinner>
        <p className="mt-3">Finding garages near you...</p>
      </div>
    );
  }

  if (locationError && !userLocation) {
    return (
      <div className="error-container">
        <MDBIcon fas icon="map-marker-alt" size="3x" className="text-danger mb-3" />
        <h4>Location Access Required</h4>
        <p>{locationError}</p>
        <p>Please enable location services in your browser to find nearby garages.</p>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`home-container ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Pass selectedGarageDistance to Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        selectedGarage={selectedGarage}
        selectedGarageDistance={selectedGarageDistance}
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
          />
        )}
        
        {/* Mobile sidebar toggle button - visible only on small screens */}
        <button 
          className="mobile-sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <MDBIcon fas icon={sidebarOpen ? "times" : "bars"} />
        </button>
        
        {/* Map controls for mobile */}
        <div className="map-mobile-controls">
          <button 
            className="locate-me-btn"
            onClick={() => {
              if (userLocation) {
                // Trigger map to recenter on user location
                // This would need to be implemented in your MapComponent
                const mapComponent = document.getElementById('map-component');
                if (mapComponent) {
                  mapComponent.dispatchEvent(new CustomEvent('recenter'));
                }
              }
            }}
            aria-label="Center map on my location"
          >
            <MDBIcon fas icon="location-arrow" />
          </button>
        </div>
      </div>
    </div>
  );
}