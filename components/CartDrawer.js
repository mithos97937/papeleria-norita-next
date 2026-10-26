"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiX, FiPlus, FiMinus, FiTrash2, FiLock } from "react-icons/fi";
import { useCart } from "./CartContext";
import LottieAnimation from "./LottieAnimation";

function formatoPrecio(valor) {
  return valor.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

export default function CartDrawer() {
  const {
    items,
    total,
    totalArticulos,
    carritoAbierto,
    cerrarCarrito,
    cambiarCantidad,
    quitar,
    vaciar,
  } = useCart();

  useEffect(() => {
    if (!carritoAbierto) return;

    const alPresionar = (e) => {
      if (e.key === "Escape") cerrarCarrito();
    };

    document.addEventListener("keydown", alPresionar);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", alPresionar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [carritoAbierto, cerrarCarrito]);

  if (!carritoAbierto) return null;

  return (
    <div className="cart-overlay" onClick={cerrarCarrito}>
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart-header">
          <span>Tu carrito ({totalArticulos})</span>
          <button
            type="button"
            className="cart-close"
            onClick={cerrarCarrito}
            aria-label="Cerrar carrito"
          >
            <FiX />
          </button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <LottieAnimation
                src="/animations/notebook.json"
                ancho={150}
                descripcion="Cuaderno animado"
              />
              <p>Tu carrito está vacío</p>
              <Link
                href="/tienda"
                className="primary-button"
                onClick={cerrarCarrito}
              >
                Ver productos
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div className="cart-item" key={item.id}>
                <Image
                  src={item.imagen}
                  alt={item.nombre}
                  width={64}
                  height={64}
                />

                <div>
                  <p className="cart-item-name">{item.nombre}</p>
                  <p className="cart-item-price">
                    {formatoPrecio(item.precio * item.cantidad)}
                  </p>

                  <div className="cart-qty">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id, -1)}
                      aria-label={`Quitar una unidad de ${item.nombre}`}
                    >
                      <FiMinus />
                    </button>
                    <span>{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id, 1)}
                      aria-label={`Agregar una unidad de ${item.nombre}`}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="cart-remove"
                  onClick={() => quitar(item.id)}
                  aria-label={`Eliminar ${item.nombre} del carrito`}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span>{formatoPrecio(total)}</span>
            </div>

            <Link
              href="/checkout"
              className="cart-checkout"
              onClick={cerrarCarrito}
            >
              <FiLock />
              Finalizar compra
            </Link>

            <button type="button" className="cart-clear" onClick={vaciar}>
              Vaciar carrito
            </button>

            <p className="cart-note">
              Compra simulada: no se realiza ningún cobro real.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
