"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const CLAVE_STORAGE = "norita-carrito";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE_STORAGE));
      if (Array.isArray(guardado)) setItems(guardado);
    } catch {}
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items));
    } catch {}
  }, [items, cargado]);

  function agregar(producto) {
    setItems((actuales) => {
      const existe = actuales.some((item) => item.id === producto.id);

      if (existe) {
        return actuales.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }

      return [
        ...actuales,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          cantidad: 1,
        },
      ];
    });
  }

  function cambiarCantidad(id, cambio) {
    setItems((actuales) =>
      actuales
        .map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad + cambio } : item,
        )
        .filter((item) => item.cantidad > 0),
    );
  }

  function quitar(id) {
    setItems((actuales) => actuales.filter((item) => item.id !== id));
  }

  function vaciar() {
    setItems([]);
  }

  const totalArticulos = useMemo(
    () => items.reduce((suma, item) => suma + item.cantidad, 0),
    [items],
  );

  const total = useMemo(
    () => items.reduce((suma, item) => suma + item.precio * item.cantidad, 0),
    [items],
  );

  const value = {
    items,
    cargado,
    totalArticulos,
    total,
    carritoAbierto,
    abrirCarrito: () => setCarritoAbierto(true),
    cerrarCarrito: () => setCarritoAbierto(false),
    agregar,
    cambiarCantidad,
    quitar,
    vaciar,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const contexto = useContext(CartContext);
  if (!contexto) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return contexto;
}
