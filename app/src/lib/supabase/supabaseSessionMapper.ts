import { Session as SupabaseSession } from "@supabase/auth-js";

export type Session = {
  userId: string;
  email: string | null;
};

export const mapSupabaseSession = (
  session: SupabaseSession,
): Session => {
  return {
    userId: session.user.id,
    email: session.user.email || null,
  };
};
