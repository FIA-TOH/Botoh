import bcrypt from 'bcryptjs';
import { query, queryOne } from './database';

export interface SeedUser {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  money: number;
  experience_points: number;
  level: number;
  is_active: boolean;
  created_at: string;
}

class SeedService {
  // Create default admin user if not exists
  async createDefaultAdmin(): Promise<void> {
    try {
      const adminUsername = 'admin';
      const adminPassword = 'admin123';

      // Check if admin user already exists
      const existingAdmin = await queryOne(
        'SELECT id, username FROM users WHERE username = $1',
        [adminUsername]
      );

      if (existingAdmin) {
        console.log('✅ Admin user already exists:', adminUsername);
        return;
      }

      // Hash the admin password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

      // Create admin user
      const result = await query(
        `INSERT INTO users (
          username, 
          password_hash, 
          money, 
          created_at
        ) VALUES ($1, $2, $3, NOW()) 
        RETURNING id, username, money, created_at, password_hash`,
        [
          adminUsername,
          passwordHash,
          1000000.00 // 1M money for admin
        ]
      );

      const adminUser = result.rows[0];
      console.log('👤 Default admin user created:');
      console.log(`   Username: ${adminUsername}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   Money: ${adminUser.money}`);
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Created: ${adminUser.created_at}`);
      console.log('⚠️  Please change the default password in production!');

    } catch (error) {
      console.error('❌ Error creating default admin user:', error);
      throw error;
    }
  }

  // Create basic upgrades if they don't exist
  async createBasicUpgrades(): Promise<void> {
    try {
      const basicUpgrades = [
        {
          type: 'weather',
          name: 'Previsão do Tempo',
          description: 'Melhora precisão das previsões meteorológicas',
          level_max: 5,
          base_cost: 50000.00,
          effect_json: JSON.stringify({ accuracy_bonus: 0.1 })
        },
        {
          type: 'pitcrew',
          name: 'Equipe de Paddock',
          description: 'Reduz tempo de pit stop',
          level_max: 5,
          base_cost: 75000.00,
          effect_json: JSON.stringify({ pit_time_reduction: 0.15 })
        },
        {
          type: 'training',
          name: 'Academia de Pilotos',
          description: 'Melhora performance dos pilotos',
          level_max: 5,
          base_cost: 100000.00,
          effect_json: JSON.stringify({ performance_bonus: 0.05 })
        },
        {
          type: 'engine',
          name: 'Motor Turbo',
          description: 'Aumenta potência do motor',
          level_max: 5,
          base_cost: 150000.00,
          effect_json: JSON.stringify({ power_bonus: 0.08 })
        },
        {
          type: 'aerodynamics',
          name: 'Túnel de Vento',
          description: 'Melhora aerodinâmica',
          level_max: 5,
          base_cost: 125000.00,
          effect_json: JSON.stringify({ downforce_bonus: 0.06 })
        }
      ];

      for (const upgrade of basicUpgrades) {
        const existing = await queryOne(
          'SELECT id FROM upgrades WHERE type = $1',
          [upgrade.type]
        );

        if (!existing) {
          await query(
            `INSERT INTO upgrades (
              type, name, description, level_max, base_cost, effect_json, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [
              upgrade.type,
              upgrade.name,
              upgrade.description,
              upgrade.level_max,
              upgrade.base_cost,
              upgrade.effect_json
            ]
          );
          console.log(`🔧 Created upgrade: ${upgrade.name}`);
        }
      }

    } catch (error) {
      console.error('❌ Error creating basic upgrades:', error);
      throw error;
    }
  }

  // Run all seeds
  async runSeeds(): Promise<void> {
    console.log('🌱 Running database seeds...');
    
    try {
      await this.createDefaultAdmin();
      await this.createBasicUpgrades();
      console.log('✅ Database seeds completed successfully');
    } catch (error) {
      console.error('❌ Database seeds failed:', error);
      throw error;
    }
  }
}

export default new SeedService();
