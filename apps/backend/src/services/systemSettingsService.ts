import { query, queryOne } from '../config/database';
import { GARAGE_FACILITY_ECONOMY } from '../config/facilityEconomy';

const FINANCIAL_SYSTEM_ENABLED_KEY = 'financial_system_enabled';

class SystemSettingsService {
  async isFinancialSystemEnabled(): Promise<boolean> {
    try {
      const setting = await queryOne<{ value: string }>(
        'SELECT value FROM system_settings WHERE key = $1',
        [FINANCIAL_SYSTEM_ENABLED_KEY],
      );

      if (!setting) return true;
      return setting.value !== 'false';
    } catch (error) {
      if ((error as { code?: string }).code === '42P01') return true;
      throw error;
    }
  }

  async setFinancialSystemEnabled(enabled: boolean): Promise<{ enabled: boolean }> {
    await query(
      `INSERT INTO system_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key)
       DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [FINANCIAL_SYSTEM_ENABLED_KEY, enabled ? 'true' : 'false'],
    );

    return { enabled };
  }

  getEffectiveFacilityLevel(level: number | null | undefined, financialSystemEnabled: boolean): number {
    if (!financialSystemEnabled) return GARAGE_FACILITY_ECONOMY.maxLevel;
    return Math.min(GARAGE_FACILITY_ECONOMY.maxLevel, Math.max(0, Number(level ?? 0)));
  }
}

export default new SystemSettingsService();
