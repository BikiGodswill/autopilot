import { createClient } from "@/lib/supabase/client";

export async function signUpWithPassword({ name, email, password }) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  return { data, error };
}

export async function signInWithPassword({ email, password }) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

export async function sendPasswordReset(email) {
  const supabase = createClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;
  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

export async function updatePassword(newPassword) {
  const supabase = createClient();
  return supabase.auth.updateUser({ password: newPassword });
}
