import React, { useState, useEffect, useContext } from "react";
import {
  MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle,
  MDBCardText, MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsContent,
  MDBTabsPane, MDBListGroup, MDBListGroupItem, MDBBtn
} from "mdb-react-ui-kit";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "../styles/GarageDashboard.css";
import api from "../utils/axiosInstance";
import { DataContext } from "../components/contexts";
import { useNavigate } from "react-router";
import Pagination from "../components/pagination";

export default function GarageDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");
  const { auth, setAuth } = useContext(DataContext);
  const [user, setUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState({
    pending: 1,
    accepted: 1,
    rejected: 1,
    completed: 1
  });
  const pageSize = 5;
  const handlePageChange = (tab, newPage) => {
    setCurrentPage(prevState => ({
      ...prevState,
      [tab]: newPage
    }));
  };

  const getPaginatedData = (data, tab) => {
    const startIndex = (currentPage[tab] - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  };

  const moduleType = process.env.REACT_APP_MODULE;
  const tokenKey = moduleType === "garageuser" ? "access-token-garageuser" : "access-token-user";
  const basePath = moduleType === "garageuser" ? "/garage" : "/user";
  useEffect(() => {
    const token = localStorage.getItem("access-token-garageuser");
    if (token) {
      try {
        const userData = JSON.parse(token);
        setUser(userData);
        getGarageNotification(userData._id);
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
    if (!auth) {
      navigate(`${basePath}/login`);
    }
  }, [auth]);

  const Logout = () => {
    localStorage.removeItem(tokenKey);
    setAuth(false);
  }

  const getGarageNotification = async (userId) => {
    try {
      const response = await api.get(`/notification/getnotification?garageUserId=${userId}`);
      if (response.status === 200) {
        const notifications = response.data;

        // ✅ Categorize requests based on `status`
        setPendingRequests(notifications.filter(req => req.status === "Pending"));
        setAcceptedRequests(notifications.filter(req => req.status === "Accepted"));
        setRejectedRequests(notifications.filter(req => req.status === "Rejected"));
        setCompletedRequests(notifications.filter(req => req.status === "Completed"));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const updateNotificationStatus = async (notificationId, status) => {
    try {
      const response = await api.post(`/notification/updatenotification`, { notificationId, status });
      if (response.status === 200) {
        toast.success(`Request ${status} successfully!`);
        getGarageNotification(user._id); // ✅ Re-fetch notifications after update
      }
    } catch (error) {
      toast.error("Failed to update request status.");
    }
  };

  return (
    <>
      <MDBContainer className="dashboard-container">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <MDBRow>
            {/* ✅ User Info Card */}
            <MDBCol md="3">
              <MDBCard className="user-card">
                <MDBCardBody>
                  <MDBCardTitle className="user-name">👨‍🔧 {user?.name || "Garage Owner"}</MDBCardTitle>
                  <MDBCardText className="user-details">
                    📧 <strong>Email:</strong> {user?.email} <br />
                    📍 <strong>Address:</strong> {user?.address} <br />
                    📞 <strong>Contact:</strong> {user?.contact} <br />
                    🛠️ <strong>Service Type:</strong> {user?.serviceType} <br />
                    🚗 <strong>Vehicle Type:</strong> {user?.vehicleType}
                  </MDBCardText>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            <MDBCol md="9">
              {/* ✅ Service Requests Tabs */}
              <MDBTabs className="dashboard-tabs">
                <MDBTabsItem>
                  <MDBTabsLink onClick={() => setActiveTab("pending")} active={activeTab === "pending"}>
                    ⏳ Pending Requests
                  </MDBTabsLink>
                </MDBTabsItem>
                <MDBTabsItem>
                  <MDBTabsLink onClick={() => setActiveTab("accepted")} active={activeTab === "accepted"}>
                    ✅ Accepted Requests
                  </MDBTabsLink>
                </MDBTabsItem>
                <MDBTabsItem>
                  <MDBTabsLink onClick={() => setActiveTab("rejected")} active={activeTab === "rejected"}>
                    ❌ Rejected Requests
                  </MDBTabsLink>
                </MDBTabsItem>
                <MDBTabsItem>
                  <MDBTabsLink onClick={() => setActiveTab("completed")} active={activeTab === "completed"}>
                    ✅ Accepted Requests
                  </MDBTabsLink>
                </MDBTabsItem>
              </MDBTabs>

              <MDBTabsContent>
                {/* 🟡 Pending Requests Tab */}
                <MDBTabsPane open={activeTab === "pending"}>
                  <MDBCard className="info-card">
                    <MDBCardBody>
                      <h5 className="section-title">⏳ Pending Requests</h5>
                      {pendingRequests.length > 0 ? (
                        <>
                          <MDBListGroup>
                            {getPaginatedData(pendingRequests, "pending").map((req) => (
                              <MDBListGroupItem key={req._id} className="request-item">
                                <strong>👤 Customer:</strong> {req.userId.name} <br />
                                <strong>📞 Contact:</strong> {req?.contact} <br />
                                <strong>🔧 Service:</strong> {req.serviceType} <br />
                                <strong>📌 Message:</strong> {req.message} <br />
                                <strong>📌 Status:</strong> <span className="status pending">Pending</span>
                                <div className="action-buttons">
                                  <MDBBtn color="success" size="sm" onClick={() => updateNotificationStatus(req._id, "Accepted")}>✔ Accept</MDBBtn>
                                  <MDBBtn color="danger" size="sm" onClick={() => updateNotificationStatus(req._id, "Rejected")}>✖ Reject</MDBBtn>
                                </div>
                              </MDBListGroupItem>
                            ))}
                          </MDBListGroup>
                          <Pagination
                            totalItems={pendingRequests.length}
                            currentPage={currentPage.pending}
                            onPageChange={(newPage) => handlePageChange("pending", newPage)}
                          />
                        </>
                      ) : (
                        <p>No pending requests.</p>
                      )}
                    </MDBCardBody>
                  </MDBCard>
                </MDBTabsPane>

                {/* 🟢 Completed Requests Tab */}
                <MDBTabsPane open={activeTab === "accepted"}>
                  <MDBCard className="info-card">
                    <MDBCardBody>
                      <h5 className="section-title">✅ Accepted Requests</h5>
                      {acceptedRequests.length > 0 ? (
                        <>
                          <MDBListGroup>
                            {getPaginatedData(acceptedRequests, "accepted").map((req) => (
                              <MDBListGroupItem key={req._id} className="request-item">
                                <strong>👤 Customer:</strong> {req.userId.name} <br />
                                <strong>📞 Contact:</strong> {req?.contact} <br />
                                <strong>🔧 Service:</strong> {req.serviceType} <br />
                                <strong>📌 Message:</strong> {req.message} <br />
                                <strong>📌 Status:</strong> <span className="status completed">Accepted</span>
                                <div className="action-buttons" style={{ textAlign: "end" }}>
                                  <MDBBtn color="success" size="sm" onClick={() => updateNotificationStatus(req._id, "Completed")}>✔ Completed</MDBBtn>
                                </div>
                              </MDBListGroupItem>
                            ))}
                          </MDBListGroup>
                          <Pagination
                            totalItems={acceptedRequests.length}
                            currentPage={currentPage.accepted}
                            onPageChange={(newPage) => handlePageChange("accepted", newPage)}
                          />
                        </>
                      ) : (
                        <p>No completed requests.</p>
                      )}
                    </MDBCardBody>
                  </MDBCard>
                </MDBTabsPane>

                {/* ❌ Completed Requests Tab */}
                <MDBTabsPane open={activeTab === "rejected"}>
                  <MDBCard className="info-card">
                    <MDBCardBody>
                      <h5 className="section-title">❌ Rejected Requests</h5>
                      {rejectedRequests.length > 0 ? (
                        <>
                          <MDBListGroup>
                            {getPaginatedData(rejectedRequests, "rejected").map((req) => (
                              <MDBListGroupItem key={req._id} className="request-item">
                                <strong>👤 Customer:</strong> {req.userId.name} <br />
                                <strong>📞 Contact:</strong> {req?.contact} <br />
                                <strong>🔧 Service:</strong> {req.serviceType} <br />
                                <strong>📌 Message:</strong> {req.message} <br />
                                <strong>📌 Status:</strong> <span className="status rejected">Rejected</span>
                              </MDBListGroupItem>
                            ))}
                          </MDBListGroup>
                          <Pagination
                            totalItems={rejectedRequests.length}
                            currentPage={currentPage.rejected}
                            onPageChange={(newPage) => handlePageChange("rejected", newPage)}
                          />
                        </>
                      ) : (
                        <p>No rejected requests.</p>
                      )}
                    </MDBCardBody>
                  </MDBCard>
                </MDBTabsPane>
                <MDBTabsPane open={activeTab === "completed"}>
                  <MDBCard className="info-card">
                    <MDBCardBody>
                      <h5 className="section-title">✅ Completed Requests</h5>
                      {completedRequests.length > 0 ? (
                        <>
                          <MDBListGroup>
                            {getPaginatedData(completedRequests, "completed").map((req) => (
                              <MDBListGroupItem key={req._id} className="request-item">
                                <strong>👤 Customer:</strong> {req.userId.name} <br />
                                <strong>📞 Contact:</strong> {req?.contact} <br />
                                <strong>🔧 Service:</strong> {req.serviceType} <br />
                                <strong>📌 Message:</strong> {req.message} <br />
                                <strong>📌 Status:</strong> <span className="status completed">Completed</span>
                              </MDBListGroupItem>
                            ))}
                          </MDBListGroup>
                          <Pagination
                            totalItems={completedRequests.length}
                            currentPage={currentPage.completed}
                            onPageChange={(newPage) => handlePageChange("completed", newPage)}
                          />
                        </>
                      ) : (
                        <p>No rejected requests.</p>
                      )}
                    </MDBCardBody>
                  </MDBCard>
                </MDBTabsPane>
              </MDBTabsContent>
            </MDBCol>
          </MDBRow>
        </motion.div>
      </MDBContainer>
      <div className="container">
        <MDBBtn className="logout-button" onClick={Logout}>Logout</MDBBtn>
      </div>

    </>
  );
}
