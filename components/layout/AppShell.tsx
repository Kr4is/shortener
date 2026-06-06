import Navbar from './Navbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <Navbar />
        <main className="mt-8">{children}</main>
      </div>
    </div>
  );
}
