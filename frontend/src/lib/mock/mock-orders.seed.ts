import type { OrderStatus } from "@/lib/api";

export type MockOrderSeed = {
  cliente: string;
  descricao: string;
  valor_estimado: string;
  status: OrderStatus;
  data_criacao: string;
};

const clientes = [
  "Carla Renata Almeida",
  "Felipe Romao Duarte",
  "Eduarda Fabricia Lima",
  "Diego Martin Farias",
  "Bruno Goncalves Rocha",
  "Larissa Mendes Araujo",
  "Marcos Vinicius Freitas",
  "Aline Costa Brito",
  "Leticia Ramos Teixeira",
  "Paulo Henrique Assis",
  "Fernanda Souza Mota",
  "Joao Pedro Nogueira",
  "Camila Torres Vieira",
  "Rafael Martins Lopes",
  "Bianca Sales Pires",
  "Rodrigo Santana Melo",
  "Tatiane Barros Dias",
  "Gustavo Ferreira Luz",
  "Vanessa Campos Reis",
  "Caio Henrique Prado",
  "Renata Gomes Silva",
  "Mateus Cardoso Leal",
  "Patricia Neves Moura",
  "Thiago Almeida Porto",
  "Juliana Castro Freire",
  "Leonardo Ribeiro Paz",
  "Priscila Tavares Cordeiro",
  "Henrique Bastos Moreira",
  "Amanda Figueiredo Paiva",
  "Samuel Correia Dantas",
  "Monica Peixoto Aguiar",
  "Vinicius Oliveira Braga",
  "Beatriz Chaves Monteiro",
  "Murilo Azevedo Cunha",
  "Isabela Duarte Sampaio",
  "Douglas Pereira Valenca",
];

const descricoes = [
  "Instalação de SSD e clonagem",
  "Atualização de sistema e backup",
  "Substituição de teclado",
  "Limpeza interna completa",
  "Troca de conector de carga",
  "Reparo em dobradiça lateral",
  "Configuração de impressora em rede",
  "Formatação com reinstalação de programas",
  "Diagnóstico de superaquecimento",
  "Troca de tela quebrada",
  "Revisão elétrica preventiva",
  "Upgrade de memória RAM",
  "Troca de bateria e calibração",
  "Recuperação de sistema operacional",
  "Ajuste de tampa e carcaça",
  "Instalação de pacote Office",
  "Configuração de acesso remoto",
  "Reparo em placa de vídeo",
  "Higienização com troca de pasta térmica",
  "Remoção de vírus e otimização",
  "Troca de webcam e microfone",
  "Revisão de fonte e voltagem",
  "Configuração de scanner fiscal",
  "Correção de falha de boot",
  "Substituição de cooler",
  "Sincronização de e-mail corporativo",
  "Troca de HD por SSD NVMe",
  "Ajuste de rede e roteamento local",
  "Instalação de memória adicional",
  "Reparo em touchpad",
  "Atualização de BIOS e firmware",
  "Configuração de ponto de rede",
  "Troca de dobradiça e moldura",
  "Limpeza lógica e organização de arquivos",
  "Configuração de acesso biométrico",
  "Atualização de certificado digital",
];

const valores = [
  "450.00",
  "390.00",
  "275.90",
  "210.00",
  "180.50",
  "320.00",
  "145.00",
  "260.00",
  "199.90",
  "520.00",
  "340.00",
  "230.00",
  "310.00",
  "280.00",
  "165.00",
  "190.00",
  "240.00",
  "610.00",
  "255.00",
  "175.00",
  "330.00",
  "295.00",
  "220.00",
  "205.00",
  "185.00",
  "160.00",
  "490.00",
  "270.00",
  "215.00",
  "145.00",
  "350.00",
  "260.00",
  "410.00",
  "225.00",
  "375.00",
  "235.00",
];

const statuses: MockOrderSeed["status"][] = [
  "Aberta",
  "Em andamento",
  "Cancelada",
  "Aberta",
  "Em andamento",
  "Concluída",
  "Aberta",
  "Em andamento",
  "Concluída",
  "Cancelada",
  "Aberta",
  "Em andamento",
  "Concluída",
  "Aberta",
  "Em andamento",
  "Cancelada",
  "Concluída",
  "Aberta",
  "Em andamento",
  "Concluída",
  "Aberta",
  "Cancelada",
  "Em andamento",
  "Concluída",
  "Aberta",
  "Em andamento",
  "Cancelada",
  "Concluída",
  "Aberta",
  "Em andamento",
  "Concluída",
  "Aberta",
  "Cancelada",
  "Em andamento",
  "Aberta",
  "Concluída",
];

function buildCreationDate(index: number): string {
  const date = new Date();
  const totalItems = clientes.length;
  const daysAgo = totalItems - index - 1;

  date.setDate(date.getDate() - daysAgo);
  date.setHours(8 + (index % 9), 6 + ((index * 7) % 50), 0, 0);

  return date.toISOString();
}

function getSeedValue<T>(items: readonly T[], index: number): T {
  return items[index % items.length] as T;
}

export const mockOrdersSeed: MockOrderSeed[] = clientes.map((cliente, index) => {
  return {
    cliente,
    descricao: getSeedValue(descricoes, index),
    valor_estimado: getSeedValue(valores, index),
    status: getSeedValue(statuses, index),
    data_criacao: buildCreationDate(index),
  };
});
