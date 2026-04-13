import { render, screen } from "@testing-library/react";
import { OrdersTable } from "./orders-table";

describe("OrdersTable", () => {
  it("renderiza o estado vazio quando nao ha ordens", () => {
    render(
      <OrdersTable
        error={null}
        isLoading={false}
        orders={[]}
        total={0}
      />,
    );

    expect(
      screen.getByText("Nenhuma ordem encontrada para os filtros informados."),
    ).toBeInTheDocument();
    expect(screen.getByText("0 ordem(ns) encontrada(s).")).toBeInTheDocument();
  });

  it("renderiza os dados formatados da ordem", () => {
    render(
      <OrdersTable
        error={null}
        isLoading={false}
        orders={[
          {
            id: 13,
            cliente: "Carla Renata",
            descricao: "Instalacao de SSD e clonagem",
            valor_estimado: "450",
            status: "Aberta",
            data_criacao: "2026-04-12T21:32:00.000Z",
            data_atualizacao: "2026-04-12T21:32:00.000Z",
          },
        ]}
        total={1}
      />,
    );

    expect(screen.getByText("#13")).toBeInTheDocument();
    expect(screen.getByText("Carla Renata")).toBeInTheDocument();
    expect(
      screen.getAllByText("Instalacao de SSD e clonagem"),
    ).toHaveLength(2);
    expect(screen.getByText("Aberta")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*450,00/)).toBeInTheDocument();
  });
});
