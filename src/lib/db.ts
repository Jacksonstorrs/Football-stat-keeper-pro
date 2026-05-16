import postgres from 'postgres'

// Note: Direct database connections from the frontend are generally discouraged for security.
// The Supabase client in src/integrations/supabase/client.ts is the recommended way to interact with your database in this React app.
const connectionString = import.meta.env.VITE_DATABASE_URL
const sql = postgres(connectionString)

export default sql