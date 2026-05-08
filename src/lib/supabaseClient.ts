
Then modify src/lib/supabase.ts to use getSupabase:

＜dyad-write path="src/lib/supabase.ts" description="Update Supabase import to use the new client module"> ```typescript import { getSupabase } from './supabaseClient'; export const supabase = getSupabase(); export function reconnectSupabase() { getSupabase(); } ``` ＜/dyad-write>

Now add a hook to automatically reconnect when component mounts, e.g., in src/pages/Dashboard.tsx:

Add import { useSupabaseReconnect } from '@/hooks/useSupabaseReconnect'; and call it.

But maybe simpler: add a useEffect in Dashboard that calls reconnectSupabase on mount.

Let's create a hook useSupabaseReconnect:

＜dyad-write path="src/hooks/useSupabaseReconnect.ts" description="Hook that ensures Supabase client is reinitialized on component mount"> ```typescript import { useEffect } from 'react'; import { reconnectSupabase } from '@/lib/supabaseClient'; export function useSupabaseReconnect() { useEffect(() => { reconnectSupabase(); }, []); } ``` ＜/dyad-write>

Then in Dashboard component, import and call:

＜dyad-write path="src/pages/Dashboard.tsx" description="Add useSupabaseReconnect hook to ensure Supabase connection is re-established"> Find the useEffect that sets up game state and add:

import { useSupabaseReconnect } from '@/hooks/useSupabaseReconnect';

...

useEffect(() => { useSupabaseReconnect(); }, []); // Ensure Supabase reconnection

But we need to ensure we don't duplicate existing useEffect for syncing to Supabase. We can add after existing useEffect.

Let's locate existing useEffect in Dashboard: there is a useEffect for syncing to Supabase and real-time subscription. We'll add another useEffect after that.

Simplify: In Dashboard component, after the existing useEffect that sets up syncToSupabase and real-time subscription, add:

useEffect(() => { reconnectSupabase(); }, []); // Ensure Supabase reconnection

But we need to import reconnectSupabase.

Let's modify Dashboard.tsx accordingly.

But we need to ensure we don't break existing code. We'll add a new useEffect that calls reconnectSupabase.

Implementation:

＜dyad-write path="src/pages/Dashboard.tsx" description="Add a useEffect to reconnect Supabase"> Find the existing useEffect block that sets up syncToSupabase and real-time subscription. After that block, add:

import { reconnectSupabase } from '@/lib/supabaseClient';

...

useEffect(() => { reconnectSupabase(); }, []); // Ensure Supabase connection is re-established

But need to ensure imports.

Let's produce the modifications:

First, modify Dashboard.tsx import line to include reconnectSupabase:

Add import { reconnectSupabase } from '@/lib/supabaseClient';

Then add useEffect.

Let's write the exact code snippet:

＜dyad-write path="src/pages/Dashboard.tsx" description="Add reconnectSupabase useEffect"> <x>Find the existing useEffect that sets up syncToSupabase and real-time subscription (the one with localStorage.setItem and supabase.channel). After that block, insert the following code:</x> 

```typescript
import { reconnectSupabase } from '@/lib/supabaseClient';

// Ensure Supabase client is reinitialized on component mount
useEffect(() => {
  reconnectSupabase();
}, []);
```

But we need to ensure we don't duplicate import statements. Maybe we can add the import at the top of the file.

Let's add import at top:

＜dyad-write path="src/pages/Dashboard.tsx" description="Add import for reconnectSupabase"> <x>At the top of the file, add:</x> 

```typescript
import { reconnectSupabase } from '@/lib/supabaseClient';
```

But we need to be careful not to duplicate existing imports. Let's assume the file already has imports; we can add a new line.

Simplify: We'll just add the useEffect after existing effects.

Let's produce final answer with the necessary code changes.
</think><dyad-write path="src/lib/supabaseClient.ts" description="Create a dedicated Supabase client module with initialization and reconnection functions"> ```typescript import { createClient } from '@supabase/supabase-js'; const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string; const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string; let supabaseInstance: any = null; export function initSupabase() { supabaseInstance = createClient(supabaseUrl, supabaseAnonKey); // Optionally subscribe to auth state changes supabaseInstance.auth.onAuthStateChange((_event, session) => { // Session handling if needed }); return supabaseInstance; } export function getSupabase() { if (!supabaseInstance) { initSupabase(); } return supabaseInstance; } export function reconnectSupabase() { initSupabase(); } ```