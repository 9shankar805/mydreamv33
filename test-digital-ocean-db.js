import { Pool } from 'pg';

const DATABASE_URL = "postgresql://doadmin:show-password@private-db-postgresql-blr1-40729-do-user-23211066-0.d.db.ondigitalocean.com:25060/defaultdb?sslmode=require";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('Testing DigitalOcean PostgreSQL connection...');

try {
  const client = await pool.connect();
  console.log('✅ Successfully connected to DigitalOcean PostgreSQL database!');
  
  // Test basic query
  const result = await client.query('SELECT version();');
  console.log('Database version:', result.rows[0].version);
  
  // Check if tables exist
  const tablesResult = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  
  console.log(`Found ${tablesResult.rows.length} tables:`);
  tablesResult.rows.forEach(row => {
    console.log(`  - ${row.table_name}`);
  });
  
  client.release();
  await pool.end();
  
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  process.exit(1);
}