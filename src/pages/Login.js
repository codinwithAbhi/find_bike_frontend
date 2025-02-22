import React, { useContext, useEffect } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput
} from "mdb-react-ui-kit";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { useForm } from "react-hook-form";
import Logo from "../assets/Flux_Dev_Create_a_modern_vibrant_logo_for_Find_a_Nearest_Garag_2.jpeg";
import { toast } from "react-toastify";
import api from "../utils/axiosInstance";
import md5 from "md5";
import { DataContext } from "../components/contexts";
import { jwtDecode } from "jwt-decode";
function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(DataContext);

  // Detect the module type (user or garageuser)
  const moduleType = process.env.REACT_APP_MODULE;

  // Set base path dynamically
  const basePath = moduleType === "garageuser" ? "/garage" : "/user";

  const registrationPath = moduleType === "garageuser" ? `${basePath}/garage_registration` : `${basePath}/registration`;
  const homePath = `${basePath}/home`;

  // Set dynamic access token key
  const tokenKey = moduleType === "garageuser" ? "access-token-garageuser" : "access-token-user";

  // Set dynamic API endpoint for login
  const loginEndpoint = moduleType === "garageuser" ? "/auth/login/garage" : "/auth/login";

  const onSubmit = async (data) => {
    try {
      let payload = {
        ...data,
        password: md5(data.password)
      };
      const response = await api.post(loginEndpoint, payload);

      if (response.status === 200) {
       const decoded =jwtDecode( response?.data.token)
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
  }, [auth]);

  return (
    <MDBContainer className="my-5 gradient-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <MDBRow>
          {/* Left Side (Login Form) */}
          <MDBCol col="6" className="mb-5">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="d-flex flex-column ms-5">
                <div className="text-center">
                  <img src={Logo} style={{ width: "185px" }} alt="logo" />
                  <h4 className="mt-1 mb-5 pb-1">
                    Never Be Stranded Again – Find a Nearest Garage Instantly!
                  </h4>
                </div>

                <p>Please login to your account</p>

                <MDBInput
                  wrapperClass="mb-4"
                  label="Email address"
                  id="form1"
                  type="email"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && <p className="text-danger">{errors.email.message}</p>}

                <MDBInput
                  wrapperClass="mb-4"
                  label="Password"
                  id="form2"
                  type="password"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && <p className="text-danger">{errors.password.message}</p>}

                <div className="text-center pt-1 mb-5 pb-1">
                  <MDBBtn className="submit-btn mb-4 w-100 gradient-custom-2" type="submit">
                    Sign in
                  </MDBBtn>
                </div>

                {/* Conditional Registration Link */}
                <div className="d-flex flex-row align-items-center justify-content-center pb-4 mb-4">
                  <p className="mb-0">Don't have an account?</p>
                  <NavLink to={registrationPath}>
                    <MDBBtn outline className="mx-2" color="danger">
                      {moduleType === "garageuser" ? "Register Your Garage" : "Sign Up"}
                    </MDBBtn>
                  </NavLink>
                </div>
              </div>
            </motion.div>
          </MDBCol>

          {/* Right Side (Image Background) */}
          <MDBCol col="6" className="mb-5">
            <div className="d-flex flex-column justify-content-center gradient-custom-3 h-100 mb-4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                  <h4 className="mb-4">We are more than just a company</h4>
                  <p className="small mb-0">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              </motion.div>
            </div>
          </MDBCol>
        </MDBRow>
      </form>
    </MDBContainer>
  );
}

export default Login;
