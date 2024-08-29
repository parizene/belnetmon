import { createClient } from "./client";
import { mapSupabaseSession, Session } from "./supabaseSessionMapper";

const supabase = createClient();

export const onAuthStateChange = (
  callback: (session: Session | null) => void,
) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session ? mapSupabaseSession(session) : null);
  });

  return () => {
    subscription.unsubscribe();
  };
};
