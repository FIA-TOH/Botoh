import { LocalizedMessageFunction } from "../chat/messages";

export const PUBLIC_MESSAGES = {
  WELCOME_LOGIN_REQUIRED: (): LocalizedMessageFunction => ({
    pt: "🔐 Faça login para poder correr e participar do campeonato. Não tem conta? Use !cadastro SENHA para se cadastrar.",
    en: "🔐 Log in to race and join the championship. No account yet? Use !cadastro PASSWORD to register.",
    es: "🔐 Inicia sesión para correr y participar en el campeonato. ¿No tienes cuenta? Usa !cadastro CONTRASEÑA para registrarte.",
    fr: "🔐 Connectez-vous pour courir et participer au championnat. Pas de compte ? Utilisez !cadastro MOT_DE_PASSE pour vous inscrire.",
    tr: "🔐 Yarışmak ve şampiyonaya katılmak için giriş yap. Hesabın yok mu? Kayıt olmak için !cadastro ŞİFRE kullan.",
  }),
  AUTH_WARNING: (seconds: number): LocalizedMessageFunction => ({
    pt: `⏳ Você será expulso em ${seconds}s se não fizer login ou cadastro.`,
    en: `⏳ You will be kicked in ${seconds}s if you do not log in or register.`,
    es: `⏳ Serás expulsado en ${seconds}s si no inicias sesión o te registras.`,
    fr: `⏳ Vous serez expulsé dans ${seconds}s si vous ne vous connectez pas ou ne vous inscrivez pas.`,
    tr: `⏳ Giriş yapmaz veya kayıt olmazsan ${seconds}s içinde atılacaksın.`,
  }),
  AUTH_TIMEOUT_KICK: (): LocalizedMessageFunction => ({
    pt: "⏰ Tempo esgotado: faça login ou cadastro para participar.",
    en: "⏰ Time expired: log in or register to participate.",
    es: "⏰ Tiempo agotado: inicia sesión o regístrate para participar.",
    fr: "⏰ Temps écoulé : connectez-vous ou inscrivez-vous pour participer.",
    tr: "⏰ Süre doldu: katılmak için giriş yap veya kayıt ol.",
  }),
  PASSWORD_REQUIRED_REGISTER: (): LocalizedMessageFunction => ({
    pt: "📝 Use !cadastro SENHA para criar sua conta pública.",
    en: "📝 Use !cadastro PASSWORD to create your public account.",
    es: "📝 Usa !cadastro CONTRASEÑA para crear tu cuenta pública.",
    fr: "📝 Utilisez !cadastro MOT_DE_PASSE pour créer votre compte public.",
    tr: "📝 Herkese açık hesabını oluşturmak için !cadastro ŞİFRE kullan.",
  }),
  PASSWORD_REQUIRED_LOGIN: (): LocalizedMessageFunction => ({
    pt: "🔑 Use !login SENHA para entrar na sua conta pública.",
    en: "🔑 Use !login PASSWORD to access your public account.",
    es: "🔑 Usa !login CONTRASEÑA para entrar en tu cuenta pública.",
    fr: "🔑 Utilisez !login MOT_DE_PASSE pour accéder à votre compte public.",
    tr: "🔑 Herkese açık hesabına girmek için !login ŞİFRE kullan.",
  }),
  ALREADY_REGISTERED: (): LocalizedMessageFunction => ({
    pt: "ℹ️ Você já tem uma conta pública. Use !login SENHA.",
    en: "ℹ️ You already have a public account. Use !login PASSWORD.",
    es: "ℹ️ Ya tienes una cuenta pública. Usa !login CONTRASEÑA.",
    fr: "ℹ️ Vous avez déjà un compte public. Utilisez !login MOT_DE_PASSE.",
    tr: "ℹ️ Zaten herkese açık bir hesabın var. !login ŞİFRE kullan.",
  }),
  REGISTER_SUCCESS: (): LocalizedMessageFunction => ({
    pt: "✅ Conta pública criada. Agora use !login SENHA para logar.",
    en: "✅ Public account created. Now use !login PASSWORD to log in.",
    es: "✅ Cuenta pública creada. Ahora usa !login CONTRASEÑA para iniciar sesión.",
    fr: "✅ Compte public créé. Utilisez maintenant !login MOT_DE_PASSE pour vous connecter.",
    tr: "✅ Herkese açık hesap oluşturuldu. Şimdi giriş yapmak için !login ŞİFRE kullan.",
  }),
  RANKING_PLACEMENT_REMAINING: (races: number): LocalizedMessageFunction => ({
    pt: `🏁 Voce tem ${races} corridas para definir seu ranking.`,
    en: `🏁 You have ${races} races left to define your ranking.`,
    es: `🏁 Te quedan ${races} carreras para definir tu ranking.`,
    fr: `🏁 Il vous reste ${races} courses pour definir votre classement.`,
    tr: `🏁 Siralaman belirlemek icin ${races} yarisin kaldi.`,
  }),
  RANKING_STATUS: (
    rank: string,
    xp: number,
    pointsToNextRank: number,
    nextRank: string,
  ): LocalizedMessageFunction => ({
    pt: `👋 Bem vindo! Seu ranking é ${rank}, com ${xp} pontos, faltam ${pointsToNextRank} pontos para o ranking ${nextRank}.`,
    en: `👋 Welcome! Your ranking is ${rank}, with ${xp} points, ${pointsToNextRank} points left for ${nextRank}.`,
    es: `👋 Bienvenido! Tu ranking es ${rank}, con ${xp} puntos, faltan ${pointsToNextRank} puntos para ${nextRank}.`,
    fr: `👋 Bienvenue! Votre classement est ${rank}, avec ${xp} points, il manque ${pointsToNextRank} points pour ${nextRank}.`,
    tr: `👋 Hos geldin! Siralaman ${rank}, ${xp} puan; ${nextRank} icin ${pointsToNextRank} puan kaldi.`,
  }),
  RANKING_PLACEMENT_PERFORMANCE: (
    performancePercent: number,
    registeredQualys: number,
    racesRemaining: number,
  ): LocalizedMessageFunction => ({
    pt: `MD5: performance registrada a ${performancePercent.toFixed(2)}% do recorde. Qualys registradas: ${registeredQualys}. Corridas restantes para definir ranking: ${racesRemaining}.`,
    en: `MD5: performance saved at ${performancePercent.toFixed(2)}% from the record. Registered qualys: ${registeredQualys}. Races left to define rank: ${racesRemaining}.`,
    es: `MD5: rendimiento guardado a ${performancePercent.toFixed(2)}% del record. Qualys registradas: ${registeredQualys}. Carreras restantes para definir ranking: ${racesRemaining}.`,
    fr: `MD5: performance enregistree a ${performancePercent.toFixed(2)}% du record. Qualifs enregistrees: ${registeredQualys}. Courses restantes pour definir le rang: ${racesRemaining}.`,
    tr: `MD5: performans rekordan ${performancePercent.toFixed(2)}% uzakta kaydedildi. Kayitli siralama turlari: ${registeredQualys}. Siralamayi belirlemek icin kalan yaris: ${racesRemaining}.`,
  }),
  RANKING_PLACEMENT_DEFINED: (
    rank: string,
    xp: number,
  ): LocalizedMessageFunction => ({
    pt: `MD5 concluido! Seu ranking inicial foi definido como ${rank}, com ${xp} XP.`,
    en: `MD5 complete! Your initial rank was set to ${rank}, with ${xp} XP.`,
    es: `MD5 completado! Tu ranking inicial fue definido como ${rank}, con ${xp} XP.`,
    fr: `MD5 termine! Votre rang initial est ${rank}, avec ${xp} XP.`,
    tr: `MD5 tamamlandi! Ilk siralaman ${rank}, ${xp} XP ile belirlendi.`,
  }),
  RANKING_XP_RESULT: (
    xpDelta: number,
    totalXp: number,
    rank: string,
  ): LocalizedMessageFunction => ({
    pt: `📈 XP de ranking: ${xpDelta >= 0 ? "+" : ""}${xpDelta}. Total: ${totalXp}. Ranking: ${rank}.`,
    en: `📈 Ranking XP: ${xpDelta >= 0 ? "+" : ""}${xpDelta}. Total: ${totalXp}. Rank: ${rank}.`,
    es: `📈 XP de ranking: ${xpDelta >= 0 ? "+" : ""}${xpDelta}. Total: ${totalXp}. Ranking: ${rank}.`,
    fr: `📈 XP de classement: ${xpDelta >= 0 ? "+" : ""}${xpDelta}. Total: ${totalXp}. Rang: ${rank}.`,
    tr: `📈 Ranking XP: ${xpDelta >= 0 ? "+" : ""}${xpDelta}. Toplam: ${totalXp}. Siralama: ${rank}.`,
  }),
  RANKING_UP: (
    previousRank: string,
    newRank: string,
  ): LocalizedMessageFunction => ({
    pt: `⬆️ Voce evoluiu de ranking: ${previousRank} -> ${newRank}!`,
    en: `⬆️ You ranked up: ${previousRank} -> ${newRank}!`,
    es: `⬆️ Subiste de ranking: ${previousRank} -> ${newRank}!`,
    fr: `⬆️ Vous montez de rang: ${previousRank} -> ${newRank}!`,
    tr: `⬆️ Siralaman yukseldi: ${previousRank} -> ${newRank}!`,
  }),
  RANKING_DOWN: (
    previousRank: string,
    newRank: string,
  ): LocalizedMessageFunction => ({
    pt: `⬇️ Voce caiu de ranking: ${previousRank} -> ${newRank}. Recupere na proxima qualy.`,
    en: `⬇️ You ranked down: ${previousRank} -> ${newRank}. Recover it in the next quali.`,
    es: `⬇️ Bajaste de ranking: ${previousRank} -> ${newRank}. Recuperalo en la proxima quali.`,
    fr: `⬇️ Vous descendez de rang: ${previousRank} -> ${newRank}. Recuperez-le a la prochaine qualif.`,
    tr: `⬇️ Siralaman dustu: ${previousRank} -> ${newRank}. Sonraki siralamada geri al.`,
  }),
  CHAMPIONSHIP_POINTS_RESULT: (
    pointsDelta: number,
    totalPoints: number,
  ): LocalizedMessageFunction => ({
    pt: `🏆 Pontos do campeonato: +${pointsDelta}. Total: ${totalPoints}.`,
    en: `🏆 Championship points: +${pointsDelta}. Total: ${totalPoints}.`,
    es: `🏆 Puntos del campeonato: +${pointsDelta}. Total: ${totalPoints}.`,
    fr: `🏆 Points de championnat: +${pointsDelta}. Total: ${totalPoints}.`,
    tr: `🏆 Sampiyona puani: +${pointsDelta}. Toplam: ${totalPoints}.`,
  }),
  CHAMPIONSHIP_STANDING_P1: (
    pointsDelta: number,
    totalPoints: number,
    position: number,
  ): LocalizedMessageFunction => ({
    pt: `👑 Campeonato: +${pointsDelta} pontos. Total: ${totalPoints}. Voce esta em P${position} e lidera o campeonato!`,
    en: `👑 Championship: +${pointsDelta} points. Total: ${totalPoints}. You are P${position} and lead the championship!`,
    es: `👑 Campeonato: +${pointsDelta} puntos. Total: ${totalPoints}. Estas P${position} y lideras el campeonato!`,
    fr: `👑 Championnat: +${pointsDelta} points. Total: ${totalPoints}. Vous etes P${position} et menez le championnat!`,
    tr: `👑 Sampiyona: +${pointsDelta} puan. Toplam: ${totalPoints}. P${position}'desin ve sampiyonaya liderlik ediyorsun!`,
  }),
  CHAMPIONSHIP_STANDING_GAP: (
    pointsDelta: number,
    totalPoints: number,
    position: number,
    pointsBehindNext: number,
  ): LocalizedMessageFunction => ({
    pt: `🏆 Campeonato: +${pointsDelta} pontos. Total: ${totalPoints}. Voce esta em P${position}; faltam ${pointsBehindNext} pontos para o piloto a sua frente.`,
    en: `🏆 Championship: +${pointsDelta} points. Total: ${totalPoints}. You are P${position}; ${pointsBehindNext} points to the driver ahead.`,
    es: `🏆 Campeonato: +${pointsDelta} puntos. Total: ${totalPoints}. Estas P${position}; faltan ${pointsBehindNext} puntos para el piloto de adelante.`,
    fr: `🏆 Championnat: +${pointsDelta} points. Total: ${totalPoints}. Vous etes P${position}; il manque ${pointsBehindNext} points pour le pilote devant.`,
    tr: `🏆 Sampiyona: +${pointsDelta} puan. Toplam: ${totalPoints}. P${position}'desin; ondeki surucuye ${pointsBehindNext} puan var.`,
  }),
  PUBLIC_STATS: (stats: {
    name: string;
    rank: string;
    rankingXp: number;
    nextRank: string;
    pointsToNextRank: number;
    placementRacesRemaining: number;
    championshipPosition: number | null;
    championshipPoints: number;
    pointsBehindNext: number | null;
    qualyCount: number;
    racesCount: number;
  }): LocalizedMessageFunction => ({
    pt:
      `Stats de ${stats.name}\n` +
      `Ranking: ${stats.rank} | XP: ${stats.rankingXp} | Proximo: ${stats.nextRank} (${stats.pointsToNextRank} XP)\n` +
      `Campeonato: ${stats.championshipPosition ? `P${stats.championshipPosition}` : "-"} | Pontos: ${stats.championshipPoints} | Gap: ${stats.pointsBehindNext ?? 0}\n` +
      `Corridas: ${stats.racesCount} | Qualys: ${stats.qualyCount} | Corridas para definir ranking: ${stats.placementRacesRemaining}`,
    en:
      `${stats.name} stats\n` +
      `Rank: ${stats.rank} | XP: ${stats.rankingXp} | Next: ${stats.nextRank} (${stats.pointsToNextRank} XP)\n` +
      `Championship: ${stats.championshipPosition ? `P${stats.championshipPosition}` : "-"} | Points: ${stats.championshipPoints} | Gap: ${stats.pointsBehindNext ?? 0}\n` +
      `Races: ${stats.racesCount} | Qualys: ${stats.qualyCount} | Ranking placement races: ${stats.placementRacesRemaining}`,
    es:
      `Stats de ${stats.name}\n` +
      `Ranking: ${stats.rank} | XP: ${stats.rankingXp} | Siguiente: ${stats.nextRank} (${stats.pointsToNextRank} XP)\n` +
      `Campeonato: ${stats.championshipPosition ? `P${stats.championshipPosition}` : "-"} | Puntos: ${stats.championshipPoints} | Gap: ${stats.pointsBehindNext ?? 0}\n` +
      `Carreras: ${stats.racesCount} | Qualys: ${stats.qualyCount} | Carreras para definir ranking: ${stats.placementRacesRemaining}`,
    fr:
      `Stats de ${stats.name}\n` +
      `Rang: ${stats.rank} | XP: ${stats.rankingXp} | Prochain: ${stats.nextRank} (${stats.pointsToNextRank} XP)\n` +
      `Championnat: ${stats.championshipPosition ? `P${stats.championshipPosition}` : "-"} | Points: ${stats.championshipPoints} | Ecart: ${stats.pointsBehindNext ?? 0}\n` +
      `Courses: ${stats.racesCount} | Qualifs: ${stats.qualyCount} | Courses pour definir le rang: ${stats.placementRacesRemaining}`,
    tr:
      `${stats.name} istatistikleri\n` +
      `Siralama: ${stats.rank} | XP: ${stats.rankingXp} | Sonraki: ${stats.nextRank} (${stats.pointsToNextRank} XP)\n` +
      `Sampiyona: ${stats.championshipPosition ? `P${stats.championshipPosition}` : "-"} | Puan: ${stats.championshipPoints} | Fark: ${stats.pointsBehindNext ?? 0}\n` +
      `Yaris: ${stats.racesCount} | Siralama turlari: ${stats.qualyCount} | Siralamayi belirleme yarislari: ${stats.placementRacesRemaining}`,
  }),
  NOT_REGISTERED: (): LocalizedMessageFunction => ({
    pt: "❌ Você ainda não tem cadastro público. Use !cadastro SENHA.",
    en: "❌ You do not have a public account yet. Use !cadastro PASSWORD.",
    es: "❌ Todavía no tienes cuenta pública. Usa !cadastro CONTRASEÑA.",
    fr: "❌ Vous n'avez pas encore de compte public. Utilisez !cadastro MOT_DE_PASSE.",
    tr: "❌ Henüz herkese açık hesabın yok. !cadastro ŞİFRE kullan.",
  }),
  INCORRECT_PASSWORD: (): LocalizedMessageFunction => ({
    pt: "❌ Senha incorreta.",
    en: "❌ Incorrect password.",
    es: "❌ Contraseña incorrecta.",
    fr: "❌ Mot de passe incorrect.",
    tr: "❌ Şifre yanlış.",
  }),
  LOGIN_SUCCESS: (): LocalizedMessageFunction => ({
    pt: "✅ Login público feito com sucesso. Você já pode correr! 🏎️",
    en: "✅ Public login successful. You can race now.",
    es: "✅ Inicio de sesión público exitoso. Ya puedes correr.",
    fr: "✅ Connexion publique réussie. Vous pouvez maintenant courir.",
    tr: "✅ Herkese açık giriş başarılı. Artık yarışabilirsin.",
  }),
  DATABASE_UNAVAILABLE: (): LocalizedMessageFunction => ({
    pt: "⚠️ O cadastro público está temporariamente indisponível. Tente novamente em instantes.",
    en: "⚠️ Public registration is temporarily unavailable. Please try again shortly.",
    es: "⚠️ El registro público no está disponible temporalmente. Inténtalo de nuevo en breve.",
    fr: "⚠️ L'inscription publique est temporairement indisponible. Réessayez dans un instant.",
    tr: "⚠️ Herkese açık kayıt geçici olarak kullanılamıyor. Lütfen kısa süre sonra tekrar dene.",
  }),
  SERVERS_OFFLINE: (): LocalizedMessageFunction => ({
    pt: "📡 Os servidores est\u00e3o desligados no momento. A sala p\u00fablica est\u00e1 aberta sem login.",
    en: "📡 The servers are offline right now. The public room is open without login.",
    es: "📡 Los servidores est\u00e1n apagados por ahora. La sala p\u00fablica est\u00e1 abierta sin inicio de sesi\u00f3n.",
    fr: "📡 Les serveurs sont actuellement hors ligne. La salle publique est ouverte sans connexion.",
    tr: "📡 Sunucular \u015fu anda kapal\u0131. Herkese a\u00e7\u0131k oda giri\u015f yapmadan a\u00e7\u0131k.",
  }),
  AUTH_UNAVAILABLE: (): LocalizedMessageFunction => ({
    pt: "⚠️ Não foi possível identificar seu auth do Haxball. Entre novamente na sala e tente de novo.",
    en: "⚠️ Could not identify your Haxball auth. Rejoin the room and try again.",
    es: "⚠️ No se pudo identificar tu auth de Haxball. Vuelve a entrar a la sala e inténtalo de nuevo.",
    fr: "⚠️ Impossible d'identifier votre auth Haxball. Revenez dans la salle et réessayez.",
    tr: "⚠️ Haxball auth kimliğin belirlenemedi. Odaya yeniden girip tekrar dene.",
  }),
  LOGGED_PREFIX: (): LocalizedMessageFunction => ({
    pt: "✅ [Logado]",
    en: "✅ [Logged in]",
    es: "✅ [Conectado]",
    fr: "✅ [Connecté]",
    tr: "✅ [Giriş yapıldı]",
  }),
};
