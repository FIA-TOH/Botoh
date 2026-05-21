export interface ChatMessage {
  player: string;
  message: string;
  timestamp: number;
}

export interface LogMessage {
  message: string;
  timestamp: number;
}

export const mockMessages: ChatMessage[] = [
  {
    player: 'Max Verstappen',
    message: 'Boa largada!',
    timestamp: Date.now() - 100000,
  },

  {
    player: 'Lewis Hamilton',
    message:
      'Vou tentar ultrapassar na próxima curva',
    timestamp: Date.now() - 95000,
  },

  {
    player: 'Charles Leclerc',
    message: 'Pneus estão aquecendo bem',
    timestamp: Date.now() - 90000,
  },

  {
    player: 'Lando Norris',
    message:
      'Alguém viu o que aconteceu com o Sainz?',
    timestamp: Date.now() - 85000,
  },

  {
    player: 'Carlos Sainz',
    message:
      'Tive um pequeno problema no motor',
    timestamp: Date.now() - 80000,
  },

  {
    player: 'Fernando Alonso',
    message:
      'Essa estratégia de duas paradas parece boa',
    timestamp: Date.now() - 70000,
  },

  {
    player: 'George Russell',
    message: 'P3',
    timestamp: Date.now() - 65000,
  },

  {
    player: 'Oscar Piastri',
    message:
      'Primeira corrida aqui, aprendendo muito!',
    timestamp: Date.now() - 60000,
  },

  {
    player: 'Pierre Gasly',
    message:
      'Cuidado na chicane, está escorregadia',
    timestamp: Date.now() - 55000,
  },

  {
    player: 'Daniel Ricciardo',
    message: 'Shoey! 🍾',
    timestamp: Date.now() - 20000,
  },
];

export const mockLogs: LogMessage[] = [
  {
    message: 'Corrida começou',
    timestamp: Date.now() - 120000,
  },

  {
    message: 'Volta 1/40',
    timestamp: Date.now() - 115000,
  },

  {
    message: 'Pit stop - Max Verstappen',
    timestamp: Date.now() - 110000,
  },

  {
    message: 'Safety car deployed',
    timestamp: Date.now() - 100000,
  },

  {
    message: 'Safety car ended',
    timestamp: Date.now() - 95000,
  },

  {
    message:
      'Yellow flag - incidente na curva 3',
    timestamp: Date.now() - 75000,
  },

  {
    message: 'Green flag',
    timestamp: Date.now() - 70000,
  },

  {
    message:
      'Fastest lap - Max Verstappen',
    timestamp: Date.now() - 50000,
  },

  {
    message: 'Red flag - acidente grave',
    timestamp: Date.now() - 30000,
  },

  {
    message: 'Race resumed',
    timestamp: Date.now() - 20000,
  },

  {
    message: 'Volta 10/40',
    timestamp: Date.now() - 5000,
  },
];