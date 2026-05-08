<x>Locate the existing useEffect that sets up syncToSupabase and real-time subscription (the one with localStorage.setItem and supabase.channel). After that block, add the following code:</x> 

```typescript
import { reconnectSupabase } from '@/lib/supabaseClient';

// Ensure Supabase client is reinitialized on component mount
useEffect(() => {
  reconnectSupabase();
}, []);