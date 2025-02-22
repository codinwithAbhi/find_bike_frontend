import React, { useEffect, useState } from "react";

const DataContext = React.createContext();

const MyContextProvide = (props) => {
    const [auth, setAuth] = useState(false);
    const [userId, setUserId] = useState(null);
    const moduleType = process.env.REACT_APP_MODULE;
    const tokenKey = moduleType === "garageuser" ? "access-token-garageuser" : "access-token-user";
    useEffect(() => {
        const data = localStorage.getItem(tokenKey);
        const userData = data ? JSON.parse(data) : null;

        if (userData) {
            setUserId(userData._id);
            setAuth(true);
        } else {
            setAuth(false);
        }
    }, [auth]); 

    const contextValues = {
        userId,
        auth,
        setAuth
    };

    return (
        <DataContext.Provider value={contextValues}>
            {props.children}
        </DataContext.Provider>
    );
};

export { MyContextProvide, DataContext };
