import { query, queryOne, insert, transaction } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import config from '../config/environment';
import notificationService from './notificationService';
import {
  translateDriverContractWebhookWarningNotification,
  translateDriverProposalNotification,
  translateDriverReleaseNotification,
} from '../i18n';
import {
  GARAGE_FACILITY_ECONOMY,
  GarageFacility,
  getFacilityCostPerRace,
  getFacilitySellValue,
  getFacilityUpgradeCost,
} from '../config/facilityEconomy';
import {
  calculateDriverMarketScore,
  getMinimumSalaryFromMarketScore,
} from '../config/driverMarket';

export interface UserGarage {
  id: string;
  username: string;
  money: number;
  team_id?: string;
  team_name?: string;
  upgrades: UserUpgrade[];
}

export interface UserUpgrade {
  id: string;
  upgrade_id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  speed_bonus: number;
  handling_bonus: number;
  reliability_bonus: number;
  is_equipped: boolean;
  quantity: number;
  purchased_at: string;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  level_required: number;
  speed_bonus: number;
  handling_bonus: number;
  reliability_bonus: number;
  icon_url?: string;
  color_code?: string;
  is_active: boolean;
  is_premium: boolean;
}

export interface Team {
  id: string;
  name: string;
  budget: number;
  total_wins: number;
  total_races: number;
  championship_points: number;
}

export interface TeamGarage {
  id: string;
  name: string;
  fullName: string;
  tag: string;
  color: string;
  category: 'formula_1' | 'formula_2';
  isJuniorTeam: boolean;
  parentTeamId: string | null;
  parentTeamName: string | null;
  parentStarterCount: number | null;
  cashTotal: number;
  climateCostPerRace: number;
  pitCrewCostPerRace: number;
  salaryCostPerRace: number;
  sponsorIncomePerRace: number;
  climateMonitoringLevel: number;
  pitCrewLevel: number;
  carName: string;
  momentoComercial: number;
  prestigio: number;
  agressividade: number;
  popularidade: number;
  tecnica: number;
  nacionalidades: string[] | null;
  setores: string[] | null;
  drivers: Array<{
    id: string;
    userId: string | null;
    displayName: string;
    driverNumber: number | null;
    contractEndsAfterRaces: number;
    salaryPerRace: number;
    minimumSalary: number;
    slotNumber: number;
    category: 'starter' | 'reserve';
  }>;
  sponsors: Array<{
    id: string;
    sponsorId: string;
    name: string;
    logoUrl: string | null;
    category: string;
    slotNumber: number;
    contractRacesRemaining: number;
    initialReward: number;
    rewardPerRace: number;
    nacionalidade: string | null;
    tipo: string | null;
    setor: string | null;
    felicidade: number;
    prestigio: number;
    agressividade: number;
    focoEmMidia: number;
    focoTecnico: number;
    nacionalismo: number;
    fidelidade: number;
    orcamento: number;
    ambicao: number;
    publicoAlvo1: string | null;
    publicoAlvo2: string | null;
    scuderiasRelacionadas: string[] | null;
    seasonMissions: Array<{ id: string; title: string; description: string | null; reward: number; racesToComplete: number }>;
    raceMissions: Array<{ id: string; title: string; description: string | null; reward: number }>;
  }>;
  financialHistory: Array<{
    id: string;
    amount: number;
    entryType: 'income' | 'expense';
    reason: string;
    source: string;
    occurredAt: string;
  }>;
  facilityEconomy: typeof GARAGE_FACILITY_ECONOMY;
}

class GarageService {
  private readonly driverLimits = {
    starter: 2,
    reserve: 2,
  } as const;

  async userCanAccessTeam(userId: string, teamId: string): Promise<boolean> {
    const membership = await queryOne(
      `SELECT 1
       FROM teams target_team
       LEFT JOIN user_team_memberships direct_membership
         ON direct_membership.team_id = target_team.id
        AND direct_membership.user_id = $1
       LEFT JOIN user_team_memberships parent_membership
         ON parent_membership.team_id = target_team.parent_team_id
        AND parent_membership.user_id = $1
       WHERE target_team.id = $2
         AND (
           direct_membership.is_team_principal = true
           OR direct_membership.is_team_assistant = true
           OR direct_membership.is_engineer = true
           OR (
             target_team.is_junior_team = true
             AND (
               parent_membership.is_team_principal = true
               OR parent_membership.is_team_assistant = true
               OR parent_membership.is_engineer = true
             )
           )
         )`,
      [userId, teamId],
    );

    return Boolean(membership);
  }

  async userCanManageTeam(userId: string, teamId: string): Promise<boolean> {
    const membership = await queryOne(
      `SELECT 1
       FROM teams target_team
       LEFT JOIN user_team_memberships direct_membership
         ON direct_membership.team_id = target_team.id
        AND direct_membership.user_id = $1
       LEFT JOIN user_team_memberships parent_membership
         ON parent_membership.team_id = target_team.parent_team_id
        AND parent_membership.user_id = $1
       WHERE target_team.id = $2
         AND (
           direct_membership.is_team_principal = true
           OR direct_membership.is_team_assistant = true
           OR (
             target_team.is_junior_team = true
             AND (
               parent_membership.is_team_principal = true
               OR parent_membership.is_team_assistant = true
             )
           )
         )`,
      [userId, teamId],
    );

    return Boolean(membership);
  }

  async getTeamGarage(teamId: string): Promise<TeamGarage | null> {
    const team = await queryOne(
      `SELECT
        teams.id,
        teams.name,
        COALESCE(teams.full_name, teams.name) AS "fullName",
        teams.tag,
        teams.color,
        teams.category,
        teams.is_junior_team AS "isJuniorTeam",
        teams.parent_team_id AS "parentTeamId",
        COALESCE(parent_team.full_name, parent_team.name) AS "parentTeamName",
        CASE
          WHEN teams.parent_team_id IS NULL THEN NULL
          ELSE (
            SELECT COUNT(*)::int
            FROM team_drivers parent_starter
            WHERE parent_starter.team_id = teams.parent_team_id
              AND parent_starter.status = 'active'
              AND parent_starter.category = 'starter'
          )
        END AS "parentStarterCount",
        teams.cash_total AS "cashTotal",
        CASE WHEN COALESCE(teams.category, 'formula_1') = 'formula_2' THEN 0 ELSE teams.climate_cost_per_race END AS "climateCostPerRace",
        CASE WHEN COALESCE(teams.category, 'formula_1') = 'formula_2' THEN 0 ELSE teams.pit_crew_cost_per_race END AS "pitCrewCostPerRace",
        teams.salary_cost_per_race AS "salaryCostPerRace",
        COALESCE(
          (
            SELECT SUM(ts.reward_per_race)
            FROM team_sponsors ts
            WHERE ts.team_id = teams.id
          ),
          0
        ) AS "sponsorIncomePerRace",
        teams.climate_monitoring_level AS "climateMonitoringLevel",
        teams.pit_crew_level AS "pitCrewLevel",
        teams.car_name AS "carName",
        teams.momento_comercial AS "momentoComercial",
        teams.prestigio,
        teams.agressividade,
        teams.popularidade,
        teams.tecnica,
        teams.nacionalidades,
        teams.setores
       FROM teams
       LEFT JOIN teams parent_team ON parent_team.id = teams.parent_team_id
       WHERE teams.id = $1`,
      [teamId],
    );

    if (!team) return null;

    const [drivers, sponsors, financialHistory] = await Promise.all([
      query(
        `SELECT
          team_drivers.id,
          team_drivers.user_id AS "userId",
          team_drivers.display_name AS "displayName",
          team_drivers.driver_number AS "driverNumber",
          team_drivers.contract_ends_after_races AS "contractEndsAfterRaces",
          team_drivers.salary_per_race AS "salaryPerRace",
          team_drivers.slot_number AS "slotNumber",
          team_drivers.category,
          users.driver_velocidade AS velocidade,
          users.driver_consistencia AS consistencia,
          users.driver_tecnica AS tecnica,
          users.driver_experiencia AS experiencia,
          users.driver_chuva AS chuva,
          users.driver_estrategia AS estrategia,
          users.driver_potencial AS potencial,
          users.driver_popularidade AS popularidade,
          personal_sponsor.id AS "sponsorId"
         FROM team_drivers
         LEFT JOIN users ON users.id = team_drivers.user_id
         LEFT JOIN sponsors personal_sponsor ON personal_sponsor.pilot_user_id = users.id
         WHERE team_drivers.team_id = $1
           AND team_drivers.status = 'active'
         ORDER BY CASE WHEN team_drivers.category = 'starter' THEN 0 ELSE 1 END, team_drivers.slot_number ASC`,
        [teamId],
      ),
      query(
        `SELECT
          ts.id,
          ts.sponsor_id AS "sponsorId",
          s.name,
          s.logo_url AS "logoUrl",
          ts.category,
          ts.slot_number AS "slotNumber",
          ts.contract_races_remaining AS "contractRacesRemaining",
          ts.initial_reward AS "initialReward",
          ts.reward_per_race AS "rewardPerRace",
          s.nacionalidade,
          s.tipo,
          s.setor,
          s.felicidade,
          s.prestigio,
          s.agressividade,
          s.foco_em_midia AS "focoEmMidia",
          s.foco_tecnico AS "focoTecnico",
          s.nacionalismo,
          s.fidelidade,
          s.orcamento,
          s.ambicao,
          s.publico_alvo_1 AS "publicoAlvo1",
          s.publico_alvo_2 AS "publicoAlvo2",
          s.scuderias_relacionadas AS "scuderiasRelacionadas",
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', sm.id,
                  'title', sm.title,
                  'description', sm.description,
                  'reward', sm.reward,
                  'racesToComplete', sm.races_to_complete
                )
                ORDER BY sm.created_at ASC
              )
              FROM team_sponsor_season_missions sm
              WHERE sm.team_sponsor_id = ts.id
            ),
            '[]'::json
          ) AS "seasonMissions",
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', rm.id,
                  'title', rm.title,
                  'description', rm.description,
                  'reward', rm.reward
                )
                ORDER BY rm.created_at ASC
              )
              FROM team_sponsor_race_missions rm
              WHERE rm.team_sponsor_id = ts.id
            ),
            '[]'::json
          ) AS "raceMissions"
         FROM team_sponsors ts
         JOIN sponsors s ON s.id = ts.sponsor_id
         WHERE ts.team_id = $1
         ORDER BY ts.category ASC, ts.slot_number ASC`,
        [teamId],
      ),
      query(
        `SELECT
          id,
          amount,
          entry_type AS "entryType",
          reason,
          source,
          occurred_at AS "occurredAt"
         FROM team_financial_history
         WHERE team_id = $1
         ORDER BY occurred_at DESC, created_at DESC`,
        [teamId],
      ),
    ]);

    return {
      ...team,
      drivers: drivers.rows.map((driver: any) => {
        if (!driver.userId) return { ...driver, minimumSalary: 0 };

        const marketScore = calculateDriverMarketScore({
          velocidade: Number(driver.velocidade ?? 0),
          consistencia: Number(driver.consistencia ?? 0),
          tecnica: Number(driver.tecnica ?? 0),
          experiencia: Number(driver.experiencia ?? 0),
          chuva: Number(driver.chuva ?? 0),
          estrategia: Number(driver.estrategia ?? 0),
          potencial: Number(driver.potencial ?? 0),
          popularidade: Number(driver.popularidade ?? 0),
          hasPersonalSponsor: Boolean(driver.sponsorId),
        });

        return {
          ...driver,
          minimumSalary: getMinimumSalaryFromMarketScore(marketScore),
        };
      }),
      sponsors: sponsors.rows,
      financialHistory: financialHistory.rows,
      facilityEconomy: GARAGE_FACILITY_ECONOMY,
    };
  }

  async updateFacility(
    teamId: string,
    facility: GarageFacility,
    action: 'upgrade' | 'sell',
  ) {
    const levelColumn = facility === 'climate' ? 'climate_monitoring_level' : 'pit_crew_level';
    const costColumn = facility === 'climate' ? 'climate_cost_per_race' : 'pit_crew_cost_per_race';
    const label = facility === 'climate' ? 'Climate monitoring' : 'Pit crew';
    const team = await queryOne(
      `SELECT teams.id,
              teams.cash_total,
              teams.is_junior_team,
              teams.${levelColumn} AS level
       FROM teams
       LEFT JOIN teams parent_team ON parent_team.id = teams.parent_team_id
       WHERE teams.id = $1`,
      [teamId],
    );

    if (!team) return { success: false, message: 'Scuderia not found' };
    if (team.is_junior_team) return { success: false, message: 'Junior teams cannot manage facilities' };

    const currentLevel = Number(team.level);
    if (action === 'upgrade') {
      if (currentLevel >= GARAGE_FACILITY_ECONOMY.maxLevel) {
        return { success: false, message: 'Facility already at max level' };
      }

      const upgradeCost = getFacilityUpgradeCost(facility, currentLevel);
      if (Number(team.cash_total) < upgradeCost) {
        return { success: false, message: 'Insufficient funds' };
      }

      const nextLevel = currentLevel + 1;
      const nextCost = getFacilityCostPerRace(facility, nextLevel);
      await query(
        `UPDATE teams
         SET cash_total = cash_total - $1,
             ${levelColumn} = $2,
             ${costColumn} = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [upgradeCost, nextLevel, nextCost, teamId],
      );
      await query(
        `INSERT INTO team_financial_history (team_id, amount, entry_type, reason, source)
         VALUES ($1, $2, 'expense', $3, 'facility')`,
        [teamId, upgradeCost, `${label} upgrade`],
      );
      return { success: true };
    }

    if (currentLevel <= 0) {
      return { success: false, message: 'Facility already at minimum level' };
    }

    const nextLevel = currentLevel - 1;
    const sellValue = getFacilitySellValue(facility, currentLevel);
    const nextCost = getFacilityCostPerRace(facility, nextLevel);
    await query(
      `UPDATE teams
       SET cash_total = cash_total + $1,
           ${levelColumn} = $2,
           ${costColumn} = $3,
           updated_at = NOW()
       WHERE id = $4`,
      [sellValue, nextLevel, nextCost, teamId],
    );
    await query(
      `INSERT INTO team_financial_history (team_id, amount, entry_type, reason, source)
       VALUES ($1, $2, 'income', $3, 'facility')`,
      [teamId, sellValue, `${label} sale`],
    );
    return { success: true };
  }

  async createDriverProposal(
    teamId: string,
    proposedByUserId: string,
    input: {
      username: string;
      contractRaces: number;
      salaryPerRace: number;
      category: 'starter' | 'reserve';
    },
  ) {
    const team = await queryOne<{ id: string; name: string; category: 'formula_1' | 'formula_2' | null }>(
      "SELECT id, name, COALESCE(category, 'formula_1') AS category FROM teams WHERE id = $1",
      [teamId],
    );
    if (!team) return { success: false, message: 'Scuderia not found' };
    const user = await queryOne<{
      id: string;
      username: string;
      driver_number: number | null;
      language: 'pt' | 'en' | 'es';
      driver_wallet_created: boolean;
      velocidade: number | null;
      consistencia: number | null;
      tecnica: number | null;
      experiencia: number | null;
      chuva: number | null;
      estrategia: number | null;
      potencial: number | null;
      popularidade: number | null;
      sponsor_id: string | null;
    }>(
      `SELECT users.id, username, driver_number, language
        , COALESCE(driver_wallet_created, false) AS driver_wallet_created
        , driver_velocidade AS velocidade
        , driver_consistencia AS consistencia
        , driver_tecnica AS tecnica
        , driver_experiencia AS experiencia
        , driver_chuva AS chuva
        , driver_estrategia AS estrategia
        , driver_potencial AS potencial
        , driver_popularidade AS popularidade
        , personal_sponsor.id AS sponsor_id
       FROM users
       LEFT JOIN sponsors personal_sponsor ON personal_sponsor.pilot_user_id = users.id
       WHERE LOWER(username) = LOWER($1)
         AND COALESCE(is_active, true) = true
       LIMIT 1`,
      [input.username],
    );
    if (!user) return { success: false, message: 'Driver user not found' };
    if (!user.driver_wallet_created) return { success: false, message: 'Driver wallet not found' };

    const marketScore = calculateDriverMarketScore({
      velocidade: Number(user.velocidade ?? 0),
      consistencia: Number(user.consistencia ?? 0),
      tecnica: Number(user.tecnica ?? 0),
      experiencia: Number(user.experiencia ?? 0),
      chuva: Number(user.chuva ?? 0),
      estrategia: Number(user.estrategia ?? 0),
      potencial: Number(user.potencial ?? 0),
      popularidade: Number(user.popularidade ?? 0),
      hasPersonalSponsor: Boolean(user.sponsor_id),
    });
    const minimumSalary = getMinimumSalaryFromMarketScore(marketScore);
    const minimumSalaryForCategory = input.category === 'reserve'
      ? Math.round(minimumSalary * 0.25)
      : minimumSalary;
    const salaryPerRace = team.category === 'formula_2' ? 0 : input.salaryPerRace;
    if (team.category !== 'formula_2' && salaryPerRace < minimumSalaryForCategory) {
      return { success: false, message: 'Driver salary is below minimum' };
    }

    const validation = await this.validateDriverContractAvailability(teamId, user.id, input.category);
    if (!validation.success) return validation;

    const pending = await queryOne(
      `SELECT id
       FROM driver_contract_proposals
       WHERE team_id = $1
         AND user_id = $2
         AND status = 'pending'`,
      [teamId, user.id],
    );
    if (pending) return { success: false, message: 'Driver already has a pending proposal from this scuderia' };

    const proposal = await queryOne<{ id: string }>(
      `INSERT INTO driver_contract_proposals (
        team_id,
        user_id,
        proposed_by_user_id,
        category,
        contract_races,
        salary_per_race
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [
        teamId,
        user.id,
        proposedByUserId,
        input.category,
        input.contractRaces,
        salaryPerRace,
      ],
    );
    if (!proposal) return { success: false, message: 'Failed to send driver proposal' };

    const notificationText = translateDriverProposalNotification(
      user.language,
      team.name,
      input.category,
      input.contractRaces,
      salaryPerRace,
    );
    const notification = await notificationService.create({
      userId: user.id,
      senderUserId: proposedByUserId,
      title: notificationText.title,
      message: notificationText.message,
      type: 'info',
      metadata: {
        action: 'driver_contract_proposal',
        proposalId: proposal.id,
        teamId,
        teamName: team.name,
        category: input.category,
        contractRaces: input.contractRaces,
        salaryPerRace,
      },
    });

    await query(
      'UPDATE driver_contract_proposals SET notification_id = $1 WHERE id = $2',
      [notification.id, proposal.id],
    );

    return { success: true, proposalId: proposal.id };
  }

  async createJuniorPromotionProposal(
    juniorTeamId: string,
    driverId: string,
    proposedByUserId: string,
    input: {
      contractRaces: number;
      salaryPerRace: number;
    },
  ) {
    const juniorTeam = await queryOne<{
      id: string;
      name: string;
      category: 'formula_1' | 'formula_2' | null;
      is_junior_team: boolean;
      parent_team_id: string | null;
      parent_team_name: string | null;
    }>(
      `SELECT
        junior.id,
        junior.name,
        COALESCE(junior.category, 'formula_1') AS category,
        junior.is_junior_team,
        junior.parent_team_id,
        parent.name AS parent_team_name
       FROM teams junior
       LEFT JOIN teams parent ON parent.id = junior.parent_team_id
       WHERE junior.id = $1`,
      [juniorTeamId],
    );
    if (!juniorTeam) return { success: false, message: 'Scuderia not found' };
    if (juniorTeam.category !== 'formula_2' || !juniorTeam.is_junior_team || !juniorTeam.parent_team_id) {
      return { success: false, message: 'Promotion is only available from a Formula 2 junior team' };
    }

    const parentStarterCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM team_drivers
       WHERE team_id = $1
         AND status = 'active'
         AND category = 'starter'`,
      [juniorTeam.parent_team_id],
    );
    if (Number(parentStarterCount?.count ?? 0) >= 2) {
      return { success: false, message: 'Parent scuderia has no starter vacancy' };
    }

    const driver = await queryOne<{
      userId: string | null;
      username: string;
      driverNumber: number | null;
      language: 'pt' | 'en' | 'es';
      velocidade: number | null;
      consistencia: number | null;
      tecnica: number | null;
      experiencia: number | null;
      chuva: number | null;
      estrategia: number | null;
      potencial: number | null;
      popularidade: number | null;
      sponsorId: string | null;
    }>(
      `SELECT
        team_drivers.user_id AS "userId",
        users.username,
        users.driver_number AS "driverNumber",
        users.language,
        users.driver_velocidade AS velocidade,
        users.driver_consistencia AS consistencia,
        users.driver_tecnica AS tecnica,
        users.driver_experiencia AS experiencia,
        users.driver_chuva AS chuva,
        users.driver_estrategia AS estrategia,
        users.driver_potencial AS potencial,
        users.driver_popularidade AS popularidade,
        personal_sponsor.id AS "sponsorId"
       FROM team_drivers
       JOIN users ON users.id = team_drivers.user_id
       LEFT JOIN sponsors personal_sponsor ON personal_sponsor.pilot_user_id = users.id
       WHERE team_drivers.id = $1
         AND team_drivers.team_id = $2
         AND team_drivers.status = 'active'`,
      [driverId, juniorTeamId],
    );
    if (!driver?.userId) return { success: false, message: 'Driver contract not found' };

    const activeParentContract = await queryOne<{ category: 'starter' | 'reserve' }>(
      `SELECT category
       FROM team_drivers
       WHERE team_id = $1
         AND user_id = $2
         AND status = 'active'
       LIMIT 1`,
      [juniorTeam.parent_team_id, driver.userId],
    );
    if (activeParentContract?.category === 'starter') {
      return { success: false, message: 'Driver already belongs to this scuderia' };
    }

    const starterContract = await queryOne(
      `SELECT id
       FROM team_drivers
       WHERE user_id = $1
         AND category = 'starter'
         AND status = 'active'`,
      [driver.userId],
    );
    if (starterContract) return { success: false, message: 'Driver already has a starter contract' };

    const marketScore = calculateDriverMarketScore({
      velocidade: Number(driver.velocidade ?? 0),
      consistencia: Number(driver.consistencia ?? 0),
      tecnica: Number(driver.tecnica ?? 0),
      experiencia: Number(driver.experiencia ?? 0),
      chuva: Number(driver.chuva ?? 0),
      estrategia: Number(driver.estrategia ?? 0),
      potencial: Number(driver.potencial ?? 0),
      popularidade: Number(driver.popularidade ?? 0),
      hasPersonalSponsor: Boolean(driver.sponsorId),
    });
    const minimumSalary = Math.round(getMinimumSalaryFromMarketScore(marketScore) * 0.5);
    if (input.salaryPerRace < minimumSalary) {
      return { success: false, message: 'Driver salary is below minimum' };
    }

    const pending = await queryOne(
      `SELECT id
       FROM driver_contract_proposals
       WHERE team_id = $1
         AND user_id = $2
         AND status = 'pending'`,
      [juniorTeam.parent_team_id, driver.userId],
    );
    if (pending) return { success: false, message: 'Driver already has a pending proposal from this scuderia' };

    const proposal = await queryOne<{ id: string }>(
      `INSERT INTO driver_contract_proposals (
        team_id,
        user_id,
        proposed_by_user_id,
        category,
        contract_races,
        salary_per_race
      ) VALUES ($1, $2, $3, 'starter', $4, $5)
      RETURNING id`,
      [
        juniorTeam.parent_team_id,
        driver.userId,
        proposedByUserId,
        input.contractRaces,
        input.salaryPerRace,
      ],
    );
    if (!proposal) return { success: false, message: 'Failed to send driver proposal' };

    const notificationText = translateDriverProposalNotification(
      driver.language,
      juniorTeam.parent_team_name ?? 'Formula 1',
      'starter',
      input.contractRaces,
      input.salaryPerRace,
    );
    const notification = await notificationService.create({
      userId: driver.userId,
      senderUserId: proposedByUserId,
      title: notificationText.title,
      message: notificationText.message,
      type: 'info',
      metadata: {
        action: 'driver_contract_proposal',
        proposalId: proposal.id,
        teamId: juniorTeam.parent_team_id,
        teamName: juniorTeam.parent_team_name,
        category: 'starter',
        contractRaces: input.contractRaces,
        salaryPerRace: input.salaryPerRace,
        source: 'junior_promotion',
        juniorTeamId,
      },
    });

    await query(
      'UPDATE driver_contract_proposals SET notification_id = $1 WHERE id = $2',
      [notification.id, proposal.id],
    );

    return { success: true, proposalId: proposal.id };
  }

  async respondToDriverProposal(
    userId: string,
    proposalId: string,
    decision: 'accept' | 'decline',
  ) {
    const result = await transaction(async (client) => {
      const proposalResult = await client.query(
        `SELECT
          p.id,
          p.team_id,
          p.user_id,
          p.proposed_by_user_id,
          p.category,
          p.contract_races,
          p.salary_per_race,
          p.status,
          p.notification_id,
          t.name AS team_name,
          u.username,
          u.driver_number,
          proposed_by.username AS proposed_by_username,
          u.language
         FROM driver_contract_proposals p
         JOIN teams t ON t.id = p.team_id
         JOIN users u ON u.id = p.user_id
         JOIN users proposed_by ON proposed_by.id = p.proposed_by_user_id
         WHERE p.id = $1
           AND p.user_id = $2
         FOR UPDATE`,
        [proposalId, userId],
      );
      const proposal = proposalResult.rows[0];
      if (!proposal) return { success: false, message: 'Driver proposal not found' };
      if (proposal.status !== 'pending') return { success: false, message: 'Driver proposal already answered' };

      if (decision === 'decline') {
        await client.query(
          `UPDATE driver_contract_proposals
           SET status = 'declined', responded_at = NOW()
           WHERE id = $1`,
          [proposalId],
        );
        await this.markProposalNotificationAnswered(client, proposal.notification_id, 'declined');
        return { success: true };
      }

      const activeForTeam = await client.query(
        `SELECT id, category
         FROM team_drivers
         WHERE team_id = $1
           AND user_id = $2
           AND status = 'active'`,
        [proposal.team_id, userId],
      );
      const activeTeamContract = activeForTeam.rows[0];
      const canPromoteReserveToStarter = activeTeamContract
        && proposal.category === 'starter'
        && activeTeamContract.category === 'reserve';
      if (activeTeamContract && !canPromoteReserveToStarter) {
        return { success: false, message: 'Driver already belongs to this scuderia' };
      }

      const categoryCount = await client.query(
        `SELECT COUNT(*)::int AS count
         FROM team_drivers
         WHERE team_id = $1
           AND category = $2
           AND status = 'active'`,
        [proposal.team_id, proposal.category],
      );
      if (Number(categoryCount.rows[0]?.count ?? 0) >= this.driverLimits[proposal.category as 'starter' | 'reserve']) {
        return { success: false, message: 'Driver category is full' };
      }

      if (proposal.category === 'starter') {
        const starterContract = await client.query(
          `SELECT id
           FROM team_drivers
           WHERE user_id = $1
             AND category = 'starter'
             AND status = 'active'`,
          [userId],
        );
        if (starterContract.rows[0]) {
          return { success: false, message: 'Driver already has a starter contract' };
        }
      }

      const slotNumber = await this.findAvailableDriverSlot(client, proposal.team_id, proposal.category);
      if (canPromoteReserveToStarter) {
        await client.query(
          `UPDATE team_drivers
           SET display_name = $1,
               driver_number = $2,
               contract_ends_after_races = $3,
               salary_per_race = $4,
               slot_number = $5,
               category = 'starter',
               accepted_at = NOW(),
               updated_at = NOW()
           WHERE id = $6`,
          [
            proposal.username,
            proposal.driver_number,
            proposal.contract_races,
            proposal.salary_per_race,
            slotNumber,
            activeTeamContract.id,
          ],
        );
      } else {
        await client.query(
          `INSERT INTO team_drivers (
            team_id,
            user_id,
            display_name,
            driver_number,
            contract_ends_after_races,
            salary_per_race,
            slot_number,
            category,
            status,
            accepted_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW())`,
          [
            proposal.team_id,
            userId,
            proposal.username,
            proposal.driver_number,
            proposal.contract_races,
            proposal.salary_per_race,
            slotNumber,
            proposal.category,
          ],
        );
      }

      await this.upsertDriverMembership(client, userId, proposal.team_id, proposal.category);
      await this.recalculateTeamSalaryCost(client, proposal.team_id);
      await this.syncTeamNationalities(client, proposal.team_id);
      const { default: adminService } = await import('./adminService');
      await adminService.syncPersonalSponsorsForPilot(userId, client);
      await client.query(
        `UPDATE driver_contract_proposals
         SET status = 'accepted', responded_at = NOW()
         WHERE id = $1`,
        [proposalId],
      );
      await this.markProposalNotificationAnswered(client, proposal.notification_id, 'accepted');

      return {
        success: true,
        acceptedContract: {
          teamName: proposal.team_name as string,
          pilotName: proposal.username as string,
          pilotUserId: userId,
          pilotLanguage: proposal.language as 'pt' | 'en' | 'es',
          proposedByName: proposal.proposed_by_username as string,
          contractRaces: Number(proposal.contract_races),
          salaryPerRace: Number(proposal.salary_per_race),
          category: proposal.category as 'starter' | 'reserve',
        },
      };
    });

    if (result.success && result.acceptedContract) {
      const webhookSent = await this.sendDriverContractWebhook(result.acceptedContract).then(
        () => true,
      ).catch((error) => {
        console.error('Failed to send driver contract webhook:', error);
        return false;
      });

      if (!webhookSent) {
        const warning = translateDriverContractWebhookWarningNotification(
          result.acceptedContract.pilotLanguage,
        );
        await notificationService.create({
          userId: result.acceptedContract.pilotUserId,
          title: warning.title,
          message: warning.message,
          type: 'info',
          metadata: {
            action: 'driver_contract_webhook_failed',
            teamName: result.acceptedContract.teamName,
          },
        });
      }
    }

    return result;
  }

  async releaseDriver(teamId: string, driverId: string, releasedByUserId: string) {
    const result = await transaction(async (client) => {
      const driverResult = await client.query(
        `SELECT
          td.id,
          td.team_id,
          td.user_id,
          td.display_name,
          td.contract_ends_after_races,
          td.salary_per_race,
          t.name AS team_name,
          u.language
         FROM team_drivers td
         JOIN teams t ON t.id = td.team_id
         LEFT JOIN users u ON u.id = td.user_id
         WHERE td.id = $1
           AND td.team_id = $2
           AND td.status = 'active'
         FOR UPDATE OF td, t`,
        [driverId, teamId],
      );
      const driver = driverResult.rows[0];
      if (!driver) return { success: false, message: 'Driver contract not found' };

      const releasedByResult = await client.query(
        `SELECT username
         FROM users
         WHERE id = $1`,
        [releasedByUserId],
      );
      const releasedByName = releasedByResult.rows[0]?.username ?? 'Unknown';
      const penalty = Number(driver.salary_per_race) * Number(driver.contract_ends_after_races) * 2;
      await client.query(
        `UPDATE team_drivers
         SET status = 'released'
         WHERE id = $1`,
        [driverId],
      );
      await client.query(
        `UPDATE teams
         SET cash_total = cash_total - $1,
             updated_at = NOW()
         WHERE id = $2`,
        [penalty, teamId],
      );
      await client.query(
        `INSERT INTO team_financial_history (team_id, amount, entry_type, reason, source)
         VALUES ($1, $2, 'expense', $3, 'driver')`,
        [teamId, penalty, `Driver release ${driver.display_name}`],
      );

      if (driver.user_id) {
        await this.removeDriverMembershipIfNeeded(client, driver.user_id, teamId);
      }
      await this.recalculateTeamSalaryCost(client, teamId);
      await this.syncTeamNationalities(client, teamId);
      const { default: adminService } = await import('./adminService');
      await adminService.syncPersonalSponsorsForPilot(driver.user_id as string | null, client);

      return {
        success: true,
        releasedUserId: driver.user_id as string | null,
        teamName: driver.team_name as string,
        driverName: driver.display_name as string,
        releasedByName,
        language: (driver.language as 'pt' | 'en' | 'es' | null) ?? 'pt',
        penalty,
      };
    });

    if (result.success && result.releasedUserId) {
      const notificationText = translateDriverReleaseNotification(
        result.language,
        result.teamName,
        result.penalty,
      );
      await notificationService.create({
        userId: result.releasedUserId,
        title: notificationText.title,
        message: notificationText.message,
        type: 'warning',
        metadata: {
          action: 'driver_contract_released',
          teamId,
          teamName: result.teamName,
          penalty: result.penalty,
        },
      });
    }

    if (result.success) {
      await this.sendDriverReleaseWebhook({
        teamName: result.teamName,
        pilotName: result.driverName,
        releasedByName: result.releasedByName,
        penalty: result.penalty,
      }).catch((error) => {
        console.error('Failed to send driver release webhook:', error);
      });
    }

    return result;
  }

  async releaseSponsor(teamId: string, teamSponsorId: string) {
    return transaction(async (client) => {
      const sponsorResult = await client.query(
        `SELECT
          ts.id,
          ts.team_id,
          ts.initial_reward,
          s.name AS sponsor_name,
          t.name AS team_name
         FROM team_sponsors ts
         JOIN sponsors s ON s.id = ts.sponsor_id
         JOIN teams t ON t.id = ts.team_id
         WHERE ts.id = $1
           AND ts.team_id = $2
         FOR UPDATE OF ts, t`,
        [teamSponsorId, teamId],
      );
      const sponsor = sponsorResult.rows[0];
      if (!sponsor) return { success: false, message: 'Team sponsor not found' };

      const penalty = Number(sponsor.initial_reward) * GARAGE_FACILITY_ECONOMY.sponsorTerminationPenaltyMultiplier;

      await client.query('DELETE FROM team_sponsors WHERE id = $1', [teamSponsorId]);
      await client.query(
        `UPDATE teams
         SET cash_total = cash_total - $1,
             sponsor_income_per_race = COALESCE(
               (
                 SELECT SUM(reward_per_race)
                 FROM team_sponsors
                 WHERE team_id = $2
               ),
               0
             ),
             updated_at = NOW()
         WHERE id = $2`,
        [penalty, teamId],
      );
      await client.query(
        `INSERT INTO team_financial_history (team_id, amount, entry_type, reason, source)
         VALUES ($1, $2, 'expense', $3, 'sponsor')`,
        [teamId, penalty, sponsor.sponsor_name],
      );

      return { success: true, penalty };
    });
  }

  private async sendDriverContractWebhook(contract: {
    teamName: string;
    pilotName: string;
    pilotUserId: string;
    pilotLanguage: 'pt' | 'en' | 'es';
    proposedByName: string;
    contractRaces: number;
    salaryPerRace: number;
    category: 'starter' | 'reserve';
  }) {
    const webhookUrl = config.discordDriverContractWebhookUrl;
    if (!webhookUrl) return;

    const categoryLabel = contract.category === 'starter' ? 'Titular' : 'Reserva';
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'FTOH Contract Office',
        embeds: [
          {
            title: 'Contrato assinado',
            description: 'Um novo contrato de piloto foi oficializado.',
            color: 0xff232b,
            fields: [
              { name: 'Scuderia', value: contract.teamName, inline: true },
              { name: 'Piloto', value: contract.pilotName, inline: true },
              { name: 'Enviado por', value: contract.proposedByName, inline: true },
              { name: 'Duração', value: `${contract.contractRaces} corridas`, inline: true },
              { name: 'Salário por corrida', value: this.formatMoney(contract.salaryPerRace), inline: true },
              { name: 'Categoria', value: categoryLabel, inline: true },
            ],
            footer: { text: 'FTOH • contrato aceito pelo piloto' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed with status ${response.status}`);
    }
  }

  private async sendDriverReleaseWebhook(release: {
    teamName: string;
    pilotName: string;
    releasedByName: string;
    penalty: number;
  }) {
    const webhookUrl = config.discordDriverContractWebhookUrl;
    if (!webhookUrl) return;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'FTOH Contract Office',
        embeds: [
          {
            title: 'Contrato rescindido',
            description: 'Um contrato de piloto foi encerrado pela scuderia.',
            color: 0xf59e0b,
            fields: [
              { name: 'Scuderia', value: release.teamName, inline: true },
              { name: 'Piloto', value: release.pilotName, inline: true },
              { name: 'Rescindido por', value: release.releasedByName, inline: true },
              { name: 'Custo da rescisão', value: this.formatMoney(release.penalty), inline: true },
            ],
            footer: { text: 'FTOH • contrato rescindido' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed with status ${response.status}`);
    }
  }

  private formatMoney(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private async markProposalNotificationAnswered(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    notificationId: string | null,
    status: 'accepted' | 'declined',
  ) {
    if (!notificationId) return;

    await client.query(
      `UPDATE notifications
       SET is_read = true,
           read_at = COALESCE(read_at, NOW()),
           metadata = metadata || jsonb_build_object(
             'proposalStatus', $1::text,
             'action', 'driver_contract_proposal_answered'
           )
       WHERE id = $2`,
      [status, notificationId],
    );
  }

  private async validateDriverContractAvailability(
    teamId: string,
    userId: string,
    category: 'starter' | 'reserve',
  ) {
    const activeForTeam = await queryOne(
      `SELECT id
       FROM team_drivers
       WHERE team_id = $1
         AND user_id = $2
         AND status = 'active'`,
      [teamId, userId],
    );
    if (activeForTeam) return { success: false, message: 'Driver already belongs to this scuderia' };

    const categoryCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM team_drivers
       WHERE team_id = $1
         AND category = $2
         AND status = 'active'`,
      [teamId, category],
    );
    if (Number(categoryCount?.count ?? 0) >= this.driverLimits[category]) {
      return { success: false, message: 'Driver category is full' };
    }

    if (category === 'starter') {
      const starterContract = await queryOne(
        `SELECT id
         FROM team_drivers
         WHERE user_id = $1
           AND category = 'starter'
           AND status = 'active'`,
        [userId],
      );
      if (starterContract) return { success: false, message: 'Driver already has a starter contract' };
    }

    return { success: true };
  }

  private async findAvailableDriverSlot(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
    category: 'starter' | 'reserve',
  ) {
    const baseSlot = category === 'starter' ? 1 : 3;
    const occupied = await client.query(
      `SELECT slot_number
       FROM team_drivers
       WHERE team_id = $1
         AND category = $2
         AND status = 'active'`,
      [teamId, category],
    );
    const used = new Set(occupied.rows.map((row: any) => Number(row.slot_number)));
    const slot = [baseSlot, baseSlot + 1].find((candidate) => !used.has(candidate));
    if (!slot) throw new Error('Driver category is full');
    return slot;
  }

  private async upsertDriverMembership(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    userId: string,
    teamId: string,
    category: 'starter' | 'reserve',
  ) {
    await client.query(
      `INSERT INTO user_team_memberships (
        user_id,
        team_id,
        role,
        is_team_principal,
        is_team_assistant,
        is_engineer,
        is_driver,
        driver_category
      ) VALUES ($1, $2, 'driver', false, false, false, true, $3)
      ON CONFLICT (user_id, team_id)
      DO UPDATE SET
        is_driver = true,
        driver_category = EXCLUDED.driver_category,
        role = CASE
          WHEN user_team_memberships.is_team_principal THEN user_team_memberships.role
          WHEN user_team_memberships.is_team_assistant THEN user_team_memberships.role
          WHEN user_team_memberships.is_engineer THEN user_team_memberships.role
          ELSE 'driver'
        END`,
      [userId, teamId, category],
    );
  }

  private async removeDriverMembershipIfNeeded(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    userId: string,
    teamId: string,
  ) {
    const remaining = await client.query(
      `SELECT id
       FROM team_drivers
       WHERE user_id = $1
         AND team_id = $2
         AND status = 'active'`,
      [userId, teamId],
    );
    if (remaining.rows[0]) return;

    const membership = await client.query(
      `SELECT is_team_principal, is_team_assistant, is_engineer
       FROM user_team_memberships
       WHERE user_id = $1
         AND team_id = $2`,
      [userId, teamId],
    );
    const row = membership.rows[0];
    if (!row) return;

    if (!row.is_team_principal && !row.is_team_assistant && !row.is_engineer) {
      await client.query(
        'DELETE FROM user_team_memberships WHERE user_id = $1 AND team_id = $2',
        [userId, teamId],
      );
      return;
    }

    await client.query(
      `UPDATE user_team_memberships
       SET is_driver = false,
           driver_category = null,
           role = CASE
             WHEN is_team_principal THEN 'team_principal'
             WHEN is_team_assistant THEN 'team_assistant'
             ELSE 'engineer'
           END
       WHERE user_id = $1
         AND team_id = $2`,
      [userId, teamId],
    );
  }

  private async recalculateTeamSalaryCost(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
  ) {
    await client.query(
      `UPDATE teams
       SET salary_cost_per_race = COALESCE(
         (
          SELECT SUM(
            CASE
              WHEN team_drivers.category = 'reserve'
                AND teams.category = 'formula_1'
                AND team_drivers.user_id IS NOT NULL
                AND EXISTS (
                  SELECT 1
                  FROM team_drivers junior_driver
                  JOIN teams junior_team ON junior_team.id = junior_driver.team_id
                  WHERE junior_driver.user_id = team_drivers.user_id
                    AND junior_driver.status = 'active'
                    AND junior_team.category = 'formula_2'
                    AND junior_team.is_junior_team = true
                    AND junior_team.parent_team_id = teams.id
                )
              THEN 0
              ELSE team_drivers.salary_per_race
            END
          )
          FROM team_drivers
          JOIN teams ON teams.id = team_drivers.team_id
          WHERE team_drivers.team_id = $1
            AND team_drivers.status = 'active'
         ),
         0
       ),
       updated_at = NOW()
       WHERE id = $1`,
      [teamId],
    );
  }

  private async syncTeamNationalities(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
  ) {
    await client.query(
      `UPDATE teams
       SET nacionalidades = (
         SELECT ARRAY_AGG(nationality ORDER BY normalized)
         FROM (
           SELECT DISTINCT ON (normalized)
             nationality,
             normalized
           FROM (
             SELECT
               TRIM(value) AS nationality,
               LOWER(TRIM(value)) AS normalized
             FROM UNNEST(COALESCE(teams.manual_nacionalidades, ARRAY[]::text[])) AS value
             WHERE TRIM(value) <> ''
             UNION ALL
             SELECT
               TRIM(users.driver_nacionalidade) AS nationality,
               LOWER(TRIM(users.driver_nacionalidade)) AS normalized
             FROM team_drivers
             JOIN users ON users.id = team_drivers.user_id
             WHERE team_drivers.team_id = teams.id
               AND team_drivers.status = 'active'
               AND users.driver_wallet_created = true
               AND TRIM(COALESCE(users.driver_nacionalidade, '')) <> ''
           ) nationalities
           ORDER BY normalized, nationality
         ) unique_nationalities
       ),
       updated_at = NOW()
       WHERE id = $1`,
      [teamId],
    );

    const parent = await client.query(
      'SELECT parent_team_id FROM teams WHERE id = $1',
      [teamId],
    );
    if (parent.rows[0]?.parent_team_id) {
      await this.recalculateTeamSalaryCost(client, parent.rows[0].parent_team_id);
    }
  }

  async recordStandardRaceFinancialEntries(teamId: string, raceId?: string): Promise<void> {
    const team = await queryOne(
      `SELECT
        climate_cost_per_race,
        pit_crew_cost_per_race,
        salary_cost_per_race,
        sponsor_income_per_race
       FROM teams
       WHERE id = $1`,
      [teamId],
    );

    if (!team) return;

    const entries = [
      {
        amount: Number(team.climate_cost_per_race),
        entryType: 'expense',
        reason: 'Standard climate monitoring cost',
        source: 'standard_race',
      },
      {
        amount: Number(team.pit_crew_cost_per_race),
        entryType: 'expense',
        reason: 'Standard pit crew cost',
        source: 'standard_race',
      },
      {
        amount: Number(team.salary_cost_per_race),
        entryType: 'expense',
        reason: 'Standard salary cost',
        source: 'standard_race',
      },
      {
        amount: Number(team.sponsor_income_per_race),
        entryType: 'income',
        reason: 'Standard sponsor income',
        source: 'standard_race',
      },
    ].filter((entry) => entry.amount > 0);

    if (entries.length === 0) return;

    await query('BEGIN');
    try {
      for (const entry of entries) {
        await query(
          `INSERT INTO team_financial_history (
            team_id,
            amount,
            entry_type,
            reason,
            source,
            race_id
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [teamId, entry.amount, entry.entryType, entry.reason, entry.source, raceId ?? null],
        );
      }

      const delta = entries.reduce(
        (sum, entry) => sum + (entry.entryType === 'income' ? entry.amount : -entry.amount),
        0,
      );

      await query(
        `UPDATE teams
         SET cash_total = cash_total + $1,
             updated_at = NOW()
         WHERE id = $2`,
        [delta, teamId],
      );

      await query('COMMIT');
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }
  // Get user's garage with team and upgrades
  async getUserGarage(userId: string): Promise<UserGarage | null> {
    try {
      const userResult = await queryOne(
        `SELECT 
          u.id, u.username, u.money, u.team_id,
          t.name as team_name
        FROM users u
        LEFT JOIN teams t ON u.team_id = t.id
        WHERE u.id = $1 AND u.is_active = true`,
        [userId]
      );

      if (!userResult) {
        return null;
      }

      // Get user's upgrades
      const upgradesResult = await query(
        `SELECT 
          uu.id, uu.upgrade_id, uu.is_equipped, uu.quantity, uu.purchased_at,
          up.name, up.description, up.category, up.price,
          up.speed_bonus, up.handling_bonus, up.reliability_bonus,
          up.icon_url, up.color_code
        FROM user_upgrades uu
        JOIN upgrades up ON uu.upgrade_id = up.id
        WHERE uu.user_id = $1
        ORDER BY up.category, up.price`,
        [userId]
      );

      const userGarage: UserGarage = {
        id: userResult.id,
        username: userResult.username,
        money: userResult.money,
        team_id: userResult.team_id,
        team_name: userResult.team_name,
        upgrades: upgradesResult.rows
      };

      return userGarage;
    } catch (error) {
      console.error('Error getting user garage:', error);
      throw error;
    }
  }

  // Get available upgrades for user
  async getAvailableUpgrades(userId: string): Promise<Upgrade[]> {
    try {
      const userResult = await queryOne(
        'SELECT level, money FROM users WHERE id = $1 AND is_active = true',
        [userId]
      );

      if (!userResult) {
        return [];
      }

      const result = await query(
        `SELECT 
          id, name, description, category, price, level_required,
          speed_bonus, handling_bonus, reliability_bonus,
          icon_url, color_code, is_active, is_premium
        FROM upgrades 
        WHERE is_active = true 
        AND level_required <= $1
        ORDER BY category, price`,
        [userResult.level]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting available upgrades:', error);
      throw error;
    }
  }

  // Purchase upgrade for user
  async purchaseUpgrade(userId: string, upgradeId: string): Promise<{
    success: boolean;
    message: string;
    userGarage?: UserGarage;
  }> {
    try {
      // Get user and upgrade info
      const [userResult, upgradeResult] = await Promise.all([
        queryOne('SELECT money, level FROM users WHERE id = $1 AND is_active = true', [userId]),
        queryOne('SELECT * FROM upgrades WHERE id = $1 AND is_active = true', [upgradeId])
      ]);

      if (!userResult || !upgradeResult) {
        return {
          success: false,
          message: 'User or upgrade not found'
        };
      }

      // Check if user meets level requirement
      if (userResult.level < upgradeResult.level_required) {
        return { 
          success: false, 
          message: `Level ${upgradeResult.level_required} required to purchase this upgrade` 
        };
      }

      // Check if user has enough money
      if (userResult.money < upgradeResult.price) {
        return { success: false, message: 'Insufficient funds' };
      }

      // Check if user already has this upgrade
      const existingUpgrade = await queryOne(
        'SELECT id FROM user_upgrades WHERE user_id = $1 AND upgrade_id = $2',
        [userId, upgradeId]
      );

      if (existingUpgrade) {
        return { success: false, message: 'Upgrade already purchased' };
      }

      // Start transaction
      await query('BEGIN');

      try {
        // Deduct money from user
        await query(
          'UPDATE users SET money = money - $1 WHERE id = $2',
          [upgradeResult.price, userId]
        );

        // Add upgrade to user's collection
        await insert('user_upgrades', {
          user_id: userId,
          upgrade_id: upgradeId,
          purchase_price: upgradeResult.price,
          is_equipped: false,
          quantity: 1
        });

        await query('COMMIT');

        // Get updated garage
        const updatedGarage = await this.getUserGarage(userId);

        return {
          success: true,
          message: 'Upgrade purchased successfully',
          userGarage: updatedGarage
        };
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error purchasing upgrade:', error);
      return { success: false, message: 'Failed to purchase upgrade' };
    }
  }

  // Equip upgrade for user
  async equipUpgrade(userId: string, userUpgradeId: string): Promise<{
    success: boolean;
    message: string;
    userGarage?: UserGarage;
  }> {
    try {
      // Check if user owns this upgrade
      const userUpgrade = await queryOne(
        `SELECT uu.*, up.name FROM user_upgrades uu
         JOIN upgrades up ON uu.upgrade_id = up.id
         WHERE uu.id = $1 AND uu.user_id = $2`,
        [userUpgradeId, userId]
      );

      if (!userUpgrade) {
        return { success: false, message: 'Upgrade not found in your collection' };
      }

      // Unequip all upgrades in the same category
      await query(
        `UPDATE user_upgrades 
         SET is_equipped = false 
         WHERE user_id = $1 
         AND upgrade_id IN (
           SELECT upgrade_id FROM user_upgrades uu2
           JOIN upgrades up2 ON uu2.upgrade_id = up2.id
           WHERE uu2.user_id = $1 AND up2.category = $2
         )`,
        [userId, userUpgrade.category]
      );

      // Equip the selected upgrade
      await query(
        'UPDATE user_upgrades SET is_equipped = true WHERE id = $1',
        [userUpgradeId]
      );

      const updatedGarage = await this.getUserGarage(userId);

      return {
        success: true,
        message: `${userUpgrade.name} equipped successfully`,
        userGarage: updatedGarage
      };
    } catch (error) {
      console.error('Error equipping upgrade:', error);
      return { success: false, message: 'Failed to equip upgrade' };
    }
  }

  // Remove upgrade from user
  async removeUpgrade(userId: string, userUpgradeId: string): Promise<{
    success: boolean;
    message: string;
    userGarage?: UserGarage;
  }> {
    try {
      // Get user upgrade info
      const userUpgrade = await queryOne(
        `SELECT uu.*, up.name, up.price FROM user_upgrades uu
         JOIN upgrades up ON uu.upgrade_id = up.id
         WHERE uu.id = $1 AND uu.user_id = $2`,
        [userUpgradeId, userId]
      );

      if (!userUpgrade) {
        return { success: false, message: 'Upgrade not found in your collection' };
      }

      // Refund money (50% of original price)
      const refundAmount = Math.floor(userUpgrade.price * 0.5);

      // Start transaction
      await query('BEGIN');

      try {
        // Refund money to user
        await query(
          'UPDATE users SET money = money + $1 WHERE id = $2',
          [refundAmount, userId]
        );

        // Remove upgrade from user's collection
        await query(
          'DELETE FROM user_upgrades WHERE id = $1',
          [userUpgradeId]
        );

        await query('COMMIT');

        const updatedGarage = await this.getUserGarage(userId);

        return {
          success: true,
          message: `${userUpgrade.name} removed. Refunded: $${refundAmount}`,
          userGarage: updatedGarage
        };
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error removing upgrade:', error);
      return { success: false, message: 'Failed to remove upgrade' };
    }
  }

  // Get user's stats
  async getUserStats(userId: string): Promise<{
    totalUpgrades: number;
    totalSpent: number;
    equippedUpgrades: number;
    categories: Record<string, number>;
  }> {
    try {
      const result = await query(
        `SELECT 
          COUNT(*) as total_upgrades,
          COALESCE(SUM(uu.purchase_price), 0) as total_spent,
          COUNT(CASE WHEN uu.is_equipped = true THEN 1 END) as equipped_upgrades,
          up.category,
          COUNT(*) as category_count
        FROM user_upgrades uu
        JOIN upgrades up ON uu.upgrade_id = up.id
        WHERE uu.user_id = $1
        GROUP BY up.category`,
        [userId]
      );

      const categories: Record<string, number> = {};
      result.rows.forEach(row => {
        categories[row.category] = parseInt(row.category_count);
      });

      return {
        totalUpgrades: parseInt(result.rows[0]?.total_upgrades || 0),
        totalSpent: parseInt(result.rows[0]?.total_spent || 0),
        equippedUpgrades: parseInt(result.rows[0]?.equipped_upgrades || 0),
        categories
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}

export default new GarageService();
