"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setStoredAccessToken } from "@/lib/auth";
import { loginRequest } from "@/lib/api";
import { appRoutes } from "@/lib/routes";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

type FormErrors = {
  username?: string;
  password?: string;
  form?: string;
};

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (username.trim().length === 0) {
      nextErrors.username = "Informe o usuário ou e-mail.";
    }

    if (password.trim().length === 0) {
      nextErrors.password = "Informe a senha.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await loginRequest({
        username: username.trim(),
        password,
      });

      setStoredAccessToken(response.access_token);
      router.push(appRoutes.dashboard);
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Não foi possível realizar o login.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="login-panel w-full max-w-md p-8 lg:min-h-[380px]">
      <div className="mb-10 space-y-3">
        <span className="glass-chip inline-flex rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Ambiente seguro
        </span>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Acessar sua conta
          </h2>
          <p className="text-sm text-muted-foreground">
            Ambiente de demonstração: use <span className="font-medium text-foreground">admin</span> /{" "}
            <span className="font-medium text-foreground">admin</span>.
          </p>
        </div>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <Input
            autoComplete="username"
            error={errors.username}
            id="username"
            label="Usuário ou e-mail"
            placeholder="Digite seu usuário ou e-mail"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <Input
            autoComplete="current-password"
            error={errors.password}
            id="password"
            label="Senha"
            placeholder="Digite sua senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="mt-2 space-y-4">
          {errors.form ? (
            <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {errors.form}
            </div>
          ) : null}

          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? "Acessando..." : "Acessar painel"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
