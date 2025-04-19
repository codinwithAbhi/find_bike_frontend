import React from 'react';
import { useForm } from 'react-hook-form';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBInput,
  MDBIcon
} from 'mdb-react-ui-kit';
import { motion } from "framer-motion";
import '../styles/Registration.css';
import { NavLink, useNavigate } from 'react-router-dom'; 
import md5 from 'md5';
import { toast } from 'react-toastify';
import api from '../utils/axiosInstance.js';

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    clearErrors
  } = useForm();
  
  const navigate = useNavigate();
  const password = watch('password');

  // Detect the module type (user or garageuser)
  const moduleType = process.env.REACT_APP_MODULE;
  
  // Set dynamic route paths and endpoint
  const loginPath = moduleType === "garageuser" ? "/garage/login" : "/login";
  const registrationEndpoint = moduleType === "garageuser" 
    ? '/auth/garageregistration' 
    : '/auth/userregistration';

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: md5(data.password),
    };

    try {
      const response = await api.post(registrationEndpoint, payload);
      if (response.status === 200) {
        toast.success('Registration successful!', {
          onClose: () => navigate(loginPath)
        });
        reset();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <MDBContainer fluid className="gradient-background py-4 py-md-5 min-vh-100 d-flex align-items-center justify-content-center">
      <MDBRow className="g-0 justify-content-center w-100">
        <MDBCol sm={12} md={10} lg={9} xl={8}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <MDBCard className='text-black shadow-lg rounded-4 overflow-hidden'>
              <MDBCardBody className="p-0">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <MDBRow className="g-0">
                    {/* Left Side - Form */}
                    <MDBCol md='6' className='order-2 order-md-1'>
                      <div className="p-4 p-md-5">
                        <h3 className="text-center fw-bold mb-4">
                          {moduleType === "garageuser" ? "Register Your Garage" : "Create an Account"}
                        </h3>

                        {/* Name */}
                        <div className="d-flex flex-row align-items-center mb-3">
                          <MDBIcon fas icon="user me-3 text-primary" size='lg' />
                          <MDBInput
                            label='Your Name'
                            id='name'
                            type='text'
                            className='w-100'
                            {...register('name', { required: 'Name is required' })}
                            onInput={() => clearErrors('name')}
                          />
                        </div>
                        {errors.name && <small className="text-danger mb-3 d-block">{errors.name.message}</small>}

                        {/* Email */}
                        <div className="d-flex flex-row align-items-center mb-3">
                          <MDBIcon fas icon="envelope me-3 text-primary" size='lg' />
                          <MDBInput
                            label='Your Email'
                            id='email'
                            type='email'
                            className='w-100'
                            {...register('email', {
                              required: 'Email is required',
                              pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Invalid email address'
                              }
                            })}
                            onInput={() => clearErrors('email')}
                          />
                        </div>
                        {errors.email && <small className="text-danger mb-3 d-block">{errors.email.message}</small>}

                        {/* Password */}
                        <div className="d-flex flex-row align-items-center mb-3">
                          <MDBIcon fas icon="lock me-3 text-primary" size='lg' />
                          <MDBInput
                            label='Password'
                            id='password'
                            type='password'
                            className='w-100'
                            {...register('password', {
                              required: 'Password is required',
                              minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters'
                              }
                            })}
                            onInput={() => clearErrors('password')}
                          />
                        </div>
                        {errors.password && <small className="text-danger mb-3 d-block">{errors.password.message}</small>}

                        {/* Confirm Password */}
                        <div className="d-flex flex-row align-items-center mb-3">
                          <MDBIcon fas icon="key me-3 text-primary" size='lg' />
                          <MDBInput
                            label='Repeat Password'
                            id='confirmPassword'
                            type='password'
                            className='w-100'
                            {...register('confirmPassword', {
                              required: 'Confirm Password is required',
                              validate: (value) => value === password || 'Passwords do not match'
                            })}
                            onInput={() => clearErrors('confirmPassword')}
                          />
                        </div>
                        {errors.confirmPassword && <small className="text-danger mb-3 d-block">{errors.confirmPassword.message}</small>}

                        <MDBBtn className='w-100 gradient-btn py-3 mt-3' size='lg' type='submit'>
                          Register
                        </MDBBtn>

                        <p className="mt-4 text-center">
                          Already have an account? <NavLink to={loginPath} className="text-primary fw-bold"><MDBBtn outline className="mx-2" color="danger">Sign in</MDBBtn></NavLink>
                        </p>
                      </div>
                    </MDBCol>

                    {/* Right Side - Image */}
                    <MDBCol md='6' className='order-1 order-md-2 d-flex align-items-center justify-content-center p-4 p-md-0 illustration-col'>
                      <MDBCardImage 
                        src='https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp' 
                        fluid 
                        className="registration-illustration"
                        alt="Registration illustration"
                      />
                    </MDBCol>
                  </MDBRow>
                </form>
              </MDBCardBody>
            </MDBCard>
          </motion.div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Register;