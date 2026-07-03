# Public Game Flow

Este documento descreve a sequencia temporal do host publico controlada por `publicGameFLow.ts`.

## Quando a corrida termina

Fluxo usado quando `generalGameMode` esta em `GENERAL_RACE`.

| Tempo acumulado | Evento |
| ---: | --- |
| 0s | Envia resultado da corrida para o Discord. |
| 0s | Mostra posicoes finais no Haxball. |
| 0s | Reseta players e reordena pela posicao final da corrida. |
| 0s | Muda para `WAITING`, carrega `Wait Room - By Ximb` e inicia o jogo. |
| 1s | Processa pontos do campeonato publico e envia para cada piloto quanto ganhou, total, posicao e gap no campeonato. |
| 5s | Inicia sessao de votacao de circuito. |
| 15s | Envia mensagem do Discord no chat. |
| 25s | Se pneus estiverem ativos, muta/libera chat via comando de mute e explica pneus. |
| 30s | Se pneus estiverem ativos, explica ERS. |
| 35s | Se pneus estiverem ativos, anuncia proxima sessao em 15s. |
| 25s | Se pneus nao estiverem ativos, explica ERS sem mutar o chat. |
| 35s | Se pneus nao estiverem ativos, anuncia proxima sessao em 15s. Esses 10s compensam o tempo que ficaria mutado no fluxo com pneus. |
| 38s | Se pneus estiverem ativos, alterna mute novamente. Sem pneus, o chat permanece aberto. |
| 50s | Fecha e trava o vencedor da votacao. |
| 50s | Para o jogo atual naturalmente. |
| 51s | Carrega o circuito vencedor, reseta players e inicia a proxima sessao. |

Depois disso:

- Se `qualyForPub` estiver ativo, entra em `QUALY`.
- Se `qualyForPub` estiver desativado, define voltas para `DEFAULT_LAPS` e entra direto em `RACE`.

Tempo total aproximado:

- Com pneus ativos: `51s` ate a proxima sessao iniciar.
- Sem pneus ativos: `51s` ate a proxima sessao iniciar.

## Quando a classificacao termina

Fluxo usado quando `generalGameMode` esta em `GENERAL_QUALY`.

| Tempo acumulado | Evento |
| ---: | --- |
| 0s | Envia resultado da qualy para o Discord. |
| 0s | Mostra tempos no Haxball. |
| 0s | Reordena players para corrida. |
| 0s | Move players para o lado correto. |
| 0s | Reseta players. |
| 0s | Muda para `WAITING`, carrega `Wait Qualy Room - By Ximb` e inicia o jogo. |
| 1s | Processa XP/ranking publico da qualy e envia para cada piloto quanto ganhou/perdeu, total, ranking atual e mudanca de ranking quando acontecer. |
| 5s | Envia mensagem do Discord no chat. |
| 15s | Se pneus estiverem ativos, muta/libera chat via comando de mute e explica pneus. |
| 20s | Se pneus estiverem ativos, explica ERS. |
| 25s | Se pneus estiverem ativos, anuncia corrida em 5s. |
| 15s | Se pneus nao estiverem ativos, explica ERS sem mutar o chat. |
| 25s | Se pneus nao estiverem ativos, anuncia corrida em 5s. Esses 10s compensam o tempo que ficaria mutado no fluxo com pneus. |
| 25s | Se pneus estiverem ativos, alterna mute novamente logo apos o anuncio. Sem pneus, o chat permanece aberto. |
| 30s | Para o jogo atual naturalmente. |
| 31s | Define voltas para `DEFAULT_LAPS`, entra em `RACE`, carrega o mapa da votacao e inicia a corrida. |

Tempo total aproximado:

- Com pneus ativos: `31s` ate a corrida iniciar.
- Sem pneus ativos: `31s` ate a corrida iniciar.

## Quando aparecem pontos e XP

O salvamento de progresso acontece no inicio do fluxo de fim de sessao, antes de limpar os dados dos jogadores e antes de entrar no mapa de espera. Os avisos privados ficam guardados e sao enviados 1 segundo depois que o host entra no mapa de espera.

- Pontos do campeonato: `settlePublicRaceChampionship(room, { deferMessages: true })` roda ainda na pista da corrida, antes de `resetPlayers`. A mensagem privada e enviada 1 segundo depois em `Wait Room - By Ximb`.
- XP de ranking: `settlePublicQualyRanking(room, { deferMessages: true })` roda ainda na pista da qualy, antes de `resetPlayers`. A mensagem privada e enviada 1 segundo depois em `Wait Qualy Room - By Ximb`.

## Pausa saudavel quando a sala fica vazia

Antes do fluxo comecar e depois de cada espera, o host verifica se ainda existe jogador na sala.

Se nao houver jogadores:

- a sessao de votacao e cancelada;
- o fluxo para imediatamente;
- o host fica aguardando um jogador entrar para retomar de forma saudavel.

## Mapas de espera

O fluxo usa dois mapas de espera:

- `Wait Room - By Ximb`: usado depois de uma corrida, antes da votacao e da proxima sessao.
- `Wait Qualy Room - By Ximb`: usado depois de uma qualy, antes da corrida.

## Observacoes importantes

- O vencedor da votacao e travado antes do jogo ser parado no fim do fluxo pos-corrida.
- A corrida publica sempre volta para `DEFAULT_LAPS` antes de iniciar em modo `RACE`.
- Se o mapa vencedor da votacao nao puder ser usado apos a qualy, o host tenta voltar para o ultimo mapa publico de corrida usado.
