"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCheckCircle, FiPrinter } from "react-icons/fi";
import { CLAVE_PEDIDO } from "./CheckoutForm";

function formatoPrecio(valor) {
  return valor.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

export default function PedidoConfirmado() {
  const [pedido, setPedido] = useState(null);
  const [cargado, setCargado] = useState(false);

  // El pedido se guardó en localStorage al pagar
  useEffect(() => {
    try {
      setPedido(JSON.parse(localStorage.getItem(CLAVE_PEDIDO)));
    } catch {}
    setCargado(true);
  }, []);

  if (!cargado) return null;

  if (!pedido) {
    return (
      <div className="checkout-empty">
        <h1>No encontramos ningún pedido</h1>
        <p>Parece que todavía no has hecho una compra.</p>
        <Link href="/tienda" className="primary-button">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const fecha = new Date(pedido.fecha).toLocaleString("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="order-confirmed">
      <div className="order-confirmed-header">
        <FiCheckCircle />
        <h1>¡Gracias por tu compra, {pedido.cliente.nombre.split(" ")[0]}!</h1>
        <p>
          Tu pedido <strong>{pedido.folio}</strong> fue confirmado. Enviamos el
          comprobante a <strong>{pedido.cliente.correo}</strong>.
        </p>
      </div>

      <div className="order-receipt">
        <div className="order-receipt-info">
          <p>
            <span>Folio</span>
            <strong>{pedido.folio}</strong>
          </p>
          <p>
            <span>Fecha</span>
            <strong>{fecha}</strong>
          </p>
          <p>
            <span>Entrega</span>
            <strong>
              {pedido.entrega === "domicilio"
                ? `A domicilio: ${pedido.direccion}`
                : "Recoger en tienda"}
            </strong>
          </p>
          <p>
            <span>Pago</span>
            <strong>
              {pedido.pago === "tarjeta"
                ? `Tarjeta terminación ${pedido.ultimos4}`
                : "Efectivo al recibir"}
            </strong>
          </p>
        </div>

        <table className="order-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((item) => (
              <tr key={item.id}>
                <td>{item.nombre}</td>
                <td>{item.cantidad}</td>
                <td>{formatoPrecio(item.precio * item.cantidad)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>Subtotal</td>
              <td>{formatoPrecio(pedido.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={2}>Envío</td>
              <td>{pedido.envio ? formatoPrecio(pedido.envio) : "Gratis"}</td>
            </tr>
            <tr className="order-total">
              <td colSpan={2}>Total</td>
              <td>{formatoPrecio(pedido.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="order-actions">
        <Link href="/tienda" className="primary-button">
          Seguir comprando
        </Link>
        <button type="button" className="order-print" onClick={() => window.print()}>
          <FiPrinter /> Imprimir comprobante
        </button>
      </div>

      <p className="checkout-demo-note">
        Esta es una compra simulada para un proyecto escolar. No se realizó
        ningún cobro.
      </p>
    </div>
  );
}
