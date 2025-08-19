import * as React from 'react';
import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Button } from '~/components/ui/Button';
import { updateProfile } from '~/lib/stores/profile';

export async function loader({ context }: LoaderFunctionArgs) {
  const envCF = (context as any)?.cloudflare?.env as any | undefined;
  const nodeEnv = (globalThis as any)?.process?.env as Record<string, string> | undefined;
  const SUPABASE_URL = envCF?.SUPABASE_URL ?? nodeEnv?.SUPABASE_URL ?? '';
  const SUPABASE_ANON_KEY = envCF?.SUPABASE_ANON_KEY ?? nodeEnv?.SUPABASE_ANON_KEY ?? '';

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Do not leak anything sensitive; anon key is safe but page should warn nicely
    return json({ envOk: false, SUPABASE_URL: '', SUPABASE_ANON_KEY: '' });
  }

  return json({ envOk: true, SUPABASE_URL, SUPABASE_ANON_KEY });
}

export default function AuthPage() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const supabase = React.useMemo<SupabaseClient | null>(() => {
    if (!data?.envOk || !data.SUPABASE_URL || !data.SUPABASE_ANON_KEY) {
      return null;
    }

    return createClient(data.SUPABASE_URL, data.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }, [data]);

  const firstNameFrom = (user: any): string => {
    const meta = user?.user_metadata ?? {};
    const fullName = (meta.full_name as string) || (meta.name as string) || '';
    const firstMeta = (meta.first_name as string) || (fullName ? fullName.split(' ')[0] : '');

    if (firstMeta) {
      return firstMeta;
    }

    const emailStr = (user?.email as string) || '';
    const prefix = emailStr.split('@')[0] || '';

    return prefix || 'User';
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!supabase) {
      setError('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
      return;
    }

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { data: result, error: err } = await supabase.auth.signInWithPassword({ email, password });

        if (err) {
          throw err;
        }

        const user = result.user;

        if (user) {
          const firstName = firstNameFrom(user);
          updateProfile({ username: firstName });
        }
      } else {
        const { data: result, error: err } = await supabase.auth.signUp({ email, password });

        if (err) {
          throw err;
        }

        const user = result.user;

        if (user) {
          const firstName = firstNameFrom(user);
          updateProfile({ username: firstName });
        }
      }

      navigate('/');
    } catch (err: any) {
      setError(err?.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-950 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Use your email and password with Supabase Auth.</p>

        {!data?.envOk && (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400">
            Missing SUPABASE_URL or SUPABASE_ANON_KEY. Configure your environment and reload.
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-800 dark:text-gray-200" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-800 dark:text-gray-200" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

          <Button type="submit" disabled={loading || !data?.envOk} className="w-full">
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
          </Button>
        </form>

        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button type="button" onClick={() => setMode('signup')} className="text-purple-600 hover:underline">
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('login')} className="text-purple-600 hover:underline">
                Login
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
