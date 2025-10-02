import { FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DEMO_EMAIL } from "@/lib/supabase";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  loginError: string;
  loginAttempts: number;
  isRateLimited: boolean;
  rateLimitTimeLeft: number;
  isLoading: boolean;
  onSubmit: (e: FormEvent) => void;
  onForgotPassword: () => void;
  theme?: string;
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  loginError,
  loginAttempts,
  isRateLimited,
  rateLimitTimeLeft,
  isLoading,
  onSubmit,
  onForgotPassword,
  theme = 'dark'
}: LoginFormProps) {

  const handleRememberChange = (checked: boolean | string) => {
    const isChecked = checked === true;
    setRememberMe(isChecked);

    if (!isChecked) {
      localStorage.removeItem('auditready_remember_me');
      localStorage.removeItem('auditready_remember_email');
      localStorage.removeItem('auditready_remember_password');
    }
  };

  return (
    <>
      {loginError && (
        <div className={`rounded-lg p-3 text-sm flex items-start gap-2 border-2 ${theme === 'light' ? 'bg-red-50 border-red-300' : 'bg-red-900/20 border-red-700'}`}>
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className={`font-medium ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>
              Authentication Error
            </p>
            <p className={theme === 'light' ? 'text-red-600' : 'text-red-300'}>
              {loginError}
            </p>
            {loginAttempts > 0 && loginAttempts < 5 && !isRateLimited && (
              <p className={`mt-1 text-xs ${theme === 'light' ? 'text-red-500' : 'text-red-400'}`}>
                {5 - loginAttempts} attempts remaining before temporary lockout
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`h-12 border-2 transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100' : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/30'}`}
            placeholder={DEMO_EMAIL}
            required
            autoComplete="email"
            aria-label="Email address"
          />
        </div>

        <div className="space-y-3">
          <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
            Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`h-12 border-2 transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100' : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/30'}`}
            placeholder="••••••"
            required
            autoComplete="current-password"
            aria-label="Password"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={handleRememberChange}
              aria-label="Remember me"
            />
            <label
              htmlFor="remember"
              className={`text-sm cursor-pointer ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}
            >
              Remember me
            </label>
          </div>

          <Button
            type="button"
            variant="link"
            onClick={onForgotPassword}
            className={`text-sm px-0 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}
            aria-label="Reset password"
          >
            Forgot password?
          </Button>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-white font-semibold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isLoading || isRateLimited}
          aria-label={isRateLimited ? `Try again in ${rateLimitTimeLeft} seconds` : isLoading ? 'Signing in' : 'Sign in to account'}
        >
          {isRateLimited
            ? `Try again in ${rateLimitTimeLeft}s`
            : isLoading
              ? 'Signing in...'
              : 'Sign In'
          }
        </Button>
      </form>
    </>
  );
}
