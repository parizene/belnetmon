"use server";

import { createClient } from "./server";
import { mapSupabaseSession, Session } from "./supabaseSessionMapper";

const supabase = createClient();

export const signIn = async (
  email: string,
  password: string,
): Promise<Session | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  if (data.session) {
    return mapSupabaseSession(data.session);
  }
  return null;
};

export const signUp = async (
  email: string,
  password: string,
): Promise<Session | null> => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data.session) {
    return mapSupabaseSession(data.session);
  }
  return null;
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (data.session) {
    return mapSupabaseSession(data.session);
  }
  return null;
};
