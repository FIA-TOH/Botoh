import { query, queryOne, insert, update } from '../config/database';
import { AuthRequest } from '../middleware/auth';

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

class GarageService {
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
