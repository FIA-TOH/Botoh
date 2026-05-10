import { FtohButton } from '@/components/FtohButton';
import { FtohInput } from '@/components/FtohInput';
import { FtohSelectButton } from '@/components/FtohSelectButton';

import { mockRaceData } from '@/mocks/raceData';

interface Props {
  messages?: any[];

  message: string;

  setMessage: (value: string) => void;

  handleSendMessage: (
    e: React.FormEvent
  ) => void;

  isConnected: boolean;

  loading?: boolean;

  error?: string | null;
}

export function ChatPanel({
  messages = [],
  message,
  setMessage,
  handleSendMessage,
  isConnected,
  loading = false,
  error = null,
}: Props) {
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
                Carregando mensagens...
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
                Erro ao carregar chat
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
                Sem mensagens ainda...
              </p>
            )}

          {/* MESSAGES */}
          {!loading &&
            !error &&
            messages.length > 0 &&
            messages.map((msg, index) => {

              const driver =
                mockRaceData.drivers.find(
                  (d) => d.name === msg.player
                );

              const teamColor =
                driver?.teamColor || '#FFFFFF';

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
            placeholder="Digite sua mensagem..."
            className="flex-1"
            variant="white"
            disabled={
              loading ||
              !!error ||
              !isConnected
            }
          />

          <FtohButton
            type="submit"
            disabled={
              !isConnected ||
              !message.trim() ||
              loading ||
              !!error
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
          label="Selecionar opção"
          options={[
            'Todos',
            'Equipe',
            'Piloto 1',
            'Piloto 2',
          ]}
          onSelect={(option) =>
            console.log(
              'Selecionado:',
              option
            )
          }
        />
      </div>
    </div>
  );
}