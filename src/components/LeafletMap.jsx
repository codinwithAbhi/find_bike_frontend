import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Polyline, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/home.css";

// Marker Icons
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
});

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconSize: [25, 41],
});

const highlightedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  iconSize: [30, 50], // Bigger when selected
});

// 📍 Trigger map resize when sidebar toggles
const ResizeMap = ({ sidebarOpen }) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize(); // Force map to recalculate its dimensions
  }, [sidebarOpen]);

  return null;
};

const getCurveMidpoint = (start, end) => {
  const latMid = (start[0] + end[0]) / 2;
  const lngMid = (start[1] + end[1]) / 2;

  // Add slight offset to create a curve effect
  const latOffset = (end[0] - start[0]) * 0.2;
  const lngOffset = (end[1] - start[1]) * -0.2; // Negative to curve in the opposite direction

  return [latMid + latOffset, lngMid + lngOffset];
};

const MapComponent = ({ center, userLocation, zoom = 13, setSidebarOpen, markers = [], setSelectedGarage, selectedGarage, selectedGarageDistance }) => {
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);

  return (
    <MapContainer center={center} zoom={zoom} className="leaflet-map">
      <ResizeMap sidebarOpen={setSidebarOpen} /> {/* Trigger resizing */}

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* User Location with Circle */}
      {userLocation && (
        <>
          <Marker position={userLocation} icon={redIcon} />
          <Circle
            center={userLocation}
            radius={1000} 
            pathOptions={{
              color: "blue",
              fillColor: "rgba(0, 0, 255, 0.2)",
              fillOpacity: 0.3,
            }}
          />
        </>
      )}

      {/* Garage Markers */}
      {markers.map((garage) => (
        <Marker
          key={garage._id}
          position={[garage.latitude, garage.longitude]}
          icon={selectedMarkerId === garage._id ? highlightedIcon : blueIcon}
          eventHandlers={{
            click: () => {
              setSelectedMarkerId(garage._id);
              setSelectedGarage(garage);
              setSidebarOpen(true);
            },
          }}
        >
          <Popup>
            {garage.garageName} <br />
            📍 Distance: {selectedGarage && selectedMarkerId === garage._id ? (
              <span>{selectedGarageDistance} meters</span>
            ) : "Click to calculate"}
          </Popup>
        </Marker>
      ))}

      {/* Draw line between User & Selected Garage */}
      {userLocation && selectedGarage && (
        <Polyline
          positions={[
            userLocation,
            getCurveMidpoint(userLocation, [selectedGarage.latitude, selectedGarage.longitude]), // Midpoint for curve
            [selectedGarage.latitude, selectedGarage.longitude],
          ]}
          pathOptions={{
            color: "black",
            weight: 3,
            dashArray: "6, 6", // Dashed line
          }}
        />
      )}
    </MapContainer>
  );
};

export default MapComponent;
