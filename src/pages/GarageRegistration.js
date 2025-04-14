import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { MDBBtn, MDBInput, MDBContainer } from "mdb-react-ui-kit";
import { motion } from "framer-motion";
import Select from "react-select";
import L from "leaflet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/GarageFormWithMap.css"; // Make sure to update your CSS path
import api from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import md5 from "md5";

// Fix for default marker icons not displaying
let DefaultIcon = L.Icon.Default.prototype.options;
DefaultIcon.iconUrl = icon;
DefaultIcon.shadowUrl = iconShadow;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon,
  iconUrl: icon,
  shadowUrl: iconShadow
});

// Custom Red Marker Icon
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: iconShadow,
  shadowSize: [41, 41]
});

// Custom hook to handle map clicks
const LocationMarker = ({ setLat, setLng }) => {
  useMapEvents({
    click(e) {
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
    },
  });

  return null;
};

const GarageFormWithMap = () => {
  const [lat, setLat] = useState(18.55758233402414);
  const [lng, setLng] = useState(73.92808318120288);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    garageName: "",
    address: "",
    contactNumber: "",
    serviceType: [],
    vehicleType: null,
  });
  const navigate = useNavigate();

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLat(latitude);
          setLng(longitude);
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const serviceOptions = {
    bike: [
      { label: "Tyre Pressure", value: "Tyre Pressure" },
      { label: "Air Filter", value: "Air Filter" },
      { label: "Brakes", value: "Brakes" },
      { label: "Bottom Bracket Check", value: "Bottom Bracket Check" },
      { label: "Brake Adjustment", value: "Brake Adjustment" },
      { label: "Cable and Housing Inspection", value: "Cable and Housing Inspection" },
      { label: "Chain Sprocket Lubrication", value: "Chain Sprocket Lubrication" },
      { label: "Check Brake Pads", value: "Check Brake Pads" },
      { label: "Check Suspension", value: "Check Suspension" },
      { label: "Coolant Level and Condition", value: "Coolant Level and Condition" },
      { label: "Fork", value: "Fork" },
      { label: "Fuel Filter", value: "Fuel Filter" },
      { label: "Full Wheel Truing", value: "Full Wheel Truing" },
      { label: "Headset Adjustment", value: "Headset Adjustment" },
      { label: "Monitoring of Oil Circulation", value: "Monitoring of Oil Circulation" },
      { label: "Sparkplug Clearance Adjustment", value: "Sparkplug Clearance Adjustment" },
      { label: "Wheel Bearings", value: "Wheel Bearings" }
    ],
    car: [
      { label: "Oil Filter", value: "Oil Filter" },
      { label: "Air Filter", value: "Air Filter" },
      { label: "Spark Plugs", value: "Spark Plugs" },
      { label: "Wheel Alignment", value: "Wheel Alignment" },
      { label: "Check Steering and Suspension", value: "Check Steering and Suspension" },
      { label: "Cabin Air Filter", value: "Cabin Air Filter" },
      { label: "Engine Oil", value: "Engine Oil" },
      { label: "Air Conditioning System Inspection", value: "Air Conditioning System Inspection" },
      { label: "Brake Check", value: "Brake Check" },
      { label: "Rotate Tires", value: "Rotate Tires" },
      { label: "Battery Test", value: "Battery Test" },
      { label: "Car Wipers", value: "Car Wipers" },
      { label: "Gearbox Oil", value: "Gearbox Oil" },
      { label: "Cleaning", value: "Cleaning" },
      { label: "Interim Service", value: "Interim Service" },
      { label: "Battery", value: "Battery" },
      { label: "Oil Change", value: "Oil Change" },
      { label: "Check Tyre Pressures", value: "Check Tyre Pressures" },
      { label: "Brakes", value: "Brakes" },
      { label: "Check Coolant Hoses", value: "Check Coolant Hoses" },
      { label: "Tyres", value: "Tyres" },
      { label: "Coolant", value: "Coolant" },
      { label: "Lights", value: "Lights" },
      { label: "Check Coolant Levels", value: "Check Coolant Levels" }
    ]
  };

  const vehicleOptions = [
    { label: "Bike", value: "bike" },
    { label: "Car", value: "car" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      toast.error("Please upload an image.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    setImage(file);

    // Preview Image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Validate Form Before Submission
  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.garageName.trim()) newErrors.push("Garage name is required.");
    if (!formData.address.trim()) newErrors.push("Address is required.");
    if (!formData.email.trim()) newErrors.push("Email is required.");
    if (!formData.password.trim()) newErrors.push("Password is required.");
    if (!formData.contactNumber.trim()) newErrors.push("Contact number is required.");
    if (formData.serviceType.length === 0) newErrors.push("Select at least one service.");
    if (!formData.vehicleType) newErrors.push("Select a vehicle type.");
    if (!image) newErrors.push("Please upload an image.");
    
    if (newErrors.length > 0) {
      newErrors.forEach((err) => toast.error(err));
      return false;
    }
    return true;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("garageName", formData.garageName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", md5(formData.password));
    formDataToSend.append("contact", formData.contactNumber);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("serviceType", JSON.stringify(formData.serviceType.map((s) => s.value)));
    formDataToSend.append("vehicleType", formData.vehicleType.value);
    formDataToSend.append("latitude", lat);
    formDataToSend.append("longitude", lng);
    formDataToSend.append("image", image);

    try {
      const response = await api.post("/garages/garageregistration", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast.success("Garage Registered Successfully! 🚀");
        // Reset Form
        setFormData({
          email: "",
          password: "",
          garageName: "",
          address: "",
          contactNumber: "",
          serviceType: [],
          vehicleType: null,
        });

        setImage(null);
        setPreview(null);
        navigate("/garage/login");
      }
    } catch (error) {
      toast.error("Error submitting form. Please try again.");
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="full-page-container">
      <MDBContainer className="garage-container">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Left side: Leaflet Map */}
        <div className="map-container">
          <MapContainer 
            center={[lat, lng]} 
            zoom={13} 
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[lat, lng]} icon={redIcon} />
            <LocationMarker setLat={setLat} setLng={setLng} />
            {/* This ensures the map resizes correctly */}
            {(() => {
              const MapResizer = () => {
                const map = useMapEvents({
                  resize: () => {
                    map.invalidateSize();
                  }
                });
                
                // Force resize when component mounts
                useEffect(() => {
                  setTimeout(() => {
                    map.invalidateSize();
                  }, 300);
                }, [map]);
                
                return null;
              };
              return <MapResizer />;
            })()}
          </MapContainer>
        </div>

        {/* Right side: Form */}
        <div className="form-container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="form-title">Garage Registration</h3>
            
            <label className="form-label">Email</label>
            <MDBInput
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="form-field"
              placeholder="Enter email"
            />

            <label className="form-label">Password</label>
            <MDBInput
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="form-field"
              placeholder="Enter password"
            />

            <label className="form-label">Garage Name</label>
            <MDBInput
              name="garageName"
              value={formData.garageName}
              onChange={handleChange}
              className="form-field"
              placeholder="Enter garage name"
            />

            <label className="form-label">Address</label>
            <MDBInput
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-field"
              placeholder="Enter address"
            />

            <label className="form-label">Contact Number</label>
            <MDBInput
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="form-field"
              type="tel"
              placeholder="Enter contact number"
              required
            />

            <label className="form-label">Select Vehicle Type</label>
            <Select
              options={vehicleOptions}
              value={formData.vehicleType}
              onChange={(selectedOption) =>
                setFormData({ ...formData, vehicleType: selectedOption, serviceType: [] })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />

            <label className="form-label">Select Services</label>
            <Select
              options={formData.vehicleType ? serviceOptions[formData.vehicleType.value] : []}
              isMulti
              value={formData.serviceType}
              onChange={(selectedOptions) => setFormData({ ...formData, serviceType: selectedOptions })}
              className="react-select-container"
              classNamePrefix="react-select"
              isDisabled={!formData.vehicleType}
            />
            
            <div className="upload-container">
              <label className="form-label">Upload Garage Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-field"
              />
              
              {preview && (
                <div className="image-preview">
                  <img src={preview} alt="Garage Preview" />
                </div>
              )}
            </div>

            <MDBBtn className="submit-btn" onClick={handleSubmit}>
              Register Garage
            </MDBBtn>
          </motion.div>
        </div>
      </MDBContainer>
    </div>
  );
};

export default GarageFormWithMap;