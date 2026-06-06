import Navbar from './Navbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-app">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <Navbar />
        <main className="mt-8 md:mt-10">{children}</main>
      </div>
    </div>
  );
}
