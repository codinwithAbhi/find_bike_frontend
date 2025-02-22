import React from 'react';
import Routes from './routes'
import { ToastContainer } from 'react-toastify';
import { MyContextProvide } from './components/contexts';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={1000} />
      <MyContextProvide>
        <Routes />
      </MyContextProvide>
    </>
  );
}

export default App;