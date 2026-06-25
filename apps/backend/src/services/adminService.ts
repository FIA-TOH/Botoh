import authService from './authService';
import { query, queryOne, transaction } from '../config/database';
import garageService from './garageService';
import {
  calculateCompatibility,
  calculateContractValue,
  calculatePersonalSponsorSeasonValue,
  drawMarketProposalCategory,
  drawMarketProposalCount,
  drawMarketSponsorOrigin,
  drawSponsorRequirement,
  MarketSponsorOrigin,
  MarketSponsorProfile,
  MarketTeamProfile,
  normalizeSponsorCategory,
  selectWeightedProposal,
  SponsorContractCategory,
} from '../config/sponsorMarket';
import { getFacilityCostPerRace } from '../config/facilityEconomy';

export type TeamMembershipRole = 'team_principal' | 'team_assistant' | 'driver' | 'engineer';

export interface TeamMembershipInput {
  teamId: string;
  roles: TeamMembershipRole[];
  driverCategory?: 'starter' | 'reserve' | null;
  contractRaces?: number | null;
  salaryPerRace?: number | null;
}

export interface AdminUserInput {
  username: string;
  password?: string;
  shortUsername: string;
  role?: 'admin' | 'user';
  teamMemberships: TeamMembershipInput[];
  driverNumber: number;
  language: 'pt' | 'en' | 'es';
  driverWallet?: DriverWalletInput | null;
}

export interface DriverWalletInput {
  velocidade: number;
  consistencia: number;
  tecnica: number;
  experiencia: number;
  chuva: number;
  estrategia: number;
  potencial: number;
  popularidade: number;
  nacionalidade: string;
}

export interface ScuderiaInput {
  name: string;
  fullName?: string | null;
  tag: string;
  emoji?: string | null;
  color: string;
  logoUrl?: string | null;
  category?: 'formula_1' | 'formula_2';
  isJuniorTeam?: boolean;
  parentTeamId?: string | null;
  momentoComercial?: number;
  prestigio?: number;
  agressividade?: number;
  popularidade?: number;
  tecnica?: number;
  nacionalidades?: string[] | null;
  setores?: string[] | null;
}

export interface TeamFinanceEntryInput {
  amount: number;
  entryType: 'income' | 'expense';
  reason: string;
  occurredAt?: string;
}

export interface CircuitInput {
  simpleName: string;
  fullName: string;
}

export interface TeamCircuitBoxInput {
  circuitId: string;
  x: number;
  y: number;
}

export interface CircuitTeamBoxInput {
  teamId: string;
  x?: number | null;
  y?: number | null;
}

export interface TeamSponsorInput {
  sponsorId: string;
  category: 'title_sponsor' | 'main_partner' | 'official_partner' | 'minor_sponsor' | 'personal_sponsor';
  contractRacesRemaining: number;
  initialReward: number;
  rewardPerRace: number;
}

export interface SponsorMarketReviewInput {
  sponsorId: string;
  category: SponsorContractCategory;
  initialReward: number;
}

export interface CommercialMomentumAdjustmentInput {
  commercialMomentumDelta: number;
  sponsorHappinessChanges: Array<{
    teamSponsorId: string;
    happinessDelta: number;
  }>;
}

export interface SponsorMissionInput {
  title: string;
  description?: string | null;
  reward: number;
  racesToComplete?: number;
}

type RaceMissionDifficulty = 'easy' | 'medium' | 'hard' | 'insane';

const RACE_MISSION_GENERATOR_ID = 'race_mission_generator';
const RACE_MISSION_GENERATION_CHANCES: Partial<Record<SponsorContractCategory, number>> = {
  title_sponsor: 0.75,
  main_partner: 0.5,
};
const RACE_MISSION_BASES: Partial<Record<SponsorContractCategory, number>> = {
  title_sponsor: 60000,
  main_partner: 35000,
};
const RACE_MISSION_BUDGET_MULTIPLIERS = [0.75, 1, 1.25, 1.55];
const RACE_MISSION_AMBITION_MULTIPLIERS = [0.8, 1, 1.25, 1.55, 1.75, 2];
const RACE_MISSION_PRESTIGE_MULTIPLIERS = [0, 0.8, 0.95, 1.1, 1.25, 1.4];
const RACE_MISSION_DIFFICULTY_MULTIPLIERS: Record<RaceMissionDifficulty, number> = {
  easy: 0.75,
  medium: 1,
  hard: 1.35,
  insane: 1.75,
};
const RACE_MISSION_DIFFICULTY_WEIGHTS: Record<number, { difficulty: RaceMissionDifficulty; chance: number }[]> = {
  0: [{ difficulty: 'easy', chance: 0.7 }, { difficulty: 'medium', chance: 0.25 }, { difficulty: 'hard', chance: 0.05 }],
  1: [{ difficulty: 'easy', chance: 0.5 }, { difficulty: 'medium', chance: 0.4 }, { difficulty: 'hard', chance: 0.1 }],
  2: [{ difficulty: 'easy', chance: 0.3 }, { difficulty: 'medium', chance: 0.5 }, { difficulty: 'hard', chance: 0.2 }],
  3: [{ difficulty: 'easy', chance: 0.15 }, { difficulty: 'medium', chance: 0.55 }, { difficulty: 'hard', chance: 0.3 }],
  4: [{ difficulty: 'easy', chance: 0.1 }, { difficulty: 'medium', chance: 0.4 }, { difficulty: 'hard', chance: 0.4 }, { difficulty: 'insane', chance: 0.1 }],
  5: [{ difficulty: 'easy', chance: 0.05 }, { difficulty: 'medium', chance: 0.3 }, { difficulty: 'hard', chance: 0.5 }, { difficulty: 'insane', chance: 0.15 }],
};
const SPONSOR_CATEGORY_LIMITS: Record<SponsorContractCategory, number> = {
  title_sponsor: 1,
  main_partner: 2,
  official_partner: 4,
  minor_sponsor: 8,
  personal_sponsor: 4,
};

export interface SponsorInput {
  name?: string;
  nome?: string;
  logoUrl: string;
  nacionalidade?: string | null;
  tipo?: string | null;
  setor?: string | null;
  felicidade?: number;
  prestigio?: number;
  agressividade?: number;
  focoEmMidia?: number;
  focoTecnico?: number;
  nacionalismo?: number;
  fidelidade?: number;
  orcamento?: number;
  ambicao?: number;
  publicoAlvo1?: string | null;
  publicoAlvo2?: string | null;
  pilotUserId?: string | null;
}

type RaceProgressDirection = 'advance' | 'rollback';

export interface AdminDriverInput {
  username: string;
  category: 'starter' | 'reserve';
  contractRaces: number;
  salaryPerRace: number;
}

class AdminService {
  async listUsers() {
    const result = await query(`
      SELECT
        u.id,
        u.username,
        u.role,
        u.money,
        u.short_username AS "shortUsername",
        BOOL_OR(COALESCE(utm.is_team_principal, false)) AS "teamPrincipal",
        BOOL_OR(COALESCE(utm.is_team_assistant, false)) AS "teamAssistant",
        (COALESCE(u.is_driver, false) OR COALESCE(BOOL_OR(COALESCE(utm.is_driver, false)), false)) AS "driver",
        COALESCE(
          json_agg(
            json_build_object(
              'teamId', t.id,
              'teamName', t.name,
              'teamTag', t.tag,
              'teamColor', t.color,
              'roles', ARRAY_REMOVE(ARRAY[
                CASE WHEN utm.is_team_principal THEN 'team_principal' END,
                CASE WHEN utm.is_team_assistant THEN 'team_assistant' END,
                CASE WHEN utm.is_engineer THEN 'engineer' END,
                CASE WHEN utm.is_driver THEN 'driver' END
              ], NULL),
              'driverCategory', active_driver.category,
              'contractRaces', active_driver.contract_ends_after_races,
              'salaryPerRace', active_driver.salary_per_race
            )
            ORDER BY t.name
          ) FILTER (WHERE utm.team_id IS NOT NULL),
          '[]'::json
        ) AS "teamMemberships",
        u.driver_number AS "driverNumber",
        u.language,
        CASE WHEN u.driver_wallet_created THEN json_build_object(
          'velocidade', u.driver_velocidade,
          'consistencia', u.driver_consistencia,
          'tecnica', u.driver_tecnica,
          'experiencia', u.driver_experiencia,
          'chuva', u.driver_chuva,
          'estrategia', u.driver_estrategia,
          'potencial', u.driver_potencial,
          'popularidade', u.driver_popularidade,
          'nacionalidade', u.driver_nacionalidade,
          'temPatrocinador', personal_sponsor.id IS NOT NULL,
          'sponsor', CASE WHEN personal_sponsor.id IS NULL THEN NULL ELSE json_build_object(
            'id', personal_sponsor.id,
            'name', personal_sponsor.name,
            'logoUrl', personal_sponsor.logo_url
          ) END
        ) ELSE NULL END AS "driverWallet",
        u.created_at AS "createdAt"
      FROM users u
      LEFT JOIN user_team_memberships utm ON utm.user_id = u.id
      LEFT JOIN teams t ON utm.team_id = t.id
      LEFT JOIN sponsors personal_sponsor ON personal_sponsor.pilot_user_id = u.id
      LEFT JOIN LATERAL (
        SELECT category, contract_ends_after_races, salary_per_race
        FROM team_drivers td
        WHERE td.user_id = u.id
          AND td.team_id = utm.team_id
          AND td.status = 'active'
        ORDER BY td.accepted_at DESC NULLS LAST, td.created_at DESC
        LIMIT 1
      ) active_driver ON true
      WHERE COALESCE(u.is_active, true) = true
      GROUP BY u.id
      , personal_sponsor.id
      ORDER BY u.username ASC
    `);

    return result.rows;
  }

  async createUser(input: Required<AdminUserInput>) {
    const existingUser = await this.findUserActivationByUsername(input.username);
    if (existingUser?.isActive) {
      return { success: false, message: 'Username already exists' };
    }

    const passwordHash = await authService.hashPassword(input.password);
    const reactivatedUserId = existingUser?.id;
    const validation = await this.validateDriverMemberships(input.teamMemberships, reactivatedUserId);
    if (!validation.success) return validation;
    const walletValidation = this.validateDriverWallet(input.driverWallet);
    if (!walletValidation.success) return walletValidation;
    const wallet = walletValidation.wallet;
    const role = input.role === 'admin' ? 'admin' : 'user';

    const user = await transaction(async (client) => {
      if (reactivatedUserId) {
        const result = await client.query(
          `UPDATE users
           SET
            username = $1,
            password_hash = $2,
            role = $21,
            money = 50000,
            short_username = $3,
            is_team_principal = $4,
            is_team_assistant = $5,
            is_driver = $6,
            team_id = $7,
            driver_number = $8,
            language = $9,
            driver_wallet_created = $10,
            driver_velocidade = $11,
            driver_consistencia = $12,
            driver_tecnica = $13,
            driver_experiencia = $14,
            driver_chuva = $15,
            driver_estrategia = $16,
            driver_potencial = $17,
            driver_popularidade = $18,
            driver_nacionalidade = $19,
            is_active = true
           WHERE id = $20
           RETURNING id`,
          [
            input.username,
            passwordHash,
            input.shortUsername,
            this.hasAnyRole(input.teamMemberships, 'team_principal'),
            this.hasAnyRole(input.teamMemberships, 'team_assistant'),
            this.hasAnyRole(input.teamMemberships, 'driver') || Boolean(wallet),
            input.teamMemberships[0]?.teamId ?? null,
            input.driverNumber,
            input.language,
            Boolean(wallet),
            wallet?.velocidade ?? null,
            wallet?.consistencia ?? null,
            wallet?.tecnica ?? null,
            wallet?.experiencia ?? null,
            wallet?.chuva ?? null,
            wallet?.estrategia ?? null,
            wallet?.potencial ?? null,
            wallet?.popularidade ?? null,
            wallet?.nacionalidade ?? null,
            reactivatedUserId,
            role,
          ],
        );

        const reactivatedUser = result.rows[0];
        await this.replaceMemberships(client, reactivatedUser.id, input);
        return reactivatedUser;
      }

      const result = await client.query(
        `INSERT INTO users (
          username,
          password_hash,
          role,
          money,
          short_username,
          is_team_principal,
          is_team_assistant,
          is_driver,
          team_id,
          driver_number,
          language,
          driver_wallet_created,
          driver_velocidade,
          driver_consistencia,
          driver_tecnica,
          driver_experiencia,
          driver_chuva,
          driver_estrategia,
          driver_potencial,
          driver_popularidade,
          driver_nacionalidade,
          is_active,
          created_at
        ) VALUES ($1, $2, $20, 50000, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, true, NOW())
        RETURNING id`,
        [
          input.username,
          passwordHash,
          input.shortUsername,
          this.hasAnyRole(input.teamMemberships, 'team_principal'),
          this.hasAnyRole(input.teamMemberships, 'team_assistant'),
          this.hasAnyRole(input.teamMemberships, 'driver') || Boolean(wallet),
          input.teamMemberships[0]?.teamId ?? null,
          input.driverNumber,
          input.language,
          Boolean(wallet),
          wallet?.velocidade ?? null,
          wallet?.consistencia ?? null,
          wallet?.tecnica ?? null,
          wallet?.experiencia ?? null,
          wallet?.chuva ?? null,
          wallet?.estrategia ?? null,
          wallet?.potencial ?? null,
          wallet?.popularidade ?? null,
          wallet?.nacionalidade ?? null,
          role,
        ],
      );

      const createdUser = result.rows[0];
      await this.replaceMemberships(client, createdUser.id, input);
      return createdUser;
    });

    return { success: true, user };
  }

  async updateUser(userId: string, input: AdminUserInput) {
    const usernameOwner = await authService.findUserByUsername(input.username);
    if (usernameOwner && usernameOwner.id !== userId) {
      return { success: false, message: 'Username already exists' };
    }

    const validation = await this.validateDriverMemberships(input.teamMemberships, userId);
    if (!validation.success) return validation;
    const walletValidation = this.validateDriverWallet(input.driverWallet);
    if (!walletValidation.success) return walletValidation;
    const wallet = walletValidation.wallet;

    const values: any[] = [
      input.username,
      input.shortUsername,
      input.role === 'admin' ? 'admin' : 'user',
      this.hasAnyRole(input.teamMemberships, 'team_principal'),
      this.hasAnyRole(input.teamMemberships, 'team_assistant'),
      this.hasAnyRole(input.teamMemberships, 'driver') || Boolean(wallet),
      input.teamMemberships[0]?.teamId ?? null,
      input.driverNumber,
      input.language,
      Boolean(wallet),
      wallet?.velocidade ?? null,
      wallet?.consistencia ?? null,
      wallet?.tecnica ?? null,
      wallet?.experiencia ?? null,
      wallet?.chuva ?? null,
      wallet?.estrategia ?? null,
      wallet?.potencial ?? null,
      wallet?.popularidade ?? null,
      wallet?.nacionalidade ?? null,
      userId,
    ];

    let passwordSql = '';
    if (input.password) {
      values.splice(19, 0, await authService.hashPassword(input.password));
      passwordSql = ', password_hash = $20';
      values[20] = userId;
    }

    const result = await transaction(async (client) => {
      const updated = await client.query(
        `UPDATE users
         SET
          username = $1,
          short_username = $2,
          role = $3,
          is_team_principal = $4,
          is_team_assistant = $5,
          is_driver = $6,
          team_id = $7,
          driver_number = $8,
          language = $9,
          driver_wallet_created = $10,
          driver_velocidade = $11,
          driver_consistencia = $12,
          driver_tecnica = $13,
          driver_experiencia = $14,
          driver_chuva = $15,
          driver_estrategia = $16,
          driver_potencial = $17,
          driver_popularidade = $18,
          driver_nacionalidade = $19
          ${passwordSql}
         WHERE id = $${input.password ? 21 : 20}
         RETURNING id`,
        values,
      );

      if (updated.rows[0]) {
        await this.replaceMemberships(client, userId, input);
        if (!wallet) {
          await client.query(
            `UPDATE sponsors
             SET pilot_user_id = NULL,
                 tipo = 'minor_sponsor',
                 updated_at = NOW()
             WHERE pilot_user_id = $1`,
            [userId],
          );
          await this.syncPersonalSponsorsForPilot(userId, client);
        }
      }

      return updated;
    });

    if (!result.rows[0]) {
      return { success: false, message: 'User not found' };
    }

    return { success: true, user: result.rows[0] };
  }

  async deleteUser(userId: string) {
    const result = await transaction(async (client) => {
      await client.query(
        `UPDATE sponsors
         SET pilot_user_id = NULL,
             tipo = 'minor_sponsor',
             updated_at = NOW()
         WHERE pilot_user_id = $1`,
        [userId],
      );
      await this.syncPersonalSponsorsForPilot(userId, client);
      return client.query(
        'UPDATE users SET is_active = false WHERE id = $1 RETURNING id',
        [userId],
      );
    });

    if (!result.rows[0]) {
      return { success: false, message: 'User not found' };
    }

    return { success: true };
  }

  async unlinkUserPersonalSponsor(userId: string) {
    const result = await transaction(async (client) => {
      const updated = await client.query(
        `UPDATE sponsors
         SET pilot_user_id = NULL,
             tipo = 'minor_sponsor',
             updated_at = NOW()
         WHERE pilot_user_id = $1
         RETURNING id`,
        [userId],
      );
      await this.syncPersonalSponsorsForPilot(userId, client);
      return updated;
    });

    return result.rows[0]
      ? { success: true }
      : { success: false, message: 'Personal sponsor not found' };
  }

  private async replaceMemberships(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    userId: string,
    input: Pick<AdminUserInput, 'teamMemberships' | 'username' | 'driverNumber'>,
  ) {
    const memberships = input.teamMemberships;
    const previousTeams = await client.query(
      `SELECT team_id
       FROM user_team_memberships
       WHERE user_id = $1
         AND is_driver = true`,
      [userId],
    );

    await client.query('DELETE FROM user_team_memberships WHERE user_id = $1', [userId]);

    for (const membership of memberships) {
      const primaryRole = membership.roles[0] ?? 'driver';
      const isDriver = membership.roles.includes('driver');
      const driverCategory = isDriver ? (membership.driverCategory ?? 'reserve') : null;
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
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          membership.teamId,
          primaryRole,
          membership.roles.includes('team_principal'),
          membership.roles.includes('team_assistant'),
          membership.roles.includes('engineer'),
          isDriver,
          driverCategory,
        ],
      );

      if (isDriver) {
        await this.upsertTeamDriver(client, membership.teamId, userId, {
          username: input.username,
          category: driverCategory ?? 'reserve',
          contractRaces: Number(membership.contractRaces ?? 1),
          salaryPerRace: Number(membership.salaryPerRace ?? 0),
        }, input.driverNumber);
      }
    }

    const nextDriverTeamIds = new Set(
      memberships
        .filter((membership) => membership.roles.includes('driver'))
        .map((membership) => membership.teamId),
    );
    for (const row of previousTeams.rows) {
      if (nextDriverTeamIds.has(row.team_id)) continue;
      await this.removeTeamDriverContract(client, row.team_id, userId);
    }

    const affectedTeamIds = new Set<string>([
      ...previousTeams.rows.map((row: any) => row.team_id),
      ...memberships.map((membership) => membership.teamId),
    ]);
    for (const teamId of affectedTeamIds) {
      await this.recalculateTeamSalaryCost(client, teamId);
      await this.syncTeamNationalities(teamId, client);
    }
    await this.syncPersonalSponsorsForPilot(userId, client);
  }

  private hasAnyRole(memberships: TeamMembershipInput[], role: TeamMembershipRole) {
    return memberships.some((membership) => membership.roles.includes(role));
  }

  private validateDriverWallet(input?: DriverWalletInput | null) {
    if (!input) return { success: true, wallet: null as DriverWalletInput | null };

    const wallet: DriverWalletInput = {
      velocidade: Number(input.velocidade),
      consistencia: Number(input.consistencia),
      tecnica: Number(input.tecnica),
      experiencia: Number(input.experiencia),
      chuva: Number(input.chuva),
      estrategia: Number(input.estrategia),
      potencial: Number(input.potencial),
      popularidade: Number(input.popularidade),
      nacionalidade: String(input.nacionalidade ?? '').trim(),
    };
    const sportAttributes = [
      wallet.velocidade,
      wallet.consistencia,
      wallet.tecnica,
      wallet.experiencia,
      wallet.chuva,
      wallet.estrategia,
    ];

    if (sportAttributes.some((value) => !Number.isInteger(value) || value < 0 || value > 5)) {
      return { success: false, message: 'Driver sport attributes must be between 0 and 5' };
    }
    if (!Number.isInteger(wallet.potencial) || wallet.potencial < 0 || wallet.potencial > 100) {
      return { success: false, message: 'Driver potential must be between 0 and 100' };
    }
    if (!Number.isInteger(wallet.popularidade) || wallet.popularidade < 0 || wallet.popularidade > 5) {
      return { success: false, message: 'Driver popularity must be between 0 and 5' };
    }
    if (!wallet.nacionalidade || wallet.nacionalidade.length > 120) {
      return { success: false, message: 'Driver nationality is invalid' };
    }

    return { success: true, wallet };
  }

  private async validateDriverMemberships(memberships: TeamMembershipInput[], userId?: string) {
    const driverMemberships = memberships.filter((membership) => membership.roles.includes('driver'));
    const starterMemberships = driverMemberships.filter((membership) => (membership.driverCategory ?? 'reserve') === 'starter');

    if (starterMemberships.length > 1) {
      return { success: false, message: 'Driver already has a starter contract' };
    }

    for (const membership of driverMemberships) {
      const category = membership.driverCategory ?? 'reserve';
      const validation = await this.validateDriverAssignment(membership.teamId, userId, category);
      if (!validation.success) return validation;
    }

    return { success: true };
  }

  private async validateDriverAssignment(
    teamId: string,
    userId: string | undefined,
    category: 'starter' | 'reserve',
    currentDriverId?: string,
  ) {
    const categoryCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM team_drivers
       WHERE team_id = $1
         AND category = $2
         AND status = 'active'
         AND ($3::uuid IS NULL OR id <> $3::uuid)
         AND ($4::uuid IS NULL OR user_id <> $4::uuid)`,
      [teamId, category, currentDriverId ?? null, userId ?? null],
    );
    if (Number(categoryCount?.count ?? 0) >= 2) {
      return { success: false, message: 'Driver category is full' };
    }

    if (category === 'starter' && userId) {
      const starterContract = await queryOne(
        `SELECT id
         FROM team_drivers
         WHERE user_id = $1
           AND category = 'starter'
           AND status = 'active'
           AND team_id <> $2
           AND ($3::uuid IS NULL OR id <> $3::uuid)`,
        [userId, teamId, currentDriverId ?? null],
      );
      if (starterContract) return { success: false, message: 'Driver already has a starter contract' };
    }

    return { success: true };
  }

  private async findActiveUserByUsername(username: string) {
    return queryOne<{ id: string; username: string; driver_number: number | null }>(
      `SELECT id, username, driver_number
       FROM users
       WHERE LOWER(username) = LOWER($1)
         AND COALESCE(is_active, true) = true
       LIMIT 1`,
      [username],
    );
  }

  private async findUserActivationByUsername(username: string) {
    return queryOne<{ id: string; username: string; isActive: boolean }>(
      `SELECT id, username, COALESCE(is_active, true) AS "isActive"
       FROM users
       WHERE LOWER(username) = LOWER($1)
       ORDER BY CASE WHEN COALESCE(is_active, true) THEN 0 ELSE 1 END, created_at DESC
       LIMIT 1`,
      [username],
    );
  }

  private async findAvailableDriverSlot(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
    category: 'starter' | 'reserve',
    currentDriverId?: string,
  ) {
    const baseSlot = category === 'starter' ? 1 : 3;
    const occupied = await client.query(
      `SELECT slot_number
       FROM team_drivers
       WHERE team_id = $1
         AND category = $2
         AND status = 'active'
         AND ($3::uuid IS NULL OR id <> $3::uuid)`,
      [teamId, category, currentDriverId ?? null],
    );
    const used = new Set(occupied.rows.map((row: any) => Number(row.slot_number)));
    const slot = [baseSlot, baseSlot + 1].find((candidate) => !used.has(candidate));
    if (!slot) throw new Error('Driver category is full');
    return slot;
  }

  private async findAvailableSponsorSlot(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
    category: SponsorContractCategory,
    currentTeamSponsorId?: string,
  ) {
    const occupied = await client.query(
      `SELECT slot_number
       FROM team_sponsors
       WHERE team_id = $1
         AND category = $2
         AND ($3::uuid IS NULL OR id <> $3::uuid)`,
      [teamId, category, currentTeamSponsorId ?? null],
    );
    const used = new Set(occupied.rows.map((row: any) => Number(row.slot_number)));
    return Array.from({ length: SPONSOR_CATEGORY_LIMITS[category] }, (_, index) => index + 1)
      .find((slot) => !used.has(slot)) ?? null;
  }

  private async assignTeamSponsor(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    scuderiaId: string,
    input: TeamSponsorInput,
  ) {
    const sponsor = await client.query(
      'SELECT id, name FROM sponsors WHERE id = $1',
      [input.sponsorId],
    );
    if (!sponsor.rows[0]) {
      return { success: false, message: 'Sponsor not found' };
    }

    const existing = await client.query(
      'SELECT id FROM team_sponsors WHERE team_id = $1 AND sponsor_id = $2',
      [scuderiaId, input.sponsorId],
    );
    if (existing.rows[0]) {
      return { success: false, message: 'Sponsor already assigned to scuderia' };
    }

    const slotNumber = await this.findAvailableSponsorSlot(client, scuderiaId, input.category);
    if (!slotNumber) {
      return { success: false, message: 'Sponsor category is full' };
    }

    const result = await client.query(
      `INSERT INTO team_sponsors (
        team_id, sponsor_id, category, slot_number,
        contract_races_remaining, initial_reward, reward_per_race
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id`,
      [
        scuderiaId,
        input.sponsorId,
        input.category,
        slotNumber,
        input.contractRacesRemaining,
        input.initialReward,
        input.rewardPerRace,
      ],
    );

    await client.query(
      `UPDATE teams
       SET cash_total = cash_total + $1,
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
      [input.initialReward, scuderiaId],
    );
    await client.query(
      `INSERT INTO team_financial_history (team_id, amount, entry_type, reason, source)
       VALUES ($1, $2, 'income', $3, 'sponsor')`,
      [scuderiaId, input.initialReward, sponsor.rows[0].name],
    );

    return { success: true, teamSponsor: result.rows[0] };
  }

  private async upsertTeamDriver(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
    userId: string,
    input: AdminDriverInput,
    driverNumber: number | null,
  ) {
    const existing = await client.query(
      `SELECT id
       FROM team_drivers
       WHERE team_id = $1
         AND user_id = $2
         AND status = 'active'
       LIMIT 1`,
      [teamId, userId],
    );
    const slotNumber = await this.findAvailableDriverSlot(
      client,
      teamId,
      input.category,
      existing.rows[0]?.id,
    );
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW())
      ON CONFLICT (user_id, team_id) WHERE status = 'active' AND user_id IS NOT NULL
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        driver_number = EXCLUDED.driver_number,
        contract_ends_after_races = EXCLUDED.contract_ends_after_races,
        salary_per_race = EXCLUDED.salary_per_race,
        slot_number = EXCLUDED.slot_number,
        category = EXCLUDED.category,
        updated_at = NOW()`,
      [
        teamId,
        userId,
        input.username,
        driverNumber,
        input.contractRaces,
        input.salaryPerRace,
        slotNumber,
        input.category,
      ],
    );
  }

  private async removeTeamDriverContract(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
    userId: string,
  ) {
    await client.query(
      `UPDATE team_drivers
       SET status = 'released',
           updated_at = NOW()
       WHERE team_id = $1
         AND user_id = $2
         AND status = 'active'`,
      [teamId, userId],
    );
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
    teamId: string,
    client: { query: (sql: string, params?: any[]) => Promise<any> } = { query },
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

  async syncPersonalSponsorsForPilot(
    pilotUserId: string | null | undefined,
    client: { query: (sql: string, params?: any[]) => Promise<any> } = { query },
  ) {
    if (!pilotUserId) return;

    const existingAssignments = await client.query(
      `SELECT DISTINCT team_id, sponsor_id
       FROM team_sponsors
       WHERE source = 'personal_sponsor'
         AND pilot_user_id = $1`,
      [pilotUserId],
    );
    const existingAssignmentKeys = new Set(
      existingAssignments.rows.map((row: any) => `${row.team_id}:${row.sponsor_id}`),
    );

    await client.query(
      `DELETE FROM team_sponsors
       WHERE source = 'personal_sponsor'
         AND pilot_user_id = $1`,
      [pilotUserId],
    );

    const sponsors = await client.query(
      `SELECT id, name, orcamento, prestigio
       FROM sponsors
       WHERE pilot_user_id = $1
         AND tipo = 'personal_sponsor'`,
      [pilotUserId],
    );

    if (sponsors.rows.length === 0) {
      await this.recalculatePersonalSponsorTeams(client, existingAssignments.rows.map((row: any) => row.team_id));
      return;
    }

    const contracts = await client.query(
      `SELECT DISTINCT ON (td.team_id)
        td.team_id,
        td.contract_ends_after_races,
        teams.momento_comercial
       FROM team_drivers td
       JOIN teams ON teams.id = td.team_id
       WHERE td.user_id = $1
         AND td.status = 'active'
       ORDER BY td.team_id, CASE WHEN td.category = 'starter' THEN 0 ELSE 1 END, td.slot_number ASC`,
      [pilotUserId],
    );

    const affectedTeamIds = new Set<string>(existingAssignments.rows.map((row: any) => row.team_id));
    for (const contract of contracts.rows) {
      affectedTeamIds.add(contract.team_id);
      for (const sponsor of sponsors.rows) {
        const slotNumber = await this.findAvailableSponsorSlot(
          client,
          contract.team_id,
          'personal_sponsor',
        );
        if (!slotNumber) continue;

        const initialReward = calculatePersonalSponsorSeasonValue(
          sponsor,
          { momentoComercial: Number(contract.momento_comercial) },
        );

        await client.query(
          `INSERT INTO team_sponsors (
            team_id,
            sponsor_id,
            category,
            slot_number,
            contract_races_remaining,
            initial_reward,
            reward_per_race,
            source,
            pilot_user_id
          ) VALUES ($1, $2, 'personal_sponsor', $3, $4, $5, 0, 'personal_sponsor', $6)
          ON CONFLICT (team_id, sponsor_id)
          DO UPDATE SET
            category = 'personal_sponsor',
            slot_number = EXCLUDED.slot_number,
            contract_races_remaining = EXCLUDED.contract_races_remaining,
            initial_reward = EXCLUDED.initial_reward,
            reward_per_race = 0,
            source = 'personal_sponsor',
            pilot_user_id = EXCLUDED.pilot_user_id,
            updated_at = NOW()`,
          [
            contract.team_id,
            sponsor.id,
            slotNumber,
            Number(contract.contract_ends_after_races),
            initialReward,
            pilotUserId,
          ],
        );

        if (!existingAssignmentKeys.has(`${contract.team_id}:${sponsor.id}`)) {
          await this.addPersonalSponsorIncomeIfMissing(
            client,
            contract.team_id,
            sponsor.name,
            initialReward,
          );
        }
      }
    }

    await this.recalculatePersonalSponsorTeams(client, Array.from(affectedTeamIds));
  }

  async syncPersonalSponsorAssignments(
    sponsorId: string,
    previousPilotUserId?: string | null,
    client: { query: (sql: string, params?: any[]) => Promise<any> } = { query },
  ) {
    if (previousPilotUserId) {
      await this.syncPersonalSponsorsForPilot(previousPilotUserId, client);
    }

    const sponsor = await client.query(
      `SELECT pilot_user_id
       FROM sponsors
       WHERE id = $1`,
      [sponsorId],
    );
    await this.syncPersonalSponsorsForPilot(sponsor.rows[0]?.pilot_user_id, client);
  }

  private async recalculatePersonalSponsorTeams(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamIds: string[],
  ) {
    for (const teamId of new Set(teamIds.filter(Boolean))) {
      await this.recalculateTeamSponsorIncome(client, teamId);
    }
  }

  private async addPersonalSponsorIncomeIfMissing(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
    sponsorName: string,
    amount: number,
  ) {
    const reason = `Personal sponsor ${sponsorName}`;
    const existing = await client.query(
      `SELECT id
       FROM team_financial_history
       WHERE team_id = $1
         AND amount = $2
         AND entry_type = 'income'
         AND source = 'sponsor'
         AND reason = $3
       LIMIT 1`,
      [teamId, amount, reason],
    );
    if (existing.rows[0]) return;

    await client.query(
      `UPDATE teams
       SET cash_total = cash_total + $1,
           updated_at = NOW()
       WHERE id = $2`,
      [amount, teamId],
    );
    await client.query(
      `INSERT INTO team_financial_history (team_id, amount, entry_type, reason, source)
       VALUES ($1, $2, 'income', $3, 'sponsor')`,
      [teamId, amount, reason],
    );
  }

  private async recalculateTeamSponsorIncome(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
  ) {
    await client.query(
      `UPDATE teams
       SET sponsor_income_per_race = COALESCE(
         (
          SELECT SUM(reward_per_race)
          FROM team_sponsors
          WHERE team_id = $1
         ),
         0
       ),
       updated_at = NOW()
       WHERE id = $1`,
      [teamId],
    );
  }

  async listScuderias() {
    const result = await query(`
      SELECT
        teams.id, teams.name, COALESCE(teams.full_name, teams.name) AS "fullName", teams.tag, teams.emoji, teams.color, teams.logo_url AS "logoUrl",
        teams.category,
        teams.is_junior_team AS "isJuniorTeam",
        teams.parent_team_id AS "parentTeamId",
        parent_team.name AS "parentTeamName",
        (
          SELECT COUNT(*)::int
          FROM team_drivers starter_driver
          WHERE starter_driver.team_id = teams.id
            AND starter_driver.status = 'active'
            AND starter_driver.category = 'starter'
        ) AS "starterDriverCount",
        (
          SELECT COUNT(*)::int
          FROM team_drivers reserve_driver
          WHERE reserve_driver.team_id = teams.id
            AND reserve_driver.status = 'active'
            AND reserve_driver.category = 'reserve'
        ) AS "reserveDriverCount",
        teams.momento_comercial AS "momentoComercial",
        teams.prestigio,
        teams.agressividade,
        teams.popularidade,
        teams.tecnica,
        teams.nacionalidades,
        teams.manual_nacionalidades AS "manualNacionalidades",
        COALESCE(
          (
            SELECT ARRAY_AGG(nationality ORDER BY normalized)
            FROM (
              SELECT DISTINCT ON (LOWER(TRIM(u.driver_nacionalidade)))
                TRIM(u.driver_nacionalidade) AS nationality,
                LOWER(TRIM(u.driver_nacionalidade)) AS normalized
              FROM team_drivers td
              JOIN users u ON u.id = td.user_id
              WHERE td.team_id = teams.id
                AND td.status = 'active'
                AND u.driver_wallet_created = true
                AND TRIM(COALESCE(u.driver_nacionalidade, '')) <> ''
              ORDER BY LOWER(TRIM(u.driver_nacionalidade)), TRIM(u.driver_nacionalidade)
            ) driver_nationalities
          ),
          ARRAY[]::text[]
        ) AS "driverNacionalidades",
        teams.setores,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'name', sponsor.name,
                'category', assignment.category,
                'slotNumber', assignment.slot_number
              )
              ORDER BY assignment.category, assignment.slot_number
            )
            FROM team_sponsors assignment
            JOIN sponsors sponsor ON sponsor.id = assignment.sponsor_id
            WHERE assignment.team_id = teams.id
          ),
          '[]'::json
        ) AS sponsors,
        teams.created_at AS "createdAt"
      FROM teams
      LEFT JOIN teams parent_team ON parent_team.id = teams.parent_team_id
      ORDER BY teams.name ASC
    `);

    return result.rows;
  }

  private normalizeScuderiaCategory(input: ScuderiaInput) {
    const category = input.category === 'formula_2' ? 'formula_2' : 'formula_1';
    const isJuniorTeam = category === 'formula_2' && Boolean(input.isJuniorTeam);
    const parentTeamId = isJuniorTeam ? (input.parentTeamId ?? null) : null;
    return { category, isJuniorTeam, parentTeamId };
  }

  private async applyFormula2TeamRules(
    client: { query: (sql: string, params?: any[]) => Promise<any> },
    teamId: string,
    parentTeamId: string | null,
    previousParentTeamId?: string | null,
  ) {
    const currentTeam = await client.query(
      'SELECT category, is_junior_team FROM teams WHERE id = $1',
      [teamId],
    );
    const isFormula2 = currentTeam.rows[0]?.category === 'formula_2';
    const isJuniorTeam = Boolean(currentTeam.rows[0]?.is_junior_team);

    if (isFormula2) {
      await client.query(
        `UPDATE teams
         SET climate_monitoring_level = 5,
             pit_crew_level = 5,
             climate_cost_per_race = 0,
             pit_crew_cost_per_race = 0,
             updated_at = NOW()
         WHERE id = $1`,
        [teamId],
      );
    }

    if (!parentTeamId) {
      if (isFormula2) return;

      const team = await client.query(
        'SELECT climate_monitoring_level, pit_crew_level FROM teams WHERE id = $1',
        [teamId],
      );
      const climateLevel = Number(team.rows[0]?.climate_monitoring_level ?? 0);
      const pitCrewLevel = Number(team.rows[0]?.pit_crew_level ?? 0);
      await client.query(
        `UPDATE teams
         SET climate_cost_per_race = $2,
             pit_crew_cost_per_race = $3,
             updated_at = NOW()
         WHERE id = $1`,
        [
          teamId,
          getFacilityCostPerRace('climate', climateLevel),
          getFacilityCostPerRace('pitCrew', pitCrewLevel),
        ],
      );
      return;
    }

    if (!isJuniorTeam) return;

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
      )
      SELECT
        parent_membership.user_id,
        $2,
        parent_membership.role,
        parent_membership.is_team_principal,
        parent_membership.is_team_assistant,
        parent_membership.is_engineer,
        false,
        null
      FROM user_team_memberships parent_membership
      WHERE parent_membership.team_id = $1
        AND (
          parent_membership.is_team_principal = true
          OR parent_membership.is_team_assistant = true
          OR parent_membership.is_engineer = true
        )
      ON CONFLICT (user_id, team_id)
      DO UPDATE SET
        is_team_principal = user_team_memberships.is_team_principal OR EXCLUDED.is_team_principal,
        is_team_assistant = user_team_memberships.is_team_assistant OR EXCLUDED.is_team_assistant,
        is_engineer = user_team_memberships.is_engineer OR EXCLUDED.is_engineer,
        role = CASE
          WHEN user_team_memberships.is_team_principal OR EXCLUDED.is_team_principal THEN 'team_principal'
          WHEN user_team_memberships.is_team_assistant OR EXCLUDED.is_team_assistant THEN 'team_assistant'
          WHEN user_team_memberships.is_engineer OR EXCLUDED.is_engineer THEN 'engineer'
          ELSE user_team_memberships.role
        END`,
      [parentTeamId, teamId],
    );

    if (previousParentTeamId === parentTeamId) return;

    await client.query(
      `UPDATE teams
       SET cash_total = cash_total + 1500000,
           updated_at = NOW()
       WHERE id = $1`,
      [parentTeamId],
    );
    await client.query(
      `INSERT INTO team_financial_history (team_id, amount, entry_type, reason, source)
       VALUES ($1, 1500000, 'income', $2, 'manual')`,
      [parentTeamId, 'Junior team registration bonus'],
    );
  }

  async createScuderia(input: ScuderiaInput) {
    const emoji = input.emoji?.trim() ?? '';
    const junior = this.normalizeScuderiaCategory(input);
    const existing = await queryOne(
      'SELECT id FROM teams WHERE LOWER(name) = LOWER($1) OR UPPER(tag) = UPPER($2)',
      [input.name, input.tag],
    );

    if (existing) {
      return { success: false, message: 'Scuderia name or abbreviation already exists' };
    }

    if (junior.isJuniorTeam) {
      const parent = await queryOne(
        "SELECT id FROM teams WHERE id = $1 AND category = 'formula_1'",
        [junior.parentTeamId],
      );
      if (!parent) return { success: false, message: 'Parent Formula 1 scuderia not found' };
    }

    return transaction(async (client) => {
      const result = await client.query(
        `INSERT INTO teams (
          name,
          full_name,
          tag,
          emoji,
          color,
          category,
          is_junior_team,
          parent_team_id,
          climate_monitoring_level,
          pit_crew_level,
          climate_cost_per_race,
          pit_crew_cost_per_race,
          momento_comercial,
          prestigio,
          agressividade,
          popularidade,
          tecnica,
          manual_nacionalidades,
          nacionalidades,
          setores,
          logo_url,
          created_at,
          updated_at
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CASE WHEN $7 THEN 5 ELSE 0 END, CASE WHEN $7 THEN 5 ELSE 0 END, 0, 0, COALESCE($9, 50), COALESCE($10, 1),
           COALESCE($11, 1), COALESCE($12, 1), COALESCE($13, 1), $14, $14, $15, $16, NOW(), NOW())
         RETURNING id`,
        [
          input.name, input.fullName?.trim() || input.name, input.tag.toUpperCase(), emoji, input.color,
          junior.category, junior.isJuniorTeam, junior.parentTeamId,
          input.momentoComercial ?? null, input.prestigio ?? null, input.agressividade ?? null,
          input.popularidade ?? null, input.tecnica ?? null, input.nacionalidades ?? null,
          input.setores ?? null, input.logoUrl ?? null,
        ],
      );

      await this.syncTeamNationalities(result.rows[0].id, client);
      await this.applyFormula2TeamRules(client, result.rows[0].id, junior.parentTeamId);

      return { success: true, scuderia: result.rows[0] };
    });
  }

  async updateScuderia(scuderiaId: string, input: ScuderiaInput) {
    const emoji = input.emoji?.trim() ?? '';
    const junior = this.normalizeScuderiaCategory(input);
    const current = await queryOne<{ parent_team_id: string | null }>(
      'SELECT parent_team_id FROM teams WHERE id = $1',
      [scuderiaId],
    );
    if (!current) return { success: false, message: 'Scuderia not found' };
    if (junior.isJuniorTeam) {
      const parent = await queryOne(
        "SELECT id FROM teams WHERE id = $1 AND category = 'formula_1' AND id <> $2",
        [junior.parentTeamId, scuderiaId],
      );
      if (!parent) return { success: false, message: 'Parent Formula 1 scuderia not found' };
    }

    return transaction(async (client) => {
      const result = await client.query(
       `UPDATE teams
       SET name = $1,
           full_name = $2,
           tag = $3,
           emoji = $4,
           color = $5,
           category = $6,
           is_junior_team = $7,
           parent_team_id = $8,
           momento_comercial = COALESCE($9, momento_comercial),
           prestigio = COALESCE($10, prestigio),
           agressividade = COALESCE($11, agressividade),
           popularidade = COALESCE($12, popularidade),
           tecnica = COALESCE($13, tecnica),
           manual_nacionalidades = COALESCE($14, manual_nacionalidades),
           nacionalidades = COALESCE($14, nacionalidades),
           setores = COALESCE($15, setores),
           logo_url = COALESCE($16, logo_url),
           updated_at = NOW()
       WHERE id = $17
       RETURNING id`,
        [
          input.name, input.fullName?.trim() || input.name, input.tag.toUpperCase(), emoji, input.color,
          junior.category, junior.isJuniorTeam, junior.parentTeamId,
          input.momentoComercial ?? null, input.prestigio ?? null, input.agressividade ?? null,
          input.popularidade ?? null, input.tecnica ?? null, input.nacionalidades ?? null,
          input.setores ?? null, input.logoUrl ?? null, scuderiaId,
        ],
      );

      await this.syncTeamNationalities(scuderiaId, client);
      await this.applyFormula2TeamRules(client, scuderiaId, junior.parentTeamId, current.parent_team_id);

      return { success: true, scuderia: result.rows[0] };
    });
  }

  async deleteScuderia(scuderiaId: string) {
    const result = await query('DELETE FROM teams WHERE id = $1 RETURNING id', [
      scuderiaId,
    ]);

    if (!result.rows[0]) {
      return { success: false, message: 'Scuderia not found' };
    }

    return { success: true };
  }

  async addTeamFinanceEntry(scuderiaId: string, input: TeamFinanceEntryInput) {
    const team = await queryOne('SELECT id FROM teams WHERE id = $1', [scuderiaId]);
    if (!team) {
      return { success: false, message: 'Scuderia not found' };
    }

    const signedAmount = input.entryType === 'income'
      ? Math.abs(input.amount)
      : -Math.abs(input.amount);

    const result = await transaction(async (client) => {
      const history = await client.query(
        `INSERT INTO team_financial_history (
          team_id,
          amount,
          entry_type,
          reason,
          source,
          occurred_at
        ) VALUES ($1, $2, $3, $4, 'manual', COALESCE($5::timestamp, NOW()))
        RETURNING id`,
        [
          scuderiaId,
          Math.abs(input.amount),
          input.entryType,
          input.reason,
          input.occurredAt ?? null,
        ],
      );

      await client.query(
        `UPDATE teams
         SET cash_total = cash_total + $1,
             updated_at = NOW()
         WHERE id = $2`,
        [signedAmount, scuderiaId],
      );

      return history.rows[0];
    });

    return { success: true, entry: result };
  }

  async adjustScuderiaCommercialMomentum(
    scuderiaId: string,
    input: CommercialMomentumAdjustmentInput,
  ) {
    const commercialMomentumDelta = Math.trunc(Number(input.commercialMomentumDelta));
    const sponsorHappinessChanges = Array.isArray(input.sponsorHappinessChanges)
      ? input.sponsorHappinessChanges.map((change) => ({
          teamSponsorId: change.teamSponsorId,
          happinessDelta: Math.trunc(Number(change.happinessDelta)),
        }))
      : [];

    if (!Number.isFinite(commercialMomentumDelta) || commercialMomentumDelta < -100 || commercialMomentumDelta > 100) {
      return { success: false, message: 'Commercial momentum adjustment is invalid' };
    }

    if (sponsorHappinessChanges.some((change) =>
      !change.teamSponsorId
      || !Number.isFinite(change.happinessDelta)
      || change.happinessDelta < -100
      || change.happinessDelta > 100
    )) {
      return { success: false, message: 'Sponsor happiness adjustment is invalid' };
    }

    const result = await transaction(async (client) => {
      const teamResult = await client.query(
        `UPDATE teams
         SET momento_comercial = LEAST(100, GREATEST(0, momento_comercial + $1)),
             updated_at = NOW()
         WHERE id = $2
         RETURNING id, momento_comercial AS "momentoComercial"`,
        [commercialMomentumDelta, scuderiaId],
      );

      if (!teamResult.rows[0]) {
        return null;
      }

      const sponsors = [];
      for (const change of sponsorHappinessChanges) {
        const sponsorResult = await client.query(
          `UPDATE sponsors
           SET felicidade = LEAST(100, GREATEST(0, sponsors.felicidade + $1)),
               updated_at = NOW()
           FROM team_sponsors
           WHERE team_sponsors.id = $2
             AND team_sponsors.team_id = $3
             AND team_sponsors.sponsor_id = sponsors.id
           RETURNING
             team_sponsors.id AS "teamSponsorId",
             sponsors.id AS "sponsorId",
             sponsors.name,
             sponsors.felicidade`,
          [change.happinessDelta, change.teamSponsorId, scuderiaId],
        );

        if (sponsorResult.rows[0]) {
          sponsors.push({
            ...sponsorResult.rows[0],
            felicidade: Number(sponsorResult.rows[0].felicidade),
          });
        }
      }

      return {
        team: {
          ...teamResult.rows[0],
          momentoComercial: Number(teamResult.rows[0].momentoComercial),
        },
        sponsors,
      };
    });

    return result
      ? { success: true, ...result }
      : { success: false, message: 'Scuderia not found' };
  }

  async getScuderiaManagement(scuderiaId: string) {
    const garage = await garageService.getTeamGarage(scuderiaId);
    if (!garage) return null;

    const boxes = await query(
      `SELECT
        team_circuit_boxes.id,
        team_circuit_boxes.circuit_id AS "circuitId",
        circuits.simple_name AS "circuitSimpleName",
        circuits.full_name AS "circuitFullName",
        team_circuit_boxes.x,
        team_circuit_boxes.y,
        team_circuit_boxes.created_at AS "createdAt"
       FROM team_circuit_boxes
       JOIN circuits ON circuits.id = team_circuit_boxes.circuit_id
       WHERE team_circuit_boxes.team_id = $1
       ORDER BY circuits.simple_name ASC`,
      [scuderiaId],
    );
    const sponsorMarketReviews = await query(
      `SELECT
        review.id,
        review.sponsor_id AS "sponsorId",
        sponsor.name AS "sponsorName",
        sponsor.logo_url AS "sponsorLogoUrl",
        review.category,
        review.initial_reward AS "initialReward",
        review.created_at AS "createdAt"
       FROM sponsor_market_reviews review
       JOIN sponsors sponsor ON sponsor.id = review.sponsor_id
       WHERE review.team_id = $1
         AND review.status = 'pending'
       ORDER BY review.created_at DESC`,
      [scuderiaId],
    );

    return {
      ...garage,
      name: garage.fullName || garage.name,
      circuitBoxes: boxes.rows.map((box) => ({
        ...box,
        x: Number(box.x),
        y: Number(box.y),
      })),
      sponsorMarketReviews: sponsorMarketReviews.rows.map((review) => ({
        ...review,
        initialReward: Number(review.initialReward ?? 0),
        rewardPerRace: 0,
        contractRacesRemaining: 12,
      })),
    };
  }

  async listCircuits() {
    const result = await query(
      `SELECT
        id,
        simple_name AS "simpleName",
        full_name AS "fullName",
        created_at AS "createdAt"
       FROM circuits
       ORDER BY simple_name ASC`,
    );

    return result.rows;
  }

  async createCircuit(input: CircuitInput) {
    const result = await query(
      `INSERT INTO circuits (simple_name, full_name, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id, simple_name AS "simpleName", full_name AS "fullName", created_at AS "createdAt"`,
      [input.simpleName.trim(), input.fullName.trim()],
    );

    return { success: true, circuit: result.rows[0] };
  }

  async updateCircuit(circuitId: string, input: CircuitInput) {
    const result = await query(
      `UPDATE circuits
       SET simple_name = $1,
           full_name = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, simple_name AS "simpleName", full_name AS "fullName", created_at AS "createdAt"`,
      [input.simpleName.trim(), input.fullName.trim(), circuitId],
    );

    return result.rows[0]
      ? { success: true, circuit: result.rows[0] }
      : { success: false, message: 'Circuit not found' };
  }

  async deleteCircuit(circuitId: string) {
    const result = await query('DELETE FROM circuits WHERE id = $1 RETURNING id', [circuitId]);
    return result.rows[0]
      ? { success: true }
      : { success: false, message: 'Circuit not found' };
  }

  async addTeamCircuitBox(scuderiaId: string, input: TeamCircuitBoxInput) {
    const result = await transaction(async (client) => {
      const saved = await client.query(
        `INSERT INTO team_circuit_boxes (team_id, circuit_id, x, y, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (team_id, circuit_id)
         DO UPDATE SET
           x = EXCLUDED.x,
           y = EXCLUDED.y,
           updated_at = NOW()
         RETURNING id`,
        [scuderiaId, input.circuitId, input.x, input.y],
      );

      await client.query(
        `INSERT INTO team_circuit_boxes (team_id, circuit_id, x, y, created_at, updated_at)
         SELECT id, $2, $3, $4, NOW(), NOW()
         FROM teams
         WHERE parent_team_id = $1
           AND is_junior_team = true
         ON CONFLICT (team_id, circuit_id)
         DO UPDATE SET
           x = EXCLUDED.x,
           y = EXCLUDED.y,
           updated_at = NOW()`,
        [scuderiaId, input.circuitId, input.x, input.y],
      );

      return saved;
    });

    return { success: true, circuitBox: result.rows[0] };
  }

  async listCircuitTeamBoxes(circuitId: string) {
    const circuit = await queryOne<{ id: string; simpleName: string; fullName: string }>(
      `SELECT id, simple_name AS "simpleName", full_name AS "fullName"
       FROM circuits
       WHERE id = $1`,
      [circuitId],
    );
    if (!circuit) return { success: false, message: 'Circuit not found' };

    const result = await query(
      `SELECT
        teams.id AS "teamId",
        teams.name AS "teamName",
        COALESCE(teams.full_name, teams.name) AS "teamFullName",
        teams.category,
        teams.is_junior_team AS "isJuniorTeam",
        teams.parent_team_id AS "parentTeamId",
        COALESCE(parent_team.full_name, parent_team.name) AS "parentTeamName",
        direct_box.id AS "boxId",
        COALESCE(direct_box.x, parent_box.x) AS x,
        COALESCE(direct_box.y, parent_box.y) AS y,
        direct_box.id IS NULL AND parent_box.id IS NOT NULL AS inherited
       FROM teams
       LEFT JOIN teams parent_team ON parent_team.id = teams.parent_team_id
       LEFT JOIN team_circuit_boxes direct_box
         ON direct_box.team_id = teams.id
        AND direct_box.circuit_id = $1
       LEFT JOIN team_circuit_boxes parent_box
         ON parent_box.team_id = teams.parent_team_id
        AND parent_box.circuit_id = $1
       ORDER BY COALESCE(teams.category, 'formula_1') ASC, teams.name ASC`,
      [circuitId],
    );

    return {
      success: true,
      circuit,
      boxes: result.rows.map((row) => ({
        ...row,
        x: row.x === null || row.x === undefined ? null : Number(row.x),
        y: row.y === null || row.y === undefined ? null : Number(row.y),
      })),
    };
  }

  async saveCircuitTeamBoxes(circuitId: string, boxes: CircuitTeamBoxInput[]) {
    const circuit = await queryOne<{ id: string }>('SELECT id FROM circuits WHERE id = $1', [circuitId]);
    if (!circuit) return { success: false, message: 'Circuit not found' };

    await transaction(async (client) => {
      for (const box of boxes) {
        if (!box.teamId || box.x === null || box.x === undefined || box.y === null || box.y === undefined) continue;
        await client.query(
          `INSERT INTO team_circuit_boxes (team_id, circuit_id, x, y, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           ON CONFLICT (team_id, circuit_id)
           DO UPDATE SET
             x = EXCLUDED.x,
             y = EXCLUDED.y,
             updated_at = NOW()`,
          [box.teamId, circuitId, box.x, box.y],
        );
        await client.query(
          `INSERT INTO team_circuit_boxes (team_id, circuit_id, x, y, created_at, updated_at)
           SELECT id, $2, $3, $4, NOW(), NOW()
           FROM teams
           WHERE parent_team_id = $1
             AND is_junior_team = true
           ON CONFLICT (team_id, circuit_id)
           DO UPDATE SET
             x = EXCLUDED.x,
             y = EXCLUDED.y,
             updated_at = NOW()`,
          [box.teamId, circuitId, box.x, box.y],
        );
      }
    });

    return { success: true };
  }

  async removeTeamCircuitBox(scuderiaId: string, boxId: string) {
    const result = await query(
      'DELETE FROM team_circuit_boxes WHERE id = $1 AND team_id = $2 RETURNING id',
      [boxId, scuderiaId],
    );

    return result.rows[0]
      ? { success: true }
      : { success: false, message: 'Circuit box not found' };
  }

  async listRaceProgressAlerts() {
    const result = await query(
      `SELECT
        id,
        entity_type AS "entityType",
        entity_id AS "entityId",
        team_id AS "teamId",
        team_name AS "teamName",
        entity_name AS "entityName",
        detail,
        created_at AS "createdAt"
       FROM race_progress_alerts
       ORDER BY created_at DESC
       LIMIT 200`,
    );

    return result.rows;
  }

  async clearRaceProgressAlerts() {
    await query('DELETE FROM race_progress_alerts');
    return { success: true };
  }

  async progressRace(direction: RaceProgressDirection) {
    const step = direction === 'advance' ? -1 : 1;
    const financeMultiplier = direction === 'advance' ? 1 : -1;

    return transaction(async (client) => {
      const teams = await client.query(
        `SELECT
          id,
          name,
          climate_cost_per_race,
          pit_crew_cost_per_race,
          salary_cost_per_race,
          sponsor_income_per_race
         FROM teams
         ORDER BY name ASC
         FOR UPDATE`,
      );

      for (const team of teams.rows) {
        const sponsorIncome = Number(team.sponsor_income_per_race);
        const climateCost = Number(team.climate_cost_per_race);
        const pitCrewCost = Number(team.pit_crew_cost_per_race);
        const salaryCost = Number(team.salary_cost_per_race);
        const net = sponsorIncome - climateCost - pitCrewCost - salaryCost;
        const cashDelta = net * financeMultiplier;

        await client.query(
          `UPDATE teams
           SET cash_total = cash_total + $1,
               total_races = GREATEST(total_races + $2, 0),
               updated_at = NOW()
           WHERE id = $3`,
          [cashDelta, direction === 'advance' ? 1 : -1, team.id],
        );

        if (cashDelta !== 0) {
          await client.query(
            `INSERT INTO team_financial_history (team_id, amount, entry_type, reason, source)
             VALUES ($1, $2, $3, $4, 'standard_race')`,
            [
              team.id,
              Math.abs(cashDelta),
              cashDelta >= 0 ? 'income' : 'expense',
              direction === 'advance' ? 'Race progress' : 'Race rollback',
            ],
          );
        }
      }

      if (direction === 'advance') {
        await this.createRaceProgressAlerts(client);
      }

      await client.query(
        `UPDATE team_drivers
         SET contract_ends_after_races = GREATEST(contract_ends_after_races + $1, 0),
             updated_at = NOW()
         WHERE status = 'active'`,
        [step],
      );
      await client.query(
        `UPDATE team_sponsors
         SET contract_races_remaining = GREATEST(contract_races_remaining + $1, 0),
             updated_at = NOW()`,
        [step],
      );
      await client.query(
        `UPDATE team_sponsor_season_missions
         SET races_to_complete = GREATEST(races_to_complete + $1, 0)`,
        [step],
      );

      return { success: true };
    });
  }

  private async createRaceProgressAlerts(client: { query: (sql: string, params?: any[]) => Promise<any> }) {
    await client.query(
      `INSERT INTO race_progress_alerts (
        entity_type,
        entity_id,
        team_id,
        team_name,
        entity_name,
        detail
      )
      SELECT
        'driver_contract',
        td.id,
        t.id,
        t.name,
        td.display_name,
        td.display_name
      FROM team_drivers td
      JOIN teams t ON t.id = td.team_id
      WHERE td.status = 'active'
        AND td.contract_ends_after_races = 1`,
    );

    await client.query(
      `INSERT INTO race_progress_alerts (
        entity_type,
        entity_id,
        team_id,
        team_name,
        entity_name,
        detail
      )
      SELECT
        'sponsor_contract',
        ts.id,
        t.id,
        t.name,
        s.name,
        s.name
      FROM team_sponsors ts
      JOIN teams t ON t.id = ts.team_id
      JOIN sponsors s ON s.id = ts.sponsor_id
      WHERE ts.contract_races_remaining = 1`,
    );

    await client.query(
      `INSERT INTO race_progress_alerts (
        entity_type,
        entity_id,
        team_id,
        team_name,
        entity_name,
        detail
      )
      SELECT
        'season_mission',
        sm.id,
        t.id,
        t.name,
        sm.title,
        s.name || ' - ' || sm.title
      FROM team_sponsor_season_missions sm
      JOIN team_sponsors ts ON ts.id = sm.team_sponsor_id
      JOIN sponsors s ON s.id = ts.sponsor_id
      JOIN teams t ON t.id = ts.team_id
      WHERE sm.races_to_complete = 1`,
    );
  }

  async addScuderiaDriver(scuderiaId: string, input: AdminDriverInput) {
    const user = await this.findActiveUserByUsername(input.username);
    if (!user) return { success: false, message: 'Driver user not found' };

    const validation = await this.validateDriverAssignment(scuderiaId, user.id, input.category);
    if (!validation.success) return validation;

    return transaction(async (client) => {
      await this.upsertTeamDriver(client, scuderiaId, user.id, input, user.driver_number);
      await this.upsertDriverMembership(client, user.id, scuderiaId, input.category);
      await this.recalculateTeamSalaryCost(client, scuderiaId);
      await this.syncTeamNationalities(scuderiaId, client);
      await this.syncPersonalSponsorsForPilot(user.id, client);
      return { success: true };
    });
  }

  async updateScuderiaDriver(scuderiaId: string, driverId: string, input: Omit<AdminDriverInput, 'username'>) {
    const existing = await queryOne<{ user_id: string }>(
      `SELECT user_id
       FROM team_drivers
       WHERE id = $1
         AND team_id = $2
         AND status = 'active'`,
      [driverId, scuderiaId],
    );
    if (!existing?.user_id) return { success: false, message: 'Driver contract not found' };

    const validation = await this.validateDriverAssignment(scuderiaId, existing.user_id, input.category, driverId);
    if (!validation.success) return validation;

    return transaction(async (client) => {
      const slotNumber = await this.findAvailableDriverSlot(client, scuderiaId, input.category, driverId);
      await client.query(
        `UPDATE team_drivers
         SET category = $1,
             contract_ends_after_races = $2,
             salary_per_race = $3,
             slot_number = $4,
             updated_at = NOW()
         WHERE id = $5
           AND team_id = $6`,
        [input.category, input.contractRaces, input.salaryPerRace, slotNumber, driverId, scuderiaId],
      );
      await this.upsertDriverMembership(client, existing.user_id, scuderiaId, input.category);
      await this.recalculateTeamSalaryCost(client, scuderiaId);
      await this.syncTeamNationalities(scuderiaId, client);
      await this.syncPersonalSponsorsForPilot(existing.user_id, client);
      return { success: true };
    });
  }

  async removeScuderiaDriver(scuderiaId: string, driverId: string) {
    return transaction(async (client) => {
      const existing = await client.query(
        `SELECT user_id
         FROM team_drivers
         WHERE id = $1
           AND team_id = $2
           AND status = 'active'`,
        [driverId, scuderiaId],
      );
      const row = existing.rows[0];
      if (!row) return { success: false, message: 'Driver contract not found' };

      await client.query(
        `UPDATE team_drivers
         SET status = 'released',
             updated_at = NOW()
         WHERE id = $1`,
        [driverId],
      );
      if (row.user_id) {
        await this.removeDriverMembershipIfNeeded(client, row.user_id, scuderiaId);
      }
      await this.recalculateTeamSalaryCost(client, scuderiaId);
      await this.syncTeamNationalities(scuderiaId, client);
      await this.syncPersonalSponsorsForPilot(row.user_id, client);
      return { success: true };
    });
  }

  async updateScuderiaCarName(scuderiaId: string, carName: string | null) {
    const result = await query(
      `UPDATE teams
       SET car_name = COALESCE(NULLIF($1, ''), 'Unnamed car'),
           updated_at = NOW()
       WHERE id = $2
       RETURNING id`,
      [carName, scuderiaId],
    );
    return result.rows[0]
      ? { success: true }
      : { success: false, message: 'Scuderia not found' };
  }

  async listSponsors() {
    const result = await query(
      `SELECT
        sponsors.id,
        sponsors.name,
        sponsors.name AS nome,
        sponsors.logo_url AS "logoUrl",
        sponsors.nacionalidade,
        sponsors.tipo,
        sponsors.setor,
        sponsors.felicidade,
        sponsors.prestigio,
        sponsors.agressividade,
        sponsors.foco_em_midia AS "focoEmMidia",
        sponsors.foco_tecnico AS "focoTecnico",
        sponsors.nacionalismo,
        sponsors.fidelidade,
        sponsors.orcamento,
        sponsors.ambicao,
        sponsors.publico_alvo_1 AS "publicoAlvo1",
        sponsors.publico_alvo_2 AS "publicoAlvo2",
        sponsors.pilot_user_id AS "pilotUserId",
        pilot_user.username AS "pilotUsername",
        COALESCE(
          (
            SELECT json_agg(
              json_build_object('id', related_team.id, 'name', related_team.name)
              ORDER BY related_team.name
            )
            FROM (
              SELECT DISTINCT contracted_team.id, COALESCE(contracted_team.full_name, contracted_team.name) AS name
              FROM team_sponsors related_contract
              JOIN teams contracted_team ON contracted_team.id = related_contract.team_id
              WHERE related_contract.sponsor_id = sponsors.id
            ) related_team
          ),
          '[]'::json
        ) AS "scuderiasRelacionadas"
       FROM sponsors
       LEFT JOIN users pilot_user ON pilot_user.id = sponsors.pilot_user_id
       ORDER BY sponsors.name ASC`,
    );
    return result.rows;
  }

  async createSponsor(input: SponsorInput) {
    const name = input.nome ?? input.name!;
    const normalizedCategory = normalizeSponsorCategory(input.tipo);
    const pilotUserId = normalizedCategory === 'personal_sponsor' ? input.pilotUserId : null;
    if (normalizedCategory === 'personal_sponsor') {
      const personalSponsorValidation = await this.validatePersonalSponsorPilot(pilotUserId);
      if (!personalSponsorValidation.success) return personalSponsorValidation;
    }

    return transaction(async (client) => {
      const result = await client.query(
        `INSERT INTO sponsors (
          name, logo_url, nacionalidade, tipo, setor, felicidade, prestigio, agressividade,
          foco_em_midia, foco_tecnico, nacionalismo, fidelidade, orcamento, ambicao,
          publico_alvo_1, publico_alvo_2, pilot_user_id, created_at, updated_at
        )
         VALUES (
          $1, $2, $3, $4, $5, COALESCE($6, 50), COALESCE($7, 1), COALESCE($8, 1),
          COALESCE($9, 1), COALESCE($10, 1), COALESCE($11, 1), COALESCE($12, 1),
          COALESCE($13, 1), COALESCE($14, 1), $15, $16, $17, NOW(), NOW()
         )
         RETURNING id`,
        [
          name, input.logoUrl, input.nacionalidade ?? null, input.tipo ?? null, input.setor ?? null,
          input.felicidade ?? null, input.prestigio ?? null, input.agressividade ?? null,
          input.focoEmMidia ?? null, input.focoTecnico ?? null, input.nacionalismo ?? null,
          input.fidelidade ?? null, input.orcamento ?? null, input.ambicao ?? null,
          input.publicoAlvo1 ?? null, input.publicoAlvo2 ?? null, pilotUserId,
        ],
      );
      await this.syncPersonalSponsorsForPilot(pilotUserId, client);
      return { success: true, sponsor: result.rows[0] };
    });
  }

  async updateSponsor(sponsorId: string, input: SponsorInput) {
    const current = await queryOne<{
      name: string;
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
      pilotUserId: string | null;
    }>(
      `SELECT
        name, nacionalidade, tipo, setor, felicidade, prestigio, agressividade,
        foco_em_midia AS "focoEmMidia", foco_tecnico AS "focoTecnico",
        nacionalismo, fidelidade, orcamento, ambicao,
        publico_alvo_1 AS "publicoAlvo1", publico_alvo_2 AS "publicoAlvo2",
        pilot_user_id AS "pilotUserId"
       FROM sponsors
       WHERE id = $1`,
      [sponsorId],
    );
    if (!current) return { success: false, message: 'Sponsor not found' };

    const name = input.nome ?? input.name ?? current.name;
    const nextTipo = input.tipo === undefined ? current.tipo : input.tipo;
    const normalizedCategory = normalizeSponsorCategory(nextTipo);
    const nextPilotUserId = normalizedCategory === 'personal_sponsor'
      ? (input.pilotUserId === undefined ? current.pilotUserId : input.pilotUserId)
      : null;
    if (normalizedCategory === 'personal_sponsor') {
      const personalSponsorValidation = await this.validatePersonalSponsorPilot(nextPilotUserId, sponsorId);
      if (!personalSponsorValidation.success) return personalSponsorValidation;
    }

    return transaction(async (client) => {
      const result = await client.query(
        `UPDATE sponsors
         SET name = $1,
             logo_url = $2,
             nacionalidade = $3,
             tipo = $4,
             setor = $5,
             felicidade = COALESCE($6, felicidade),
             prestigio = COALESCE($7, prestigio),
             agressividade = COALESCE($8, agressividade),
             foco_em_midia = COALESCE($9, foco_em_midia),
             foco_tecnico = COALESCE($10, foco_tecnico),
             nacionalismo = COALESCE($11, nacionalismo),
             fidelidade = COALESCE($12, fidelidade),
             orcamento = COALESCE($13, orcamento),
             ambicao = COALESCE($14, ambicao),
             publico_alvo_1 = $15,
             publico_alvo_2 = $16,
             pilot_user_id = $17,
             updated_at = NOW()
         WHERE id = $18
         RETURNING id`,
        [
          name, input.logoUrl,
          input.nacionalidade === undefined ? current.nacionalidade : input.nacionalidade,
          nextTipo,
          input.setor === undefined ? current.setor : input.setor,
          input.felicidade ?? current.felicidade,
          input.prestigio ?? current.prestigio,
          input.agressividade ?? current.agressividade,
          input.focoEmMidia ?? current.focoEmMidia,
          input.focoTecnico ?? current.focoTecnico,
          input.nacionalismo ?? current.nacionalismo,
          input.fidelidade ?? current.fidelidade,
          input.orcamento ?? current.orcamento,
          input.ambicao ?? current.ambicao,
          input.publicoAlvo1 === undefined ? current.publicoAlvo1 : input.publicoAlvo1,
          input.publicoAlvo2 === undefined ? current.publicoAlvo2 : input.publicoAlvo2,
          nextPilotUserId,
          sponsorId,
        ],
      );
      if (!result.rows[0]) return { success: false, message: 'Sponsor not found' };
      await this.syncPersonalSponsorAssignments(sponsorId, current.pilotUserId, client);
      return { success: true };
    });
  }

  async deleteSponsor(sponsorId: string) {
    return transaction(async (client) => {
      const current = await client.query(
        'SELECT pilot_user_id FROM sponsors WHERE id = $1',
        [sponsorId],
      );
      const result = await client.query('DELETE FROM sponsors WHERE id = $1 RETURNING id', [sponsorId]);
      if (!result.rows[0]) return { success: false, message: 'Sponsor not found' };
      await this.syncPersonalSponsorsForPilot(current.rows[0]?.pilot_user_id, client);
      return { success: true };
    });
  }

  private async validatePersonalSponsorPilot(pilotUserId?: string | null, sponsorId?: string) {
    if (!pilotUserId) {
      return { success: false, message: 'Personal sponsor requires a driver wallet' };
    }

    const driver = await queryOne<{ id: string }>(
      `SELECT id
       FROM users
       WHERE id = $1
         AND COALESCE(is_active, true) = true
         AND driver_wallet_created = true`,
      [pilotUserId],
    );
    if (!driver) return { success: false, message: 'Driver wallet not found' };

    const existing = await queryOne<{ id: string }>(
      `SELECT id
       FROM sponsors
       WHERE pilot_user_id = $1
         AND ($2::uuid IS NULL OR id <> $2::uuid)
       LIMIT 1`,
      [pilotUserId, sponsorId ?? null],
    );
    if (existing) return { success: false, message: 'Driver already has a personal sponsor' };

    return { success: true };
  }

  async generateSponsorMarketRound(scuderiaId: string) {
    const team = await queryOne<MarketTeamProfile>(
      `SELECT
        id,
        COALESCE(full_name, name) AS name,
        prestigio,
        agressividade,
        popularidade,
        tecnica,
        momento_comercial AS "momentoComercial",
        nacionalidades
       FROM teams
       WHERE id = $1`,
      [scuderiaId],
    );
    if (!team) return { success: false, message: 'Scuderia not found' };

    const assignedSponsors = await query<{ name: string; tipo: string | null; setor: string | null; category: SponsorContractCategory }>(
      `SELECT s.name, s.tipo, s.setor, ts.category
       FROM team_sponsors ts
       JOIN sponsors s ON s.id = ts.sponsor_id
       WHERE ts.team_id = $1`,
      [scuderiaId],
    );
    const hasTitleSponsor = assignedSponsors.rows.some(
      (sponsor) =>
        sponsor.category === 'title_sponsor'
        || normalizeSponsorCategory(sponsor.tipo) === 'title_sponsor',
    );
    const normalizeMarketText = (value: string | null | undefined) => value?.trim().toLocaleLowerCase() ?? '';
    const assignedCategoryCounts = assignedSponsors.rows.reduce<Record<string, number>>((counts, sponsor) => {
      const category = sponsor.category || normalizeSponsorCategory(sponsor.tipo);
      if (category) counts[category] = (counts[category] ?? 0) + 1;
      return counts;
    }, {});
    const getCaveats = (sponsor: Pick<MarketSponsorProfile, 'tipo' | 'setor'>) => {
      const caveats: {
        type: 'setor_repetido' | 'tipo_repetido';
        sector?: string | null;
        companies?: string[];
      }[] = [];
      const sector = normalizeMarketText(sponsor.setor);
      const category = normalizeSponsorCategory(sponsor.tipo);
      const sectorMatches = assignedSponsors.rows.filter(
        (assigned) => sector && normalizeMarketText(assigned.setor) === sector,
      );

      if (sectorMatches.length > 0) {
        caveats.push({
          type: 'setor_repetido',
          sector: sponsor.setor,
          companies: sectorMatches.map((assigned) => assigned.name),
        });
      }
      if (category && (assignedCategoryCounts[category] ?? 0) >= SPONSOR_CATEGORY_LIMITS[category]) {
        caveats.push({ type: 'tipo_repetido' });
      }

      return caveats;
    };

    const result = await query<MarketSponsorProfile & { relatedTeamNames: string[] }>(
      `SELECT
        s.id,
        s.name,
        s.logo_url AS "logoUrl",
        s.nacionalidade,
        s.tipo,
        s.setor,
        s.felicidade,
        s.prestigio,
        s.agressividade,
        s.foco_em_midia AS "focoEmMidia",
        s.foco_tecnico AS "focoTecnico",
        s.nacionalismo,
        s.orcamento,
        s.ambicao,
        s.fidelidade,
        s.publico_alvo_1 AS "publicoAlvo1",
        s.publico_alvo_2 AS "publicoAlvo2",
        ARRAY(
          SELECT related_contract.team_id
          FROM team_sponsors related_contract
          WHERE related_contract.sponsor_id = s.id
        ) AS "scuderiasRelacionadas",
        ARRAY(
          SELECT COALESCE(related_team.full_name, related_team.name)
          FROM team_sponsors related_contract
          JOIN teams related_team ON related_team.id = related_contract.team_id
          WHERE related_contract.sponsor_id = s.id
          ORDER BY COALESCE(related_team.full_name, related_team.name)
        ) AS "relatedTeamNames"
       FROM sponsors s
       WHERE NOT EXISTS (
         SELECT 1 FROM team_sponsors assigned
         WHERE assigned.team_id = $1 AND assigned.sponsor_id = s.id
       )`,
      [scuderiaId],
    );
    const proposalCount = drawMarketProposalCount(team.momentoComercial);
    const selectedSponsorIds = new Set<string>();
    const proposals = [];

    const getOrigin = (sponsor: MarketSponsorProfile): MarketSponsorOrigin | null => {
      if (!sponsor.scuderiasRelacionadas?.length) return 'unassigned';
      if (sponsor.felicidade <= 10) return 'unhappy_0_10';
      if (sponsor.felicidade <= 20) return 'unhappy_10_20';
      if (sponsor.felicidade <= 30) return 'unhappy_20_30';
      return null;
    };

    for (let index = 0; index < proposalCount; index += 1) {
      const category = drawMarketProposalCategory();
      const desiredOrigin = drawMarketSponsorOrigin();
      const availableForCategory = result.rows.filter(
        (sponsor) => normalizeSponsorCategory(sponsor.tipo) === category
          && !selectedSponsorIds.has(sponsor.id)
          && getOrigin(sponsor) !== null,
      );
      const candidates = availableForCategory
        .filter((sponsor) => getOrigin(sponsor) === desiredOrigin)
        .map((sponsor) => ({
          sponsor,
          ...calculateCompatibility(sponsor, team),
        }))
        .sort((left, right) => right.pesoFinal - left.pesoFinal);
      const selected = selectWeightedProposal(candidates);
      if (!selected) continue;

      selectedSponsorIds.add(selected.sponsor.id);
      proposals.push({
        sponsor: selected.sponsor,
        category,
        origem: getOrigin(selected.sponsor)!,
        origemEquipes: selected.sponsor.relatedTeamNames,
        compatibilidade: selected.compatibilidade,
        pesoFinal: selected.pesoFinal,
        scores: selected.scores,
        nationalityCompatible: selected.nationalityCompatible,
        valorContrato: calculateContractValue(category, selected.sponsor, team),
        exigencia: drawSponsorRequirement(category, hasTitleSponsor),
        candidateCount: candidates.length,
        caveats: getCaveats(selected.sponsor),
        ressalvas: getCaveats(selected.sponsor).map((caveat) => caveat.type),
      });
    }

    return {
      success: true,
      marketResult: {
        team: { id: team.id, name: team.name, momentoComercial: team.momentoComercial },
        requestedProposalCount: proposalCount,
        proposals,
      },
    };
  }

  async createSponsorMarketReview(scuderiaId: string, input: SponsorMarketReviewInput) {
    const category = normalizeSponsorCategory(input.category);
    if (!category) return { success: false, message: 'Sponsor category is invalid' };

    const [team, sponsor, assigned, pending] = await Promise.all([
      queryOne<{ id: string }>('SELECT id FROM teams WHERE id = $1', [scuderiaId]),
      queryOne<{ id: string }>('SELECT id FROM sponsors WHERE id = $1', [input.sponsorId]),
      queryOne<{ id: string }>(
        'SELECT id FROM team_sponsors WHERE team_id = $1 AND sponsor_id = $2',
        [scuderiaId, input.sponsorId],
      ),
      queryOne<{ id: string }>(
        `SELECT id
         FROM sponsor_market_reviews
         WHERE team_id = $1
           AND sponsor_id = $2
           AND status = 'pending'`,
        [scuderiaId, input.sponsorId],
      ),
    ]);

    if (!team) return { success: false, message: 'Scuderia not found' };
    if (!sponsor) return { success: false, message: 'Sponsor not found' };
    if (assigned) return { success: false, message: 'Sponsor already assigned to scuderia' };
    if (pending) return { success: false, message: 'Sponsor proposal already under review' };

    const result = await query(
      `INSERT INTO sponsor_market_reviews (
        team_id,
        sponsor_id,
        category,
        initial_reward,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, 'pending', NOW())
      RETURNING id`,
      [scuderiaId, input.sponsorId, category, Math.max(0, Number(input.initialReward ?? 0))],
    );

    return { success: true, review: result.rows[0] };
  }

  async approveSponsorMarketReview(reviewId: string) {
    return transaction(async (client) => {
      const reviewResult = await client.query(
        `SELECT
          id,
          team_id,
          sponsor_id,
          category,
          initial_reward,
          status
         FROM sponsor_market_reviews
         WHERE id = $1
         FOR UPDATE`,
        [reviewId],
      );
      const review = reviewResult.rows[0];
      if (!review) return { success: false, message: 'Sponsor proposal not found' };
      if (review.status !== 'pending') return { success: false, message: 'Sponsor proposal already reviewed' };

      const result = await this.assignTeamSponsor(client, review.team_id, {
        sponsorId: review.sponsor_id,
        category: review.category,
        contractRacesRemaining: 12,
        initialReward: Number(review.initial_reward ?? 0),
        rewardPerRace: 0,
      });
      if (!result.success) return result;

      await client.query(
        `UPDATE sponsor_market_reviews
         SET status = 'approved',
             approved_at = NOW()
         WHERE id = $1`,
        [reviewId],
      );

      return { success: true, teamSponsor: result.teamSponsor };
    });
  }

  async declineSponsorMarketReview(reviewId: string) {
    const result = await query(
      `UPDATE sponsor_market_reviews
       SET status = 'cancelled'
       WHERE id = $1
         AND status = 'pending'
       RETURNING id`,
      [reviewId],
    );

    if (!result.rows[0]) {
      const existing = await queryOne<{ id: string }>(
        'SELECT id FROM sponsor_market_reviews WHERE id = $1',
        [reviewId],
      );
      return existing
        ? { success: false, message: 'Sponsor proposal already reviewed' }
        : { success: false, message: 'Sponsor proposal not found' };
    }

    return { success: true };
  }

  async addTeamSponsor(scuderiaId: string, input: TeamSponsorInput) {
    return transaction(async (client) => {
      return this.assignTeamSponsor(client, scuderiaId, input);
    });
  }

  async updateTeamSponsor(teamSponsorId: string, input: Omit<TeamSponsorInput, 'sponsorId'>) {
    const existing = await queryOne('SELECT team_id FROM team_sponsors WHERE id = $1', [teamSponsorId]);
    if (!existing) {
      return { success: false, message: 'Team sponsor not found' };
    }
    const occupiedSlots = await query(
      `SELECT slot_number
       FROM team_sponsors
       WHERE team_id = $1 AND category = $2 AND id <> $3
       ORDER BY slot_number ASC`,
      [existing.team_id, input.category, teamSponsorId],
    );
    if (occupiedSlots.rows.length >= SPONSOR_CATEGORY_LIMITS[input.category]) {
      return { success: false, message: 'Sponsor category is full' };
    }
    const usedSlots = new Set(occupiedSlots.rows.map((row) => Number(row.slot_number)));
    const slotNumber = Array.from({ length: SPONSOR_CATEGORY_LIMITS[input.category] }, (_, index) => index + 1)
      .find((slot) => !usedSlots.has(slot));

    return transaction(async (client) => {
      const result = await client.query(
        `UPDATE team_sponsors
         SET category = $1,
             slot_number = $2,
             contract_races_remaining = $3,
             initial_reward = $4,
             reward_per_race = $5,
             updated_at = NOW()
         WHERE id = $6
         RETURNING id`,
        [
          input.category,
          slotNumber,
          input.contractRacesRemaining,
          input.initialReward,
          input.rewardPerRace,
          teamSponsorId,
        ],
      );
      if (!result.rows[0]) return { success: false, message: 'Team sponsor not found' };

      await this.recalculateTeamSponsorIncome(client, existing.team_id);
      return { success: true };
    });
  }

  async removeTeamSponsor(teamSponsorId: string) {
    return transaction(async (client) => {
      const result = await client.query(
        'DELETE FROM team_sponsors WHERE id = $1 RETURNING id, team_id',
        [teamSponsorId],
      );
      if (!result.rows[0]) return { success: false, message: 'Team sponsor not found' };

      await this.recalculateTeamSponsorIncome(client, result.rows[0].team_id);
      return { success: true };
    });
  }

  private drawRaceMissionDifficulty(ambition: number, randomScore = Math.random()): RaceMissionDifficulty {
    const normalizedAmbition = Math.min(5, Math.max(0, Math.trunc(Number(ambition) || 0)));
    const weights = RACE_MISSION_DIFFICULTY_WEIGHTS[normalizedAmbition] ?? RACE_MISSION_DIFFICULTY_WEIGHTS[1];
    let cumulative = 0;
    for (const weight of weights) {
      cumulative += weight.chance;
      if (randomScore <= cumulative) return weight.difficulty;
    }
    return weights[weights.length - 1].difficulty;
  }

  private calculateRaceMissionReward(
    category: SponsorContractCategory,
    sponsor: { orcamento: number; ambicao: number; prestigio: number },
    difficulty: RaceMissionDifficulty,
  ) {
    const base = RACE_MISSION_BASES[category] ?? 0;
    const budgetMultiplier = RACE_MISSION_BUDGET_MULTIPLIERS[sponsor.orcamento] ?? 1;
    const ambitionMultiplier = RACE_MISSION_AMBITION_MULTIPLIERS[sponsor.ambicao] ?? 1;
    const prestigeMultiplier = RACE_MISSION_PRESTIGE_MULTIPLIERS[sponsor.prestigio] ?? 1;
    const difficultyMultiplier = RACE_MISSION_DIFFICULTY_MULTIPLIERS[difficulty];
    const value = base * budgetMultiplier * ambitionMultiplier * prestigeMultiplier * difficultyMultiplier;
    return {
      base,
      budgetMultiplier,
      ambitionMultiplier,
      prestigeMultiplier,
      difficultyMultiplier,
      reward: Math.round(value / 1000) * 1000,
    };
  }

  async generateRaceSponsorMissions(teamIds: string[]) {
    const uniqueTeamIds = Array.from(new Set(teamIds.filter(Boolean)));
    if (uniqueTeamIds.length === 0) {
      return { success: false, message: 'At least one scuderia must be selected' };
    }

    return transaction(async (client) => {
      const teams = await client.query(
        `SELECT id, name
         FROM teams
         WHERE id = ANY($1::uuid[])
         ORDER BY name ASC`,
        [uniqueTeamIds],
      );

      const contracts = await client.query(
        `SELECT
          ts.id AS team_sponsor_id,
          ts.team_id,
          ts.category,
          teams.name AS team_name,
          sponsors.id AS sponsor_id,
          sponsors.name AS sponsor_name,
          sponsors.orcamento,
          sponsors.ambicao,
          sponsors.prestigio
         FROM team_sponsors ts
         JOIN teams ON teams.id = ts.team_id
         JOIN sponsors ON sponsors.id = ts.sponsor_id
         WHERE ts.team_id = ANY($1::uuid[])
           AND ts.category IN ('title_sponsor', 'main_partner')
         ORDER BY teams.name ASC, CASE WHEN ts.category = 'title_sponsor' THEN 0 ELSE 1 END, ts.slot_number ASC`,
        [uniqueTeamIds],
      );

      await client.query(
        `DELETE FROM team_sponsor_race_missions
         WHERE generated_by = $1
           AND team_sponsor_id IN (
             SELECT id
             FROM team_sponsors
             WHERE team_id = ANY($2::uuid[])
               AND category IN ('title_sponsor', 'main_partner')
           )`,
        [RACE_MISSION_GENERATOR_ID, uniqueTeamIds],
      );

      type RaceMissionGenerationTeamResult = {
        team: { id: string; name: string };
        missions: Array<{
          sponsorId: string;
          sponsorName: string;
          category: SponsorContractCategory;
          difficulty: RaceMissionDifficulty;
          reward: number;
          missionId: string;
        }>;
        skipped: Array<{
          sponsorId: string;
          sponsorName: string;
          category: SponsorContractCategory;
        }>;
      };
      const results: RaceMissionGenerationTeamResult[] = teams.rows.map((team: any) => ({
        team: { id: team.id as string, name: team.name as string },
        missions: [],
        skipped: [],
      }));
      const resultByTeamId = new Map<string, RaceMissionGenerationTeamResult>(
        results.map((result) => [result.team.id, result]),
      );

      for (const contract of contracts.rows) {
        const category = contract.category as SponsorContractCategory;
        const chance = RACE_MISSION_GENERATION_CHANCES[category] ?? 0;
        const result = resultByTeamId.get(contract.team_id);
        if (!result) continue;

        if (Math.random() > chance) {
          result.skipped.push({
            sponsorId: contract.sponsor_id,
            sponsorName: contract.sponsor_name,
            category,
          });
          continue;
        }

        const difficulty = this.drawRaceMissionDifficulty(Number(contract.ambicao));
        const value = this.calculateRaceMissionReward(category, {
          orcamento: Number(contract.orcamento),
          ambicao: Number(contract.ambicao),
          prestigio: Number(contract.prestigio),
        }, difficulty);
        const title = `Race mission - ${contract.sponsor_name}`;
        const description = `Automatic race mission generated for ${contract.team_name}. Difficulty: ${difficulty}.`;
        const mission = await client.query(
          `INSERT INTO team_sponsor_race_missions (
            team_sponsor_id,
            title,
            description,
            reward,
            difficulty,
            generated_by
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id`,
          [
            contract.team_sponsor_id,
            title,
            description,
            value.reward,
            difficulty,
            RACE_MISSION_GENERATOR_ID,
          ],
        );

        result.missions.push({
          sponsorId: contract.sponsor_id,
          sponsorName: contract.sponsor_name,
          category,
          difficulty,
          reward: value.reward,
          missionId: mission.rows[0].id,
        });
      }

      return { success: true, raceMissionResults: results };
    });
  }

  async addSponsorMission(teamSponsorId: string, type: 'race' | 'season', input: SponsorMissionInput) {
    const result = type === 'race'
      ? await query(
        `INSERT INTO team_sponsor_race_missions (team_sponsor_id, title, description, reward)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [teamSponsorId, input.title, input.description ?? null, input.reward],
      )
      : await query(
        `INSERT INTO team_sponsor_season_missions (team_sponsor_id, title, description, reward, races_to_complete)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [teamSponsorId, input.title, input.description ?? null, input.reward, input.racesToComplete],
      );
    return { success: true, mission: result.rows[0] };
  }

  async updateSponsorMission(missionId: string, type: 'race' | 'season', input: SponsorMissionInput) {
    const result = type === 'race'
      ? await query(
        `UPDATE team_sponsor_race_missions
         SET title = $1, description = $2, reward = $3
         WHERE id = $4
         RETURNING id`,
        [input.title, input.description ?? null, input.reward, missionId],
      )
      : await query(
        `UPDATE team_sponsor_season_missions
         SET title = $1, description = $2, reward = $3, races_to_complete = $4
         WHERE id = $5
         RETURNING id`,
        [input.title, input.description ?? null, input.reward, input.racesToComplete, missionId],
      );
    return result.rows[0]
      ? { success: true }
      : { success: false, message: 'Sponsor mission not found' };
  }

  async removeSponsorMission(missionId: string, type: 'race' | 'season') {
    const table = type === 'race'
      ? 'team_sponsor_race_missions'
      : 'team_sponsor_season_missions';
    const result = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [missionId]);
    return result.rows[0]
      ? { success: true }
      : { success: false, message: 'Sponsor mission not found' };
  }

  async resolveSponsorMission(missionId: string, type: 'race' | 'season', outcome: 'success' | 'failure') {
    return transaction(async (client) => {
      const table = type === 'race'
        ? 'team_sponsor_race_missions'
        : 'team_sponsor_season_missions';
      const mission = await client.query(
        `SELECT
          m.id,
          m.title,
          m.reward,
          ts.team_id
         FROM ${table} m
         JOIN team_sponsors ts ON ts.id = m.team_sponsor_id
         WHERE m.id = $1`,
        [missionId],
      );
      const row = mission.rows[0];
      if (!row) return { success: false, message: 'Sponsor mission not found' };

      if (outcome === 'success') {
        await client.query(
          `UPDATE teams
           SET cash_total = cash_total + $1,
               updated_at = NOW()
           WHERE id = $2`,
          [row.reward, row.team_id],
        );
        await client.query(
          `INSERT INTO team_financial_history (
            team_id, amount, entry_type, reason, source
          ) VALUES ($1, $2, 'income', $3, 'sponsor')`,
          [row.team_id, row.reward, row.title],
        );
      } else {
        await client.query(
          `INSERT INTO team_financial_history (
            team_id, amount, entry_type, reason, source
          ) VALUES ($1, 0, 'expense', $2, 'sponsor')`,
          [row.team_id, `Failed mission ${row.title}`],
        );
      }

      await client.query(`DELETE FROM ${table} WHERE id = $1`, [missionId]);
      return { success: true };
    });
  }
}

export default new AdminService();
