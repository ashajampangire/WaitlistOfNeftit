import { supabase } from './supabase'

async function initializeDatabase() {
  // Create waitlist table if it doesn't exist
  const { error: createTableError } = await supabase.rpc('create_waitlist_table')
  
  if (createTableError) {
    console.error('Error creating waitlist table:', createTableError)
    return
  }

  // Create the increment_referral_count function if it doesn't exist
  const { error: createFunctionError } = await supabase.rpc('create_increment_referral_count_function')
  
  if (createFunctionError) {
    console.error('Error creating increment_referral_count function:', createFunctionError)
    return
  }

  console.log('Database initialization completed successfully')
}

initializeDatabase()
