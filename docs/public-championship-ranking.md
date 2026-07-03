# Sistema Publico de Campeonato e Ranking

Este documento explica como ficou a v1 do sistema publico de campeonato, ranking e XP. Tudo que esta aqui e separado do sistema atual de liga, scuderias, garagem, pitwall e usuarios da liga.

## Visao Geral

O modo publico agora tem dois tipos de progressao:

1. **Ranking XP**
   - Mede a velocidade do piloto.
   - E ganho ou perdido no fim da classificacao.
   - Usa a melhor volta do piloto comparada ao recorde da pista.

2. **Pontos de Campeonato**
   - Mede resultado de corrida.
   - E ganho no fim da corrida.
   - Usa posicao final, quantidade de pilotos, ranking do piloto e ranking medio da sala.

O jogador precisa estar logado na conta publica para pontuar.

Se os servidores/backend/banco estiverem offline, a sala publica funciona sem login e sem pontuacao. Nesse caso `!cadastro` e `!login` avisam que os servidores estao desligados.

## Conta Publica

Tabela principal:

```sql
public_users
```

Campos principais:

| Campo | Uso |
| --- | --- |
| `auth` | ID unico do Haxball. E a chave da conta publica. |
| `name` | Ultimo nome usado pelo jogador. |
| `password_hash` | Senha com hash PBKDF2. |
| `created_at` | Quando a conta foi criada. |
| `updated_at` | Ultima atualizacao. |
| `last_login_at` | Ultimo login. |

Comandos:

```txt
!cadastro SENHA
!cadastrar SENHA
!login SENHA
```

Depois de criar conta, o piloto recebe tambem um perfil competitivo.

## Perfil Competitivo

Tabela:

```sql
public_driver_profiles
```

Campos:

| Campo | Uso |
| --- | --- |
| `auth` | Mesmo auth do `public_users`. |
| `name` | Nome atual do piloto. |
| `ranking_xp` | XP usado para definir o ranking. |
| `championship_points` | Pontos acumulados no campeonato publico. |
| `placement_races_remaining` | Corridas restantes para definir ranking inicial. Comeca em 5. |
| `placement_performance_sum` | Soma das diferencas percentuais contra o recorde durante o MD5. |
| `placement_performance_count` | Quantidade de qualys registradas no MD5. |
| `placement_ranking_applied` | Indica se o XP inicial do MD5 ja foi aplicado. |
| `races_count` | Quantidade de corridas pontuadas. |
| `qualy_count` | Quantidade de classificacoes registradas para ranking/MD5. |
| `created_at` | Criacao do perfil. |
| `updated_at` | Ultima atualizacao. |

Ao logar, o bot diz uma das duas mensagens:

```txt
Voce tem X corridas para definir seu ranking.
```

ou:

```txt
Bem vindo! Seu ranking e XXXXX, com XXXX pontos, faltam XXXX pontos para o ranking XXXXX.
```

## Rankings

Os rankings atuais sao:

| Ranking | XP minimo |
| --- | ---: |
| Kart | 0 |
| Formula 4 | 350 |
| Formula 3 | 900 |
| Formula 2 | 1600 |
| Formula 1 | 2600 |

Observacao: durante as 5 primeiras corridas, o piloto aparece como `Rookie`, mesmo que ja tenha XP suficiente para um ranking.

## MD5: Ranking Inicial

As 5 primeiras corridas sao uma fase de calibracao, nao uma fase normal de progressao.

Durante o MD5:

- A tabela normal de XP nao e aplicada.
- A cada qualy, o sistema guarda a diferenca percentual da melhor volta do piloto contra o recorde da pista.
- No fim da 5a corrida, o sistema calcula a media das 5 melhores performances registradas.
- Essa media vira o XP inicial do piloto.
- Depois disso, o piloto sai de `Rookie` e passa a usar a tabela normal de XP.

Formula da performance salva:

```txt
performancePercent = max(0, ((melhor_volta / recorde_da_pista) - 1) * 100)
```

Conversao final do MD5:

| Media contra o recorde no MD5 | XP inicial |
| ---: | ---: |
| 0.00% a 0.25% | 2800 |
| 0.26% a 0.50% | 2400 |
| 0.51% a 0.75% | 2000 |
| 0.76% a 1.00% | 1650 |
| 1.01% a 1.50% | 1200 |
| 1.51% a 2.00% | 900 |
| 2.01% a 3.00% | 550 |
| 3.01% a 4.00% | 300 |
| 4.01%+ | 100 |

Tabela de eventos do MD5:

```sql
public_placement_events
```

Campos principais:

| Campo | Uso |
| --- | --- |
| `auth` | Piloto. |
| `player_name` | Nome usado na sessao. |
| `track_name` | Pista. |
| `lap_time` | Melhor volta usada no MD5. |
| `track_record` | Recorde usado para calcular a porcentagem. |
| `performance_percent` | Diferenca percentual contra o recorde. Quanto menor, melhor. |
| `created_at` | Data do evento. |

Exemplos:

| Perfil do piloto | Media aproximada | XP inicial | Ranking provavel |
| --- | ---: | ---: | --- |
| Muito iniciante | 4.01%+ | 100 | Kart |
| Novato decente | 2.01% a 3.00% | 550 | Formula 4 |
| Bom piloto | 1.51% a 2.00% | 900 | Formula 3 |
| Muito rapido | 0.76% a 1.00% | 1650 | Formula 2 |
| Elite | 0.00% a 0.50% | 2400 a 2800 | Formula 1 |

## XP de Ranking na Qualy

Depois do MD5, no fim da qualy, o sistema pega a melhor volta de cada piloto logado e compara com o recorde da pista:

```txt
ratio = melhor_volta_do_piloto / recorde_da_pista
```

Se a pista nao tiver recorde valido, a qualy nao distribui XP.

### Tabela de XP

O ganho/perda de XP e definido por tabela, usando o ranking atual do piloto e a diferenca percentual da melhor volta contra o recorde da pista.

O sistema usa interpolacao linear entre os pontos da tabela. Isso evita saltos bruscos. Exemplo: se um Formula 1 faz `60.650s` em uma pista com recorde de `60.000s`, ele fica entre a linha de `1.0%` (`0 XP`) e a linha de `2.0%` (`-30 XP`), entao recebe aproximadamente `-3 XP`, nao `-30 XP`.

O XP nunca fica abaixo de zero no banco:

```txt
ranking_xp = max(0, ranking_xp + xp_delta)
```

### Exemplos de XP

Suponha uma pista com recorde de `60.000s`.

| Volta | Dif. vs recorde | Kart | Formula 3 | Formula 4 | Formula 2 | Formula 1 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 60.000 | 0.0% | +100 | +90 | +75 | +65 | +50 |
| 60.300 | 0.5% | +75 | +60 | +40 | +25 | +10 |
| 60.600 | 1.0% | +60 | +30 | +15 | +5 | 0 |
| 61.200 | 2.0% | +25 | +15 | +5 | -5 | -30 |
| 62.100 | 3.5% | +15 | +5 | -10 | -40 | -80 |
| 63.000 | 5.0% | +5 | -10 | -40 | -80 | -100 |

Interpretacao:

- Um Kart evolui com mais facilidade e quase sempre ganha XP se completar uma volta razoavel.
- Um Formula 1 precisa ficar extremamente perto do recorde para continuar ganhando XP.
- Entre duas linhas, o valor e proporcional. Por exemplo, no Formula 1, `1.5%` acima do recorde fica no meio entre `0 XP` e `-30 XP`, entao da cerca de `-15 XP`.
- Voltas acima de 5.0% do recorde usam a ultima linha da tabela.

## Pontos de Campeonato na Corrida

No fim da corrida, o sistema usa:

| Dado | Origem |
| --- | --- |
| `position` | Posicao final em `positionList`. |
| `playersCount` | Quantidade de pilotos logados que terminaram/entraram no resultado. |
| `ranking_xp` | XP atual do piloto. |
| `averageRankingXp` | Media de XP dos pilotos logados na corrida. |

Formula:

```txt
fieldBonus = sqrt(playersCount)
performance = (playersCount - position + 1) / playersCount
base = performance * 28 * fieldBonus

rankDifficulty = averageRankingXp / max(250, ranking_xp)
rankDifficulty limitado entre 0.45 e 1.8

podiumBonus:
  P1 = +8
  P2 = +4
  P3 = +2
  outros = +0

rawPoints = base * rankDifficulty + podiumBonus - (1 - performance) * 4
points = max(0, round(rawPoints))
```

Ideia do sistema:

- Ganhar de uma sala forte da muitos pontos.
- Jogador com ranking baixo em sala forte ganha mais se performar bem.
- Jogador com ranking alto em sala fraca ganha menos.
- Resultado ruim pode render poucos ou zero pontos, mas na v1 nao tira pontos de campeonato.

## Historico Global

O sistema guarda eventos alem do total no perfil.

### XP de qualy

Tabela:

```sql
public_ranking_events
```

Campos principais:

| Campo | Uso |
| --- | --- |
| `auth` | Piloto. |
| `player_name` | Nome usado na sessao. |
| `track_name` | Pista. |
| `lap_time` | Melhor volta do piloto. |
| `track_record` | Recorde usado no calculo. |
| `xp_delta` | XP ganho/perdido. |
| `xp_after` | XP total depois do evento. |
| `created_at` | Data do evento. |

### Pontos de corrida

Tabela:

```sql
public_championship_events
```

Campos principais:

| Campo | Uso |
| --- | --- |
| `auth` | Piloto. |
| `player_name` | Nome usado na sessao. |
| `track_name` | Pista. |
| `position` | Posicao final. |
| `players_count` | Quantidade de pilotos considerados. |
| `average_ranking_xp` | Ranking medio da sala. |
| `points_delta` | Pontos ganhos na corrida. |
| `points_after` | Total depois da corrida. |
| `ranking_xp_at_race` | XP do piloto no momento da corrida. |
| `created_at` | Data do evento. |

Com isso, no futuro da para montar:

- leaderboard de campeonato;
- leaderboard de ranking;
- pagina de perfil de piloto;
- historico de progresso por pista;
- ranking por melhor evolucao;
- grafico de XP ao longo do tempo.

## Simulacoes de Corrida

### Simulacao 1: Sala media, 6 pilotos, ranking medio 900 XP

Ranking medio da sala: `900`.

Pontos por posicao:

| XP do piloto | P1 | P2 | P3 | P4 | P5 | P6 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 131 | 106 | 83 | 60 | 38 | 17 |
| 300 | 131 | 106 | 83 | 60 | 38 | 17 |
| 900 | 77 | 60 | 46 | 32 | 20 | 8 |
| 1600 | 47 | 35 | 26 | 17 | 10 | 3 |
| 2600 | 39 | 29 | 21 | 13 | 8 | 2 |

Leitura:

- Um Kart vencendo uma sala media ganha muitos pontos.
- Um Formula 1 vencendo a mesma sala ainda ganha, mas muito menos.
- O sistema entende que para um piloto forte era esperado performar bem.

### Simulacao 2: Novato vence sala forte

Dados:

| Campo | Valor |
| --- | ---: |
| Posicao | 1 |
| Pilotos | 8 |
| XP do piloto | 200 |
| XP medio da sala | 1400 |

Resultado:

```txt
+151 pontos de campeonato
```

Interpretacao:

- O piloto tinha ranking baixo.
- A sala era muito forte.
- Ele venceu 8 pilotos.
- Resultado excelente, entao o ganho e enorme.

### Simulacao 3: Formula 1 vence sala fraca

Dados:

| Campo | Valor |
| --- | ---: |
| Posicao | 1 |
| Pilotos | 8 |
| XP do piloto | 2600 |
| XP medio da sala | 500 |

Resultado:

```txt
+44 pontos de campeonato
```

Interpretacao:

- Vencer ainda vale pontos.
- Mas o sistema reduz o ganho porque o piloto ja e muito forte para aquela sala.

### Simulacao 4: Piloto medio faz P4 em sala equilibrada

Dados:

| Campo | Valor |
| --- | ---: |
| Posicao | 4 |
| Pilotos | 8 |
| XP do piloto | 900 |
| XP medio da sala | 900 |

Resultado:

```txt
+48 pontos de campeonato
```

Interpretacao:

- Sala equilibrada.
- Resultado no meio do grid.
- Pontuacao positiva, mas sem bonus de podium.

### Simulacao 5: Formula 1 chega ultimo em sala mais fraca

Dados:

| Campo | Valor |
| --- | ---: |
| Posicao | 8 |
| Pilotos | 8 |
| XP do piloto | 2600 |
| XP medio da sala | 900 |

Resultado:

```txt
+1 ponto de campeonato
```

Interpretacao:

- O piloto forte performou mal numa sala mais fraca.
- O sistema praticamente nao recompensa.
- Na v1, pontos de campeonato nao ficam negativos.

## Simulacoes de Progressao de Pilotos

### Piloto A: iniciante constante

Estado inicial:

```txt
ranking_xp = 0
championship_points = 0
placement_races_remaining = 5
ranking exibido = Rookie
```

Sequencia:

| Evento | Resultado | Total |
| --- | ---: | ---: |
| Qualy 1: volta 8% acima do recorde | +5 XP | 5 XP |
| Corrida 1: P5 de 6 em sala media | +38 pts | 38 pts |
| Qualy 2: volta 5% acima do recorde | +5 XP | 10 XP |
| Corrida 2: P4 de 6 | +60 pts | 98 pts |
| Qualy 3: volta 3% acima do recorde | +18 XP | 28 XP |
| Corrida 3: P3 de 6 | +83 pts | 181 pts |
| Qualy 4: volta 2% acima do recorde | +25 XP | 53 XP |
| Corrida 4: P4 de 6 | +60 pts | 241 pts |
| Qualy 5: volta 1% acima do recorde | +60 XP | 113 XP |
| Corrida 5: P2 de 6 | +106 pts | 347 pts |

Depois da quinta corrida:

```txt
placement_races_remaining = 0
ranking_xp = 113
ranking = Kart
championship_points = 347
```

### Piloto B: novato muito rapido

Estado inicial:

```txt
ranking_xp = 0
ranking exibido = Rookie
```

Sequencia de qualys:

| Qualy | Performance | XP | Total |
| --- | --- | ---: | ---: |
| 1 | 1% acima do recorde | +60 | 60 |
| 2 | 0.5% acima do recorde | +75 | 135 |
| 3 | bate recorde | +100 | 235 |
| 4 | 1.5% acima do recorde | +43 | 278 |
| 5 | bate recorde | +100 | 378 |

Depois de 5 corridas:

```txt
ranking_xp = 378
ranking = Formula 4
```

Se ele continuar batendo recordes:

| Evento | XP ganho | Total |
| --- | ---: | ---: |
| Recorde 6 | +75 | 453 |
| Recorde 7 | +75 | 528 |
| Recorde 8 | +75 | 603 |
| Recorde 9 | +75 | 678 |
| Recorde 10 | +75 | 753 |
| Recorde 11 | +75 | 828 |
| Recorde 12 | +75 | 903 |

Resultado:

```txt
ranking = Formula 3
```

### Piloto C: Formula 2 ficando lento

Estado:

```txt
ranking_xp = 1700
ranking = Formula 2
```

Pista com recorde `60.000s`.

| Qualy | Melhor volta | XP | Total |
| --- | ---: | ---: | ---: |
| 1 | 67.000 | -80 | 1620 |
| 2 | 70.000 | -80 | 1540 |
| 3 | 70.000 | -10 | 1530 |

Resultado:

```txt
ranking_xp = 1530
ranking = Formula 3
```

Interpretacao:

- Formula 2 exige ficar perto do recorde.
- Voltas muito lentas podem derrubar XP.
- Ao cair abaixo de 1600, o piloto deixa de ser Formula 2.

### Piloto D: Formula 1 mantendo nivel

Estado:

```txt
ranking_xp = 2700
ranking = Formula 1
```

| Qualy | Performance | XP | Total |
| --- | --- | ---: | ---: |
| 1 | 1% acima do recorde | 0 | 2700 |
| 2 | 1.8% acima do recorde | -24 | 2676 |
| 3 | 2.5% acima do recorde | -47 | 2629 |
| 4 | 5% acima do recorde | -80 | 2549 |
| 5 | 11.7% acima do recorde | -80 | 2469 |

Interpretacao:

- Formula 1 so ganha XP se ficar ate 0.5% acima do recorde.
- Com 1.0% acima do recorde, Formula 1 fica neutro.
- A partir de 2.0% acima do recorde, Formula 1 comeca a perder bastante XP.

## Onde o Codigo Esta

| Area | Arquivo |
| --- | --- |
| Regras de ranking | `Botoh/src/features/public/publicCompetitionRules.ts` |
| Formula de XP e pontos | `Botoh/src/features/public/publicCompetition.ts` |
| Banco e eventos | `Botoh/src/features/public/publicCompetitionRepository.ts` |
| Login e mensagem de perfil | `Botoh/src/features/public/publicAuth.ts` |
| Textos traduzidos | `Botoh/src/features/public/publicMessages.ts` |
| Inicio da qualy | `Botoh/src/features/changeGameState/changeGameModes.ts` |
| Fim de qualy/corrida publica | `Botoh/src/features/changeGameState/publicGameFlow/publicGameFLow.ts` |
| Fallback no stop manual/natural | `Botoh/src/features/roomFeatures/gameStop.ts` |
| Migrations backend | `apps/backend/src/config/migrations.ts` |
| Schema SQL | `database/schema.sql` |

## Observacoes para Calibragem

Pontos que provavelmente vamos ajustar depois de alguns testes reais:

- Valores minimos de XP para cada ranking.
- Limites de velocidade por ranking.
- Peso da sala forte/fraca nos pontos de campeonato.
- Se pontos de campeonato devem poder ser negativos no futuro.
- Se as 5 corridas de placement devem considerar tambem XP de qualy ou apenas corridas.
- Se pilotos desconectados antes do fim devem receber pontos parciais.

Hoje a v1 favorece:

- entrada de novatos sem punir demais;
- grande recompensa para surpresa contra sala forte;
- exigencia alta para manter Formula 1;
- historico completo para construir telas futuras.
