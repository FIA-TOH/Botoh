import { colorNumberToHex } from '@/app/utils/race';
import { LogMessage } from '@/hooks/useLogs';
import { useEffect, useRef } from 'react';
import { useTranslations } from '@/i18n';

interface Props {
  logs?: LogMessage[];

  loading?: boolean;

  error?: string | null;
}

export function LogsPanel({
  logs = [],
  loading = false,
  error = null,
}: Props) {
  const { language, t } = useTranslations();
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = logsContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [logs.length]);

  return (
    <div
      className="p-4"
      style={{
        gridArea: 'logs',
        backgroundColor: '#1E1E1E',
        outline: '8px solid #FF232B',
      }}
    >
      <div
        ref={logsContainerRef}
        className="
          py-4
          overflow-y-auto
          max-h-64
          min-h-[260px]
        "
        style={{
          border: '2px solid #FFF',
        }}
      >

        {/* LOADING */}
        {loading && (
          <div
            className="
              h-full
              flex
              flex-col
              items-center
              justify-center
              gap-4
            "
          >
            <div
              className="
                w-10
                h-10
                border-4
                border-white/20
                border-t-red-500
                rounded-full
                animate-spin
              "
            />

            <span
              className="
                text-gray-300
                text-lg
                font-bold
              "
            >
              {t.logs.loading}
            </span>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            className="
              h-full
              flex
              flex-col
              items-center
              justify-center
              text-center
              px-6
            "
          >
            <div className="text-5xl mb-4">
              ⚠️
            </div>

            <div
              className="
                text-red-500
                font-bold
                text-lg
                mb-2
              "
            >
              {t.logs.loadError}
            </div>

            <div className="text-gray-400">
              {error}
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          logs.length === 0 && (
            <div
              className="
                h-full
                flex
                items-center
                justify-center
                text-gray-400
              "
            >
              {t.logs.empty}
            </div>
          )}

        {/* LOGS */}
        {!loading &&
          !error &&
          logs.length > 0 &&
          logs.map((log, index) => (
            <div
              key={index}
              className="text-sm px-3 mb-1"
            >
              <span className="text-red-500 font-semibold">
                {'>'}
              </span>

              <span
                className="ml-1"
                style={{
                  color: colorNumberToHex(log.color),
                }}
              >
                {typeof log.message === 'string'
                  ? log.message
                  : log.message[language] ?? log.message.pt}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}


