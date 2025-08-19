import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Types for our Supabase tables
interface Profile {
  id: string;
  email: string;
  created_at: string;
}

interface UserSetting {
  id: string;
  user_id: string;
  name: string;
  value: string;
  created_at: string;
  updated_at: string;
}

interface ApiKey {
  id: string;
  user_id: string;
  provider: string;
  key_ciphertext: string;
  created_at: string;
  updated_at: string;
}

interface ChatId {
  id: string;
  user_id: string;
  chat_id: string;
  created_at: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

// Settings management functions
export async function getUserSetting(userId: string, settingName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('value')
    .eq('user_id', userId)
    .eq('name', settingName)
    .single();

  if (error) {
    console.error('Error fetching user setting:', error);
    return null;
  }

  return data?.value || null;
}

export async function setUserSetting(userId: string, settingName: string, value: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      name: settingName,
      value,
    }, {
      onConflict: 'user_id,name',
    });

  if (error) {
    console.error('Error setting user setting:', error);
    return false;
  }

  return true;
}

// API key management functions
export async function storeApiKey(userId: string, provider: string, keyCiphertext: string): Promise<boolean> {
  const { error } = await supabase
    .from('api_keys')
    .upsert({
      user_id: userId,
      provider,
      key_ciphertext: keyCiphertext,
    }, {
      onConflict: 'user_id,provider',
    });

  if (error) {
    console.error('Error storing API key:', error);
    return false;
  }

  return true;
}

// GitHub token management functions
export async function storeGitHubToken(userId: string, tokenCiphertext: string): Promise<boolean> {
  return await storeApiKey(userId, 'github', tokenCiphertext);
}

export async function getGitHubToken(userId: string): Promise<string | null> {
  return await getApiKey(userId, 'github');
}

export async function deleteGitHubToken(userId: string): Promise<boolean> {
  return await deleteApiKey(userId, 'github');
}

export async function getApiKey(userId: string, provider: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('key_ciphertext')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single();

  if (error) {
    console.error('Error fetching API key:', error);
    return null;
  }

  return data?.key_ciphertext || null;
}

export async function deleteApiKey(userId: string, provider: string): Promise<boolean> {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider);

  if (error) {
    console.error('Error deleting API key:', error);
    return false;
  }

  return true;
}

// Chat ID management functions
export async function linkChatIdToUser(userId: string, chatId: string): Promise<boolean> {
  const { error } = await supabase.from('chat_ids').insert({
    user_id: userId,
    chat_id: chatId,
  });

  if (error) {
    console.error('Error linking chat ID to user:', error);
    return false;
  }

  return true;
}

export async function getUserChatIds(userId: string): Promise<string[] | null> {
  const { data, error } = await supabase
    .from('chat_ids')
    .select('chat_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user chat IDs:', error);
    return null;
  }

  return data?.map((item: any) => item.chat_id) || null;
}

export async function deleteUserChatId(userId: string, chatId: string): Promise<boolean> {
  const { error } = await supabase
    .from('chat_ids')
    .delete()
    .eq('user_id', userId)
    .eq('chat_id', chatId);

  if (error) {
    console.error('Error deleting user chat ID:', error);
    return false;
  }

  return true;
}

// Profile management functions
export async function createProfile(userId: string, email: string): Promise<boolean> {
  const { error } = await supabase.from('profiles').insert({
    id: userId,
    email,
  });

  if (error) {
    console.error('Error creating profile:', error);
    return false;
  }

  return true;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export default supabase;
