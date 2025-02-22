import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
    MDBBtn,
    MDBInput,
    MDBContainer
} from "mdb-react-ui-kit";
import { motion } from "framer-motion";
import Select from "react-select";
import L from "leaflet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/GarageFormWithMap.css";
import api from "../utils/axiosInstance";
import { NavLink, useNavigate } from "react-router-dom";
import md5 from "md5";
// Custom Red Marker Icon
const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [25, 41],
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
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        email:"",
        password: "",
        garageName: "",
        address: "",
        contactNumber: '',
        serviceType: [],
        vehicleType: null,
    });
    const navigate = useNavigate()
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setLat(latitude)
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
            { label: "Bike Repair", value: "Bike Repair" },
            { label: "Bike Oil Change", value: "Bike Oil Change" },
            { label: "Bike Tire Replacement", value: "Bike Tire Replacement" },
        ],
        car: [
            { label: "Car Repair", value: "Car Repair" },
            { label: "Car Full Service", value: "Car Full Service" },
            { label: "Car Oil Change", value: "Car Oil Change" },
            { label: "Car Battery Check", value: "Car Battery Check" },
            { label: "Car Tire Replacement", value: "Car Tire Replacement" },
        ]
    };

    const vehicleOptions = [
        { label: "Bike", value: "bike" },
        { label: "Car", value: "car" },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

        // Remove error message when user fills the field
        if (e.target.value.trim() !== "") {
            setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: "" }));
        }
    };

    // Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setErrors((prev) => ({ ...prev, image: "Please upload an image." }));
            return;
        }

        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({ ...prev, image: "Only image files are allowed." }));
            return;
        }

        setImage(file);
        setErrors((prev) => ({ ...prev, image: "" }));

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
                    email:"",
                    password: "",
                    garageName: "",
                    address: "",
                    contactNumber: '',
                    serviceType: [],
                    vehicleType: null,
                });

                setImage(null);
                setPreview(null);
                navigate('/garage/login')
                toast.success("Garage Registered Successfully! 🚀");
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
                    <MapContainer center={[lat, lng]} zoom={13} style={{ width: "100%", height: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[lat, lng]} icon={redIcon} />
                        <LocationMarker setLat={setLat} setLng={setLng} />
                    </MapContainer>
                </div>

                {/* Right side: Form */}
                <div className="form-container">
                    <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                        <h3 className="form-title">Garage Registration</h3>
                        <label className="form-label">Email</label>
                        <MDBInput
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mb-3 form-field"
                            placeholder="Enter email"
                        />
                        

                        <label className="form-label">Password</label>
                        <MDBInput
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mb-3 form-field"
                            placeholder="Enter password"
                        />

                        <label className="form-label">Garage Name</label>
                        <MDBInput
                            name="garageName"
                            value={formData.garageName}
                            onChange={handleChange}
                            className="mb-3 form-field"
                            placeholder="Enter garage name"
                        />

                        <label className="form-label">Address</label>
                        <MDBInput
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="mb-3 form-field"
                            placeholder="Enter address"
                        />

                        <label className="form-label">Contact Number</label>
                        <MDBInput
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            className="mb-3 form-field"
                            type="tel"
                            placeholder="Enter contact number"
                            pattern="[0-9]{10}"
                            required
                        />

                        <label className="form-label">Select Vehicle Type</label>
                        <Select
                            options={vehicleOptions}
                            value={formData.vehicleType}
                            onChange={(selectedOption) =>
                                setFormData({ ...formData, vehicleType: selectedOption, serviceType: [] })
                            }
                            className="mb-3 react-select-container"
                        />

                        <label className="form-label">Select Services</label>
                        <Select
                            options={formData.vehicleType ? serviceOptions[formData.vehicleType.value] : []}
                            isMulti
                            value={formData.serviceType}
                            onChange={(selectedOptions) => setFormData({ ...formData, serviceType: selectedOptions })}
                            className="mb-3 react-select-container"
                            isDisabled={!formData.vehicleType}  // Disable until vehicle type is selected
                        />
                        <div className="upload-container">
                            <label className="form-label">Upload Garage Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="form-field"
                            />

                            {/* {preview && (
                                <div className="image-preview">
                                    <img src={preview} alt="Garage Preview" />
                                </div>
                            )} */}
                        </div>

                        <MDBBtn className="submit-btn mt-3" onClick={handleSubmit}>Submit</MDBBtn>
                    </motion.div>
                </div>
            </MDBContainer>
        </div>
    );
};

export default GarageFormWithMap;
