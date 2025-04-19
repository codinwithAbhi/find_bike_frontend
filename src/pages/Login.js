import React, { useContext, useEffect } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBCard,
  MDBCardBody,
  MDBIcon
} from "mdb-react-ui-kit";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../utils/axiosInstance";
import md5 from "md5";
import { DataContext } from "../components/contexts";
import { jwtDecode } from "jwt-decode";
import Logo from "../assets/Flux_Dev_Create_a_modern_vibrant_logo_for_Find_a_Nearest_Garag_2.jpeg";
import "../styles/Login.css";

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(DataContext);

  // Detect the module type (user or garageuser)
  const moduleType = process.env.REACT_APP_MODULE;
  const isGarageUser = moduleType === "garageuser";

  // Set base path dynamically
  const basePath = isGarageUser ? "/garage" : "/user";

  const registrationPath = isGarageUser ? `${basePath}/garage_registration` : `${basePath}/registration`;
  const homePath = `${basePath}/home`;

  // Set dynamic access token key
  const tokenKey = isGarageUser ? "access-token-garageuser" : "access-token-user";

  // Set dynamic API endpoint for login
  const loginEndpoint = isGarageUser ? "/auth/login/garage" : "/auth/login";

  const onSubmit = async (data) => {
    try {
      let payload = {
        ...data,
        password: md5(data.password)
      };
      const response = await api.post(loginEndpoint, payload);

      if (response.status === 200) {
        const decoded = jwtDecode(response?.data.token)
        localStorage.setItem(tokenKey, JSON.stringify(decoded));
        setAuth(true);
        navigate(homePath);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  useEffect(() => {
    if (auth) {
      navigate(homePath); // Redirect to the correct home page
    }
  }, [auth, navigate, homePath]);

  // Garage User Layout
  if (isGarageUser) {
    return (
      <MDBContainer fluid className="py-4 py-md-5">
        <MDBRow className="g-0 justify-content-center">
          <MDBCol sm={12} md={10} lg={10} xl={9}>
            <MDBCard className="rounded-4 shadow">
              <MDBCardBody className="p-0">
                <MDBRow className="g-0">
                  {/* Left Side (Image/Banner) */}
                  <MDBCol md={5} className="p-0">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-100 garage-banner rounded-start"
                    >
                      <div className="d-flex flex-column justify-content-center h-100 p-4 p-lg-5">
                        <h3 className="fw-bold mb-4">Garage Owner Portal</h3>
                        <p className="mb-3">
                          Connect with customers and grow your business with Find a Nearest Garage
                        </p>
                        <ul className="garage-features-list">
                          <li><MDBIcon fas icon="check-circle" className="me-2" /> Manage your garage profile</li>
                          <li><MDBIcon fas icon="check-circle" className="me-2" /> Accept service requests</li>
                          <li><MDBIcon fas icon="check-circle" className="me-2" /> Showcase your services</li>
                          <li><MDBIcon fas icon="check-circle" className="me-2" /> Build your customer base</li>
                        </ul>
                      </div>
                    </motion.div>
                  </MDBCol>

                  {/* Right Side (Login Form) */}
                  <MDBCol md={7} className="garage-login-form-col">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="p-4 p-md-5"
                    >
                      <div className="text-center mb-4">
                        <img src={Logo} style={{ width: "120px", maxWidth: "100%" }} alt="logo" className="img-fluid" />
                        <h4 className="mt-3 fw-bold">Garage Owner Login</h4>
                        <p className="text-muted mb-4 small">Access your garage dashboard to manage services and requests</p>
                      </div>

                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                          <MDBInput
                            wrapperClass="mb-3"
                            label="Email address"
                            id="form1"
                            type="email"
                            size="lg"
                            floating  
                            {...register("email", { required: "Email is required" })}
                          />
                          {errors.email && <p className="text-danger small mb-3">{errors.email.message}</p>}

                          <MDBInput
                            wrapperClass="mb-3"
                            label="Password"
                            id="form2"
                            type="password"
                            size="lg"
                            floating  
                            {...register("password", { required: "Password is required" })}
                          />
                          {errors.password && <p className="text-danger small mb-3">{errors.password.message}</p>}
                        </div>

                        {/* <div className="d-flex justify-content-between align-items-center mb-4">
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="rememberMe" />
                            <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                          </div>
                          <a href="#!" className="text-primary small">Forgot password?</a>
                        </div> */}

                        <div className="text-center pt-1 mb-4">
                          <MDBBtn className="w-100 garage-gradient-btn py-3" type="submit">
                            <MDBIcon fas icon="tools" className="me-2" /> Sign in to Dashboard
                          </MDBBtn>
                        </div>

                        <div className="text-center mb-3">
                          <p className="mb-2">Don't have a garage account yet?</p>
                          <NavLink to={registrationPath}>
                            <MDBBtn outline className="garage-outline-btn">
                              Register Your Garage
                            </MDBBtn>
                          </NavLink>
                        </div>
                        
                        {/* <div className="text-center mt-4">
                          <p className="text-muted small">
                            Are you a vehicle owner? <NavLink to="/user/login" className="text-primary">Login here</NavLink>
                          </p>
                        </div> */}
                      </form>
                    </motion.div>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    );
  }

  // Regular User Layout (Original)
  return (
    <MDBContainer fluid className="py-4 py-md-5">
      <MDBRow className="g-0 justify-content-center">
        <MDBCol sm={12} md={10} lg={8} xl={8}>
          <MDBCard className="rounded-4 shadow">
            <MDBCardBody className="p-0">
              <MDBRow className="g-0">
                {/* Left Side (Login Form) */}
                <MDBCol md={12} lg={6} className="login-form-col">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="p-4 p-md-5"
                  >
                    <div className="text-center mb-4">
                      <img src={Logo} style={{ width: "150px", maxWidth: "100%" }} alt="logo" className="img-fluid" />
                      <h4 className="mt-3 fw-bold">Find a Nearest Garage</h4>
                      <p className="text-muted mb-4 small">Never Be Stranded Again – Find a Garage Instantly!</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                      <p className="fw-bold mb-3">Please login to your account</p>

                      <MDBInput
                        wrapperClass="mb-3"
                        label="Email address"
                        id="form1"
                        type="email"
                        size="lg"
                        floating  
                        {...register("email", { required: "Email is required" })}
                      />
                      {errors.email && <p className="text-danger small mb-3">{errors.email.message}</p>}

                      <MDBInput
                        wrapperClass="mb-3"
                        label="Password"
                        id="form2"
                        type="password"
                        size="lg"
                        floating  
                        {...register("password", { required: "Password is required" })}
                      />
                      {errors.password && <p className="text-danger small mb-3">{errors.password.message}</p>}

                      <div className="text-center pt-1 mb-4">
                        <MDBBtn className="w-100 gradient-custom-2 py-3" type="submit">
                          Sign in
                        </MDBBtn>
                      </div>

                      {/* Conditional Registration Link */}
                      <div className="text-center mb-2">
                        <p className="mb-2">Don't have an account?</p>
                        <NavLink to={registrationPath}>
                          <MDBBtn outline className="mx-2" color="danger">
                            Sign Up
                          </MDBBtn>
                        </NavLink>
                      </div>
                      
                      {/* <div className="text-center mt-4">
                        <p className="text-muted small">
                          Are you a garage owner? <NavLink to="/garage/login" className="text-primary">Login here</NavLink>
                        </p>
                      </div> */}
                    </form>
                  </motion.div>
                </MDBCol>

                {/* Right Side (Image Background) - Hidden on mobile */}
                <MDBCol lg={6} className="d-none d-lg-block p-0">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-100 gradient-custom-3 rounded-end"
                  >
                    <div className="d-flex flex-column justify-content-center h-100 p-4 p-lg-5">
                      <h4 className="fw-bold mb-4">Your Roadside Assistant</h4>
                      <p className="mb-4">
                        Find the nearest garage in seconds when you need help most. Our network of trusted mechanics is ready to assist you 24/7.
                      </p>
                      <ul className="user-benefits-list">
                        <li><MDBIcon fas icon="car" className="me-2" /> Find nearby garages instantly</li>
                        <li><MDBIcon fas icon="tools" className="me-2" /> Connect with qualified mechanics</li>
                        <li><MDBIcon fas icon="star" className="me-2" /> Read verified reviews</li>
                        <li><MDBIcon fas icon="clock" className="me-2" /> Get quick service estimates</li>
                      </ul>
                    </div>
                  </motion.div>
                </MDBCol>
              </MDBRow>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Login;