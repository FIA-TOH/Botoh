import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function PitWallLayout({
  children,
}: Props) {
  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white p-8 relative overflow-hidden"
      style={{
        backgroundImage:
          'url(/img/bg/pitwallwpp.png)',
      }}
    >
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ opacity: 0.67 }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {children}
      </div>
    </main>
  );
}