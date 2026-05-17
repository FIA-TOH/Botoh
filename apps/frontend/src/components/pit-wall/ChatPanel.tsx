import { FtohButton } from '@/components/FtohButton';
import { FtohInput } from '@/components/FtohInput';
import { FtohSelectButton } from '@/components/FtohSelectButton';
import { colorNumberToHex } from '@/app/utils/race';
import { ChatMessage } from '@/hooks/useChat';
import { useEffect, useRef } from 'react';
import { useTranslations } from '@/i18n';


interface Props {
  messages?: ChatMessage[];

  message: string;

  setMessage: (value: string) => void;

  handleSendMessage: (
    e: React.FormEvent
  ) => void;

  isConnected: boolean;
  isMuted?: boolean;
  recipientOptions: string[];
  onSelectRecipient: (option: string) => void;

  loading?: boolean;

  error?: string | null;
}

export function ChatPanel({
  messages = [],
  message,
  setMessage,
  handleSendMessage,
  isConnected,
  isMuted = false,
  recipientOptions,
  onSelectRecipient,
  loading = false,
  error = null,
}: Props) {
  const { t } = useTranslations();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages.length]);

  return (
    <div
      style={{
        gridArea: 'chat',
        backgroundColor: '#1E1E1E',
        outline: '8px solid #FF232B',
      }}
      className="p-4"
    >
      <div className="h-full flex flex-col gap-3">

        {/* Messages area */}
        <div
          ref={messagesContainerRef}
          className="
            py-4
            flex-1
            overflow-y-auto
            min-h-0
            max-h-64
          "
          style={{
            backgroundColor: '#1E1E1E',
            border: '2px solid #FFFFFF',
            borderRadius: '0',
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
                {t.chat.loading}
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
                {t.chat.loadError}
              </div>

              <div className="text-gray-400">
                {error}
              </div>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            messages.length === 0 && (
              <p className="text-gray-400 text-center">
                {t.chat.empty}
              </p>
            )}

          {/* MESSAGES */}
          {!loading &&
            !error &&
            messages.length > 0 &&
            messages.map((msg, index) => {

              const teamColor =
                colorNumberToHex(msg.color);

              return (
                <div
                  key={index}
                  className="text-sm"
                  style={{
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{
                      color: teamColor,
                      fontWeight: 600,
                    }}
                  >
                    {msg.player}:
                  </span>

                  <span className="text-gray-200 ml-1">
                    {msg.message}
                  </span>
                </div>
              );
            })}
        </div>

        {/* INPUT */}
        <form
          onSubmit={handleSendMessage}
          className="flex gap-2"
        >
          <FtohInput
            type="text"
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder={t.chat.placeholder}
            className="flex-1"
            variant="white"
            disabled={
              loading ||
              !!error ||
              !isConnected ||
              isMuted
            }
          />

          <FtohButton
            type="submit"
            disabled={
              !isConnected ||
              !message.trim() ||
              message.trim().startsWith('!') ||
              loading ||
              !!error ||
              isMuted
            }
            className="px-3 py-2 !w-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                d="
                  M3.478 2.405
                  a.75.75 0 00-.926.94
                  l2.432 7.905H13.5
                  a.75.75 0 010 1.5H4.984
                  l-2.432 7.905
                  a.75.75 0 00.926.94
                  60.519 60.519 0 0018.445-8.986
                  .75.75 0 000-1.218
                  A60.517 60.517 0 003.478 2.405z
                "
              />
            </svg>
          </FtohButton>
        </form>

        {/* SELECT */}
        <FtohSelectButton
          label={t.chat.everyone}
          options={recipientOptions}
          onSelect={onSelectRecipient}
        />
      </div>
    </div>
  );
}


