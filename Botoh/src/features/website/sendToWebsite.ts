export function sendToWebsite(player: any, message: string) {
  if ((global as any).backendSocket) {
    (global as any).backendSocket.emit('chat:message', {
      type: 'chat:message',
      data: {
        player: player.name,
        message: message,
        timestamp: Date.now()
      }
    });
  }
}
