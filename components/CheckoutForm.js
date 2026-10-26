"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiLock, FiCreditCard, FiDollarSign, FiShoppingBag } from "react-icons/fi";
import { useCart } from "./CartContext";

// Compra SIMULADA: no se conecta a ningún banco ni se cobra nada.
export const CLAVE_PEDIDO = "norita-ultimo-pedido";
const COSTO_ENVIO = 50;

function formatoPrecio(valor) {
  return valor.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

// Genera un folio tipo "NOR-482913"
function generarFolio() {
  return `NOR-${Math.floor(100000 + Math.random() * 900000)}`;
}

const datosIniciales = {
  nombre: "",
  correo: "",
  telefono: "",
  entrega: "tienda", // "tienda" | "domicilio"
  direccion: "",
  pago: "tarjeta", // "tarjeta" | "efectivo"
  tarjeta: "",
  titular: "",
  vencimiento: "",
  cvv: "",
};

// Revisa los datos y regresa un objeto con los errores encontrados
function validar(datos) {
  const errores = {};
  const soloNumeros = (texto) => texto.replace(/\D/g, "");

  if (datos.nombre.trim().length < 3) {
    errores.nombre = "Escribe tu nombre completo.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) {
    errores.correo = "Escribe un correo válido.";
  }

  if (soloNumeros(datos.telefono).length !== 10) {
    errores.telefono = "El teléfono debe tener 10 dígitos.";
  }

  if (datos.entrega === "domicilio" && datos.direccion.trim().length < 10) {
    errores.direccion = "Escribe tu dirección completa.";
  }

  if (datos.pago === "tarjeta") {
    if (soloNumeros(datos.tarjeta).length !== 16) {
      errores.tarjeta = "La tarjeta debe tener 16 dígitos.";
    }

    if (datos.titular.trim().length < 3) {
      errores.titular = "Escribe el nombre como aparece en la tarjeta.";
    }

    const fecha = datos.vencimiento.match(/^(\d{2})\/(\d{2})$/);
    if (!fecha || Number(fecha[1]) < 1 || Number(fecha[1]) > 12) {
      errores.vencimiento = "Usa el formato MM/AA.";
    } else {
      // La tarjeta vence al final de ese mes
      const finDeMes = new Date(2000 + Number(fecha[2]), Number(fecha[1]), 1);
      if (finDeMes <= new Date()) errores.vencimiento = "La tarjeta está vencida.";
    }

    if (!/^\d{3}$/.test(datos.cvv)) {
      errores.cvv = "El CVV tiene 3 dígitos.";
    }
  }

  return errores;
}

export default function CheckoutForm() {
  const router = useRouter();
  const { items, total, vaciar, cargado } = useCart();
  const [datos, setDatos] = useState(datosIniciales);
  const [errores, setErrores] = useState({});
  const [procesando, setProcesando] = useState(false);

  const envio = datos.entrega === "domicilio" ? COSTO_ENVIO : 0;
  const totalFinal = total + envio;

  function alCambiar(e) {
    const { name } = e.target;
    let { value } = e.target;

    // Formatos automáticos para que sea más fácil escribir
    if (name === "tarjeta") {
      value = value
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, "$1 ");
    }
    if (name === "vencimiento") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    if (name === "cvv") value = value.replace(/\D/g, "").slice(0, 3);
    if (name === "telefono") value = value.replace(/[^\d\s-]/g, "").slice(0, 12);

    setDatos((anteriores) => ({ ...anteriores, [name]: value }));

    // Si el campo tenía error, se borra al escribir
    if (errores[name]) {
      setErrores((anteriores) => ({ ...anteriores, [name]: undefined }));
    }
  }

  function alEnviar(e) {
    e.preventDefault();

    const encontrados = validar(datos);
    setErrores(encontrados);

    if (Object.keys(encontrados).length > 0) {
      // Lleva al usuario al primer campo con error
      const primero = Object.keys(encontrados)[0];
      document.getElementById(`campo-${primero}`)?.focus();
      return;
    }

    setProcesando(true);

    // Simulamos que el "banco" tarda un poco en responder
    setTimeout(() => {
      const pedido = {
        folio: generarFolio(),
        fecha: new Date().toISOString(),
        cliente: {
          nombre: datos.nombre.trim(),
          correo: datos.correo.trim(),
          telefono: datos.telefono.trim(),
        },
        entrega: datos.entrega,
        direccion: datos.entrega === "domicilio" ? datos.direccion.trim() : "",
        pago: datos.pago,
        ultimos4: datos.pago === "tarjeta" ? datos.tarjeta.replace(/\D/g, "").slice(-4) : "",
        items,
        subtotal: total,
        envio,
        total: totalFinal,
      };

      try {
        localStorage.setItem(CLAVE_PEDIDO, JSON.stringify(pedido));
      } catch {}

      vaciar();
      router.push("/pedido-confirmado");
    }, 1800);
  }

  // Esperamos a que el carrito se lea de localStorage
  if (!cargado) return null;

  // Carrito vacío: no hay nada que pagar
  if (items.length === 0 && !procesando) {
    return (
      <div className="checkout-empty">
        <FiShoppingBag />
        <h2>Tu carrito está vacío</h2>
        <p>Agrega algunos productos antes de finalizar tu compra.</p>
        <Link href="/tienda" className="primary-button">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  // Ayuda para no repetir el mismo bloque en cada campo
  function campo(name, etiqueta, props = {}) {
    return (
      <div className={`checkout-field ${errores[name] ? "has-error" : ""}`}>
        <label htmlFor={`campo-${name}`}>{etiqueta}</label>
        <input
          id={`campo-${name}`}
          name={name}
          value={datos[name]}
          onChange={alCambiar}
          aria-invalid={Boolean(errores[name])}
          aria-describedby={errores[name] ? `error-${name}` : undefined}
          disabled={procesando}
          {...props}
        />
        {errores[name] && (
          <small id={`error-${name}`} className="checkout-error">
            {errores[name]}
          </small>
        )}
      </div>
    );
  }

  return (
    <div className="checkout-layout">
      <form className="checkout-form" onSubmit={alEnviar} noValidate>
        {/* 1. DATOS DE CONTACTO */}
        <fieldset className="checkout-block">
          <legend>1. Tus datos</legend>
          {campo("nombre", "Nombre completo", { autoComplete: "name" })}
          <div className="checkout-row">
            {campo("correo", "Correo electrónico", {
              type: "email",
              autoComplete: "email",
            })}
            {campo("telefono", "Teléfono", {
              type: "tel",
              autoComplete: "tel",
              placeholder: "10 dígitos",
            })}
          </div>
        </fieldset>

        {/* 2. ENTREGA */}
        <fieldset className="checkout-block">
          <legend>2. Entrega</legend>
          <div className="checkout-options">
            <label className={`checkout-option ${datos.entrega === "tienda" ? "selected" : ""}`}>
              <input
                type="radio"
                name="entrega"
                value="tienda"
                checked={datos.entrega === "tienda"}
                onChange={alCambiar}
                disabled={procesando}
              />
              <span>
                <strong>Recoger en tienda</strong>
                <small>Gratis · Sayula, Jalisco</small>
              </span>
            </label>

            <label className={`checkout-option ${datos.entrega === "domicilio" ? "selected" : ""}`}>
              <input
                type="radio"
                name="entrega"
                value="domicilio"
                checked={datos.entrega === "domicilio"}
                onChange={alCambiar}
                disabled={procesando}
              />
              <span>
                <strong>Envío a domicilio</strong>
                <small>{formatoPrecio(COSTO_ENVIO)} · 1 a 2 días</small>
              </span>
            </label>
          </div>

          {datos.entrega === "domicilio" &&
            campo("direccion", "Dirección (calle, número, colonia)", {
              autoComplete: "street-address",
            })}
        </fieldset>

        {/* 3. PAGO */}
        <fieldset className="checkout-block">
          <legend>3. Pago</legend>
          <div className="checkout-options">
            <label className={`checkout-option ${datos.pago === "tarjeta" ? "selected" : ""}`}>
              <input
                type="radio"
                name="pago"
                value="tarjeta"
                checked={datos.pago === "tarjeta"}
                onChange={alCambiar}
                disabled={procesando}
              />
              <FiCreditCard />
              <span>
                <strong>Tarjeta</strong>
                <small>Débito o crédito</small>
              </span>
            </label>

            <label className={`checkout-option ${datos.pago === "efectivo" ? "selected" : ""}`}>
              <input
                type="radio"
                name="pago"
                value="efectivo"
                checked={datos.pago === "efectivo"}
                onChange={alCambiar}
                disabled={procesando}
              />
              <FiDollarSign />
              <span>
                <strong>Efectivo</strong>
                <small>Al recibir tu pedido</small>
              </span>
            </label>
          </div>

          {datos.pago === "tarjeta" && (
            <>
              {campo("tarjeta", "Número de tarjeta", {
                inputMode: "numeric",
                autoComplete: "off",
                placeholder: "1234 5678 9012 3456",
              })}
              {campo("titular", "Nombre del titular", { autoComplete: "off" })}
              <div className="checkout-row">
                {campo("vencimiento", "Vencimiento", {
                  inputMode: "numeric",
                  autoComplete: "off",
                  placeholder: "MM/AA",
                })}
                {campo("cvv", "CVV", {
                  inputMode: "numeric",
                  autoComplete: "off",
                  placeholder: "123",
                })}
              </div>
            </>
          )}

          <p className="checkout-demo-note">
            <FiLock /> Compra simulada para fines escolares: no se realiza
            ningún cobro. Puedes usar cualquier número de 16 dígitos, como
            4242 4242 4242 4242.
          </p>
        </fieldset>

        <button type="submit" className="checkout-submit" disabled={procesando}>
          {procesando ? (
            <>
              <span className="checkout-spinner" aria-hidden="true" />
              Procesando pago…
            </>
          ) : (
            `Pagar ${formatoPrecio(totalFinal)}`
          )}
        </button>
      </form>

      {/* RESUMEN DEL PEDIDO */}
      <aside className="checkout-summary" aria-label="Resumen del pedido">
        <h2>Resumen del pedido</h2>

        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <Image src={item.imagen} alt={item.nombre} width={52} height={52} />
              <span>
                {item.nombre}
                <small>Cantidad: {item.cantidad}</small>
              </span>
              <strong>{formatoPrecio(item.precio * item.cantidad)}</strong>
            </li>
          ))}
        </ul>

        <div className="checkout-totals">
          <p>
            <span>Subtotal</span>
            <span>{formatoPrecio(total)}</span>
          </p>
          <p>
            <span>Envío</span>
            <span>{envio ? formatoPrecio(envio) : "Gratis"}</span>
          </p>
          <p className="checkout-grand-total">
            <span>Total</span>
            <span>{formatoPrecio(totalFinal)}</span>
          </p>
        </div>
      </aside>
    </div>
  );
}
