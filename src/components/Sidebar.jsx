import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  MDBCard, MDBCardBody, MDBCardImage, MDBCardText, MDBCardTitle,
  MDBBtn, MDBIcon, MDBBadge, MDBModal, MDBModalBody, MDBModalHeader,
  MDBModalFooter, MDBInput, MDBTextArea, MDBModalDialog, MDBModalContent
} from "mdb-react-ui-kit";
import Select from "react-select";
import "../styles/sidebar.css";
import { useNavigate } from "react-router";
import { DataContext } from "./contexts";
import { toast } from "react-toastify";
import api from "../utils/axiosInstance"

const Sidebar = ({ isOpen, toggleSidebar, selectedGarage, closeGarage }) => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(DataContext);
  const moduleType = process.env.REACT_APP_MODULE;
  const tokenKey = moduleType === "garageuser" ? "access-token-garageuser" : "access-token-user";
  const basePath = moduleType === "garageuser" ? "/garage" : "/user";

  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: null,
    contact: "",
    vehicleType: null,
    message: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("access-token-user");
    if (token) {
      try {
        setUser(JSON.parse(token));
      } catch (error) {
        toast.error("Authentication error!");
      }
    }
    if (!auth) {
      navigate(`${basePath}/login`);
    }
  }, [auth, basePath, navigate]);

  const handleLogout = () => {
    localStorage.removeItem(tokenKey);
    setAuth(false);
  };
  
  const handleServiceRequest = async () => {
    if (!selectedGarage || !formData.serviceType || !formData.contact) {
      toast.error("Please fill all required fields!");
      return;
    }

    const requestData = {
      garageUserId: selectedGarage._id,
      userId: user?._id,
      serviceType: formData.serviceType.value,
      contact: formData.contact,
      vehicleType: selectedGarage.vehicleType,
      message: formData.message,
    };

    try {
      const response = await api.post("/notification/createnotification", requestData);
      if (response.status === 200) {
        toast.success("Service request sent successfully!");
        setModalOpen(false);
        setFormData({ serviceType: null, contact: "", vehicleType: null, message: "" });
      } else {
        toast.error(response.data.error || "Failed to send request.");
      }
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Error sending request.");
    }
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Mobile Toggle Buttons */}
      {isOpen && (
        <MDBBtn 
          floating 
          className="mobile-close-btn" 
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          <MDBIcon fas icon="times" />
        </MDBBtn>
      )}
      
      {!isOpen && (
        <MDBBtn 
          floating 
          className="mobile-open-btn" 
          onClick={toggleSidebar}
          aria-label="Open sidebar"
        >
          <MDBIcon fas icon="bars" />
        </MDBBtn>
      )}
      
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {isOpen && <h4>Nearby Locations</h4>}
        <MDBBtn floating className="toggle-btn" onClick={toggleSidebar}>
          <MDBIcon fas icon={isOpen ? "angle-left" : "angle-right"} />
        </MDBBtn>
      </div>

      {/* Sidebar Content - Hide when collapsed */}
      {isOpen && (
        <div className="sidebar-content">
          {selectedGarage ? (
            <MDBCard className="garage-card shadow-4">
              <MDBCardImage
                src={`http://localhost:10113${selectedGarage.image}`}
                position="top"
                alt={selectedGarage.garageName}
                className="garage-image"
              />
              <MDBCardBody>
                <MDBCardTitle className="garage-title text-primary fw-bold">
                  {selectedGarage.garageName}
                </MDBCardTitle>

                {/* Address */}
                <MDBCardText className="garage-address text-muted">
                  <MDBIcon fas icon="map-marker-alt" className="text-danger me-2" />
                  {selectedGarage.address}
                </MDBCardText>

                {/* Contact Number */}
                <MDBCardText className="garage-vehicle">
                  <a href={`tel:${selectedGarage.contact}`} style={{ textDecoration: 'none' }}>
                    <MDBBadge color="info" className="p-2">
                      📞{selectedGarage.contact}
                    </MDBBadge>
                  </a>
                </MDBCardText>

                {/* Vehicle Type */}
                <MDBCardText className="garage-vehicle">
                  <MDBBadge color="info" className="p-2">
                    {selectedGarage.vehicleType === "bike" ? "🏍️ Bike" : "🚗 Car"}
                  </MDBBadge>
                </MDBCardText>

                {/* Service Type */}
                <MDBCardText className="garage-services">
                  {selectedGarage.serviceType.map((service, index) => (
                    <MDBBadge key={index} color="secondary" className="me-1 p-2">
                      {service.replace("_", " ")}
                    </MDBBadge>
                  ))}
                </MDBCardText>

                {/* "Request Service" Button */}
                <MDBBtn color="primary" className="w-100 mt-3 fw-bold" onClick={() => setModalOpen(true)}>
                  <MDBIcon fas icon="tools" className="me-2" /> Request Service
                </MDBBtn>

                {/* Close Button */}
                <MDBBtn color="danger" className="w-100 mt-2 fw-bold" onClick={()=>{closeGarage(); toggleSidebar();}}>
                  <MDBIcon fas icon="times-circle" className="me-2" /> Close
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          ) : (
            <p className="info-text text-muted">Click on a marker to see details</p>
          )}
        </div>
      )}

      {/* Logout Button - Always Visible */}
      <div className="sidebar-footer">
        <MDBBtn color="dark" className="w-100 fw-bold" onClick={handleLogout}>
          <MDBIcon fas icon="sign-out-alt" className="me-2" />
          {isOpen && "Log Out"}
        </MDBBtn>
      </div>
      
      {/* Service Request Modal */}
      <MDBModal open={modalOpen} onClose={() => setModalOpen(false)} tabIndex="-1">
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>Request Service</MDBModalHeader>
            <MDBModalBody>
              <MDBInput
                label="Vehicle Type"
                type="text"
                value={selectedGarage?.vehicleType || "Not Available"} 
                disabled 
                className="mt-3"
              />

              <Select
                options={selectedGarage?.serviceType?.map(service => ({
                  value: service, label: service.replace("_", " ")
                }))}
                value={formData.serviceType}
                onChange={val => setFormData({ ...formData, serviceType: val })}
                placeholder="Choose Service..."
                className="mt-3"
              />

              {/* Contact Number */}
              <MDBInput
                label="Your Contact Number"
                type="tel"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="mt-3"
              />

              {/* Message */}
              <MDBTextArea
                label="Additional Message"
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="mt-3"
              />
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={() => setModalOpen(false)}>Cancel</MDBBtn>
              <MDBBtn color="success" onClick={handleServiceRequest}>Submit Request</MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  selectedGarage: PropTypes.object,
  closeGarage: PropTypes.func.isRequired,
};

export default Sidebar;