import PedidoConfirmado from "../../components/PedidoConfirmado";

export const metadata = {
  title: "Pedido confirmado",
};

export default function PaginaPedidoConfirmado() {
  return (
    <main>
      <section className="featured-products">
        <PedidoConfirmado />
      </section>
    </main>
  );
}
