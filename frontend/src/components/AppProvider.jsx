'use client';
import { createContext, useContext, useState } from "react";

const AppContext = createContext();

const AppProvider = ({ children }) => {

  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <AppContext.Provider value={{ loggedIn, setLoggedIn }}>
      {children}
    </AppContext.Provider>
  );
}

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export { AppProvider, useAppContext };