import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/utils/toast";
import { supabase } from "@/lib/supabase";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSupabaseConfigured: boolean;
  theme?: string;
}

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  isSupabaseConfigured,
  theme = 'dark'
}: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) {
          console.error("Password reset failed:", error);

          if (error.message.includes('User not found')) {
            toast.error("No account found with this email address");
          } else if (error.message.includes('Email rate limit exceeded')) {
            toast.error("Too many password reset attempts. Please try again later.");
          } else {
            toast.error(`Password reset failed: ${error.message}`);
          }
        } else {
          toast.success("Password reset email sent! Check your inbox and spam folder.");
          onOpenChange(false);
          setEmail("");
        }
      } else {
        // Demo mode
        console.log("Demo password reset for:", email);

        if (email === 'demo@auditready.com') {
          toast.success("Password reset email sent! (Demo mode - password remains: AuditReady@Demo2025!)");
        } else {
          toast.info("Password reset email sent (demo mode - check console for details)");
        }

        onOpenChange(false);
        setEmail("");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to send password reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            <Mail className="h-5 w-5" />
            Reset Password
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
              Enter your email address and we'll send you a secure password reset link.
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500' : 'bg-slate-700 border-slate-600 text-slate-100 focus:border-blue-500'}`}
              placeholder="Enter your email address"
              required
              autoComplete="email"
              aria-label="Email for password reset"
            />
            {!isSupabaseConfigured && (
              <p className={`text-xs ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                Demo mode: Password reset simulation only
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className={`flex-1 ${theme === 'light' ? 'border-slate-200 text-slate-600' : 'border-slate-600 text-slate-300'}`}
              aria-label="Cancel password reset"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              aria-label="Send password reset email"
            >
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
