import CheckoutForm from "../../components/CheckoutForm";

export const metadata = {
  title: "Finalizar compra",
};

export default function Checkout() {
  return (
    <main>
      <section className="featured-products">
        <div className="section-heading">
          <span>CASI LISTO</span>
          <h1>Finalizar compra</h1>
        </div>

        <CheckoutForm />
      </section>
    </main>
  );
}
