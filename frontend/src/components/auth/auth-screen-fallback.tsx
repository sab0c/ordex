type AuthScreenFallbackProps = {
  message: string;
};

export function AuthScreenFallback({
  message,
}: Readonly<AuthScreenFallbackProps>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      {message}
    </div>
  );
}
