export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-100 text-slate-900 min-h-screen font-sans">
      {children}
    </div>
  );
}
