import { Router, Response } from 'express';
import { query, queryOne } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getRequestLanguage, translateMessage } from '../i18n';
import {
  calculateDriverCommercialScore,
  calculateDriverMarketScore,
  calculateDriverOverall,
  getMinimumSalaryFromMarketScore,
} from '../config/driverMarket';

const router = Router();

router.get('/scuderias', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: translateMessage('User not authenticated', getRequestLanguage(req)),
      });
    }

    const wallet = await queryOne<{ hasWallet: boolean }>(
      `SELECT COALESCE(driver_wallet_created, false) AS "hasWallet"
       FROM users
       WHERE id = $1
         AND COALESCE(is_active, true) = true`,
      [req.user.id],
    );

    const [teamsResult, pilotsResult] = await Promise.all([
      query(
      `SELECT
        teams.id,
        teams.name,
        teams.tag,
        teams.color,
        teams.logo_url AS "logoUrl",
        COUNT(team_drivers.id) FILTER (
          WHERE team_drivers.status = 'active' AND team_drivers.category = 'starter'
        )::int AS "starterCount",
        COUNT(team_drivers.id) FILTER (
          WHERE team_drivers.status = 'active' AND team_drivers.category = 'reserve'
        )::int AS "reserveCount"
       FROM teams
       LEFT JOIN team_drivers ON team_drivers.team_id = teams.id
       GROUP BY teams.id
       ORDER BY teams.name ASC`,
      ),
      query(
        `SELECT
          users.id,
          users.username,
          users.driver_number AS "driverNumber",
          users.driver_velocidade AS velocidade,
          users.driver_consistencia AS consistencia,
          users.driver_tecnica AS tecnica,
          users.driver_experiencia AS experiencia,
          users.driver_chuva AS chuva,
          users.driver_estrategia AS estrategia,
          users.driver_potencial AS potencial,
          users.driver_popularidade AS popularidade,
          personal_sponsor.id AS "sponsorId",
          personal_sponsor.name AS "sponsorName",
          personal_sponsor.logo_url AS "sponsorLogoUrl",
          active_starter.id IS NOT NULL AS "hasStarterContract",
          active_starter.team_color AS "starterTeamColor",
          active_reserve.id IS NOT NULL AS "hasReserveContract"
         FROM users
         LEFT JOIN sponsors personal_sponsor ON personal_sponsor.pilot_user_id = users.id
         LEFT JOIN LATERAL (
           SELECT team_drivers.id, teams.color AS team_color
           FROM team_drivers
           JOIN teams ON teams.id = team_drivers.team_id
           WHERE team_drivers.user_id = users.id
             AND team_drivers.status = 'active'
             AND team_drivers.category = 'starter'
           LIMIT 1
         ) active_starter ON true
         LEFT JOIN LATERAL (
           SELECT id
           FROM team_drivers
           WHERE user_id = users.id
             AND status = 'active'
             AND category = 'reserve'
           LIMIT 1
         ) active_reserve ON true
         WHERE COALESCE(users.is_active, true) = true
           AND users.driver_wallet_created = true
         ORDER BY users.username ASC`,
      ),
    ]);

    const pilots = pilotsResult.rows.map((pilot) => {
      const hasPersonalSponsor = Boolean(pilot.sponsorId);
      const scoreInput = {
        velocidade: Number(pilot.velocidade ?? 0),
        consistencia: Number(pilot.consistencia ?? 0),
        tecnica: Number(pilot.tecnica ?? 0),
        experiencia: Number(pilot.experiencia ?? 0),
        chuva: Number(pilot.chuva ?? 0),
        estrategia: Number(pilot.estrategia ?? 0),
        potencial: Number(pilot.potencial ?? 0),
        popularidade: Number(pilot.popularidade ?? 0),
        hasPersonalSponsor,
      };
      const overall = calculateDriverOverall(scoreInput);
      const commercialScore = calculateDriverCommercialScore(scoreInput);
      const marketScore = calculateDriverMarketScore(scoreInput);

      return {
        id: pilot.id,
        username: pilot.username,
        driverNumber: pilot.driverNumber,
        overall: Number(overall.toFixed(2)),
        commercialScore: Number(commercialScore.toFixed(2)),
        marketScore,
        minimumSalary: getMinimumSalaryFromMarketScore(marketScore),
        attributes: {
          velocidade: scoreInput.velocidade,
          consistencia: scoreInput.consistencia,
          tecnica: scoreInput.tecnica,
          experiencia: scoreInput.experiencia,
          chuva: scoreInput.chuva,
          estrategia: scoreInput.estrategia,
          potencial: scoreInput.potencial,
          popularidade: scoreInput.popularidade,
          patrocinadorScore: hasPersonalSponsor ? 100 : 0,
        },
        hasPersonalSponsor,
        sponsor: hasPersonalSponsor
          ? {
            id: pilot.sponsorId,
            name: pilot.sponsorName,
            logoUrl: pilot.sponsorLogoUrl,
          }
          : null,
        hasStarterContract: Boolean(pilot.hasStarterContract),
        starterTeamColor: pilot.starterTeamColor ?? null,
        hasReserveContract: Boolean(pilot.hasReserveContract),
      };
    });

    return res.json({
      success: true,
      hasDriverWallet: Boolean(wallet?.hasWallet),
      scuderias: teamsResult.rows.map((team) => ({
        ...team,
        starterVacancies: Math.max(0, 2 - Number(team.starterCount ?? 0)),
        reserveVacancies: Math.max(0, 2 - Number(team.reserveCount ?? 0)),
      })),
      pilots,
    });
  } catch (error) {
    console.error('Market scuderias error:', error);
    return res.status(500).json({
      success: false,
      message: translateMessage('Internal server error', getRequestLanguage(req)),
    });
  }
});

export default router;
