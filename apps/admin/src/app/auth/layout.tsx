export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-dvh w-full flex justify-center items-center px-5">
      {children}
    </main>
  );
}
