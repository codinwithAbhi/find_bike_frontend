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
import { NavLink, useNavigate  } from 'react-router-dom'; 
import md5 from 'md5'
import { toast } from 'react-toastify'
import api from '../utils/axiosInstance.js'

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

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: md5(data.password),
    };

    try {
      const response = await api.post('/auth/userregistration', payload);
      if (response.status == 200) {
        toast.success('Registration successful!', {
          onClose: () => navigate('/login')
        });
        reset();

      }
    } catch (error) {
      toast.error('Registration failed:', error.message);
    }
  };

  return (
    <MDBContainer fluid className="gradient-background d-flex align-items-center justify-content-center vh-100">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <MDBCard className='text-black shadow-lg' style={{ borderRadius: '20px', maxWidth: '900px' }}>
          <MDBCardBody className="p-5">
            <form onSubmit={handleSubmit(onSubmit)}>
              <MDBRow className="g-0">
                {/* Left Side - Form */}
                <MDBCol md='6' className='order-2 order-md-1 d-flex flex-column align-items-center'>

                  <h3 className="text-center fw-bold mb-4">Create an Account</h3>

                  {/* Name */}
                  <div className="d-flex flex-row align-items-center mb-3 w-100">
                    <MDBIcon fas icon="user me-3 text-primary" size='lg' />
                    <MDBInput
                      label='Your Name'
                      id='name'
                      type='text'
                      className='w-100'
                      {...register('name', { required: 'Name is required' })}
                      onInput={() => clearErrors('name')} // Clear error on typing
                    />
                  </div>
                  {errors.name && <small className="text-danger">{errors.name.message}</small>}

                  {/* Email */}
                  <div className="d-flex flex-row align-items-center mb-3 w-100">
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
                  {errors.email && <small className="text-danger">{errors.email.message}</small>}

                  {/* Password */}
                  <div className="d-flex flex-row align-items-center mb-3 w-100">
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
                  {errors.password && <small className="text-danger">{errors.password.message}</small>}

                  {/* Confirm Password */}
                  <div className="d-flex flex-row align-items-center mb-3 w-100">
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
                  {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword.message}</small>}

                  <MDBBtn className='w-100 gradient-btn' size='lg' type='submit'>Register</MDBBtn>

                  <p className="mt-3">
                    Already have an account? <NavLink to="/login" className="text-primary">Sign in</NavLink>
                  </p>
                </MDBCol>

                {/* Right Side - Image */}
                <MDBCol md='6' className='order-1 order-md-2 d-flex align-items-center justify-content-center'>
                  <MDBCardImage src='https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp' fluid className="rounded" style={{ maxHeight: "450px" }} />
                </MDBCol>
              </MDBRow>
            </form>
          </MDBCardBody>
        </MDBCard>
      </motion.div>
    </MDBContainer>
  );
}

export default Register;
