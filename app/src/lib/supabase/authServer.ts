import { createClient } from "./serverClient";
import { mapSupabaseSession, Session } from "./supabaseSessionMapper";

const supabase = createClient();

export const getServerSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (data.session) {
    return mapSupabaseSession(data.session);
  }
  return null;
};
