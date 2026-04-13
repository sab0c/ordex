import { LogoMark } from "@/components/brand/logo-mark";
import { LoginForm } from "@/components/login/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

const featureList = [
  "Controle completo das ordens de serviço em todas as etapas.",
  "Centralização das demandas com priorização e acompanhamento contínuo.",
  "Monitoramento de status e apoio à tomada de decisão operacional.",
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="hero-aurora pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-5 lg:px-10 lg:py-4">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                Ordex
              </p>
              <p className="text-sm text-muted-foreground">
                Sistema de ordens de serviço
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <section className="grid flex-1 items-center gap-8 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-10">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-balance text-foreground md:text-5xl">
                Gestão completa de ordens de serviço com controle e rastreabilidade.
              </h1>
              <p className="max-w-lg text-sm leading-7 text-muted-foreground md:text-base">
                Informações atualizadas em tempo real para otimizar o desempenho da sua equipe.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {featureList.map((item) => (
                <article
                  key={item}
                  className="feature-card rounded-3xl p-5"
                >
                  <div className="feature-card__accent-bar mb-4 h-2 w-14 rounded-full bg-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
