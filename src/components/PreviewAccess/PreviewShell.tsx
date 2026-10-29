/** Card with the Beachrex logo for the closed-website pages. */
export default function PreviewShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/BeachRex_CGP/01_Logo/Horizontal/SVG/beachrex_horizontal_color.svg"
          alt="BeachRex"
          width={180}
          height={40}
          className="mb-6 h-auto w-[180px]"
        />
        <h1 className="mb-4 text-xl font-bold" style={{ color: '#1A3C68' }}>
          {title}
        </h1>
        {children}
      </div>
    </main>
  );
}
