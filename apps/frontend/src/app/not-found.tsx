'use client';

import { useRouter } from 'next/navigation';
import { FtohButton } from '@/components/FtohButton';
import { useTranslations } from '@/i18n';

export default function NotFoundPage() {
  const router = useRouter();
  const { t } = useTranslations();

  return (
    <main
      className="relative flex h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-6 text-white"
      style={{ backgroundImage: 'url(/img/bg/loginbg.png)' }}
    >
      <div className="absolute inset-0 bg-black opacity-[0.29]" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] bg-[#AF0034] opacity-[0.67]"
        aria-hidden="true"
      />

      <section className="relative z-10 flex w-full max-w-2xl flex-col items-center border-8 border-[#FF0000] bg-[#1E1E1E]/95 px-8 py-10 text-center shadow-2xl sm:px-12">
        <p className="text-8xl font-extrabold leading-none tracking-normal text-[#FF232B] sm:text-9xl">
          404
        </p>
        <h1 className="mt-4 text-3xl font-extrabold uppercase tracking-normal sm:text-5xl">
          {t.notFound.title}
        </h1>
        <p className="mt-4 max-w-xl text-base font-medium text-gray-200 sm:text-lg">
          {t.notFound.message}
        </p>

        <div className="mt-8 w-full max-w-xs">
          <FtohButton type="button" onClick={() => router.push('/')}>
            {t.notFound.backHome}
          </FtohButton>
        </div>
      </section>
    </main>
  );
}
