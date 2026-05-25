import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured. Some features will be unavailable.');
    return null as any;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
})();

// User management
export async function createUser(username: string, tasteProfile: string[]): Promise<string> {
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, taste_profile: tasteProfile }])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  return data.id;
}

export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error);
  }

  return data;
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const user = await getUserByUsername(username);
  return !!user;
}

// Session logging
export async function createSession(
  userAId: string,
  userBId: string,
  chapterId: string
): Promise<string> {
  const { data, error } = await supabase
    .from('sessions')
    .insert([{ user_a: userAId, user_b: userBId, chapter_id: chapterId }])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }

  return data.id;
}

export async function endSession(
  sessionId: string,
  outcome: 'skip' | 'save' | 'complete'
): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update({ ended_at: new Date(), outcome })
    .eq('id', sessionId);

  if (error) {
    console.error('Error ending session:', error);
    throw error;
  }
}

// Saved contacts
export async function saveContact(userId: string, contactId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_contacts')
    .insert([{ user_id: userId, contact_id: contactId }]);

  if (error) {
    console.error('Error saving contact:', error);
    throw error;
  }
}

export async function getSavedContacts(userId: string) {
  const { data, error } = await supabase
    .from('saved_contacts')
    .select('contact_id, users(username)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching saved contacts:', error);
    throw error;
  }

  return data;
}