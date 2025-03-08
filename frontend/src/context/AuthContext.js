// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Verificar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token); // Decodificar el token
        setUser(decodedUser);
      } catch (error) {
        console.error("Token inválido:", error);
        logout(); // Borrar el token si es inválido
      }
    }
  }, []);

  // Función para iniciar sesión
  const login = (token) => {
    localStorage.setItem("token", token); // Guardar el token en localStorage
    const decodedUser = jwtDecode(token); // Decodificar el token
    setUser(decodedUser);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("token"); // Eliminar el token
    setUser(null); // Limpiar el estado del usuario
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};