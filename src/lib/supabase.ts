import { supabase as integrationClient } from "@/integrations/supabase/client";

// Export the verified client to ensure consistency across the application
export const supabase = integrationClient;