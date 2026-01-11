import 'dotenv/config';
import { pool } from '../lib/db';

async function fixUserAuth0Id() {
  try {
    console.log('Updating user auth0_id...');

    const result = await pool.query(
      `UPDATE users 
       SET auth0_id = $1 
       WHERE email = $2
       RETURNING id, auth0_id, email, name`,
      ['google-oauth2|106322462892151967917', 'robdcon@gmail.com']
    );

    if (result.rows.length > 0) {
      console.log('✅ User updated successfully:');
      console.log(result.rows[0]);
    } else {
      console.log('⚠️ No user found with email robdcon@gmail.com');

      // Check if user exists
      const checkUser = await pool.query(
        'SELECT id, auth0_id, email FROM users WHERE email = $1',
        ['robdcon@gmail.com']
      );

      if (checkUser.rows.length === 0) {
        console.log('User does not exist. Creating new user...');

        const createResult = await pool.query(
          `INSERT INTO users (auth0_id, email, name)
           VALUES ($1, $2, $3)
           RETURNING id, auth0_id, email, name`,
          ['google-oauth2|106322462892151967917', 'robdcon@gmail.com', 'Rob Connolly']
        );

        console.log('✅ User created:');
        console.log(createResult.rows[0]);
      }
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUserAuth0Id();
