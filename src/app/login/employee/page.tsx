"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Eye, EyeOff, ArrowLeft, User, Lock, Loader2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { getDemoCredentials } from "@/lib/demo-auth";

export default function EmployeeLoginPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const demoCredentials = getDemoCredentials().filter((cred) => cred.role === "employee");

  useEffect(() => {
    if (user) {
      router.push(user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard");
    }
    // Load remembered ID
    const savedId = localStorage.getItem("aurahr-remember-emp");
    if (savedId) {
      setEmployeeId(savedId);
      setRememberMe(true);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !password.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await login(employeeId.trim(), password, "employee");
      if (rememberMe) {
        localStorage.setItem("aurahr-remember-emp", employeeId.trim());
      } else {
        localStorage.removeItem("aurahr-remember-emp");
      }
      toast({ title: "Welcome back!", description: "Logged in successfully", variant: "default" });
      router.push("/employee/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast({ title: "Login Failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="glass-strong rounded-3xl p-8 lg:p-10">
<Link href="/login" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 text-sm transition-colors">
               <ArrowLeft className="w-4 h-4" />
               Back to login options
             </Link>

            <div className="text-center lg:text-left mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto lg:mx-0 mb-4 shadow-xl shadow-violet-500/30">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Employee Login</h1>
              <p className="text-white/60">Access your feedback portal and manage your submissions.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="e.g., EMP001"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="pl-10"
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-violet-500"
                  />
                  <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in to Portal"
                )}
              </Button>
            </form>

            <p className="text-center mt-6 text-white/50 text-sm">
              Are you an admin?{" "}
              <Link href="/login/admin" className="text-violet-400 hover:text-violet-300 transition-colors">
                Admin Login
              </Link>
            </p>
          </div>

          <div className="glass rounded-3xl p-8 lg:p-10 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-sm text-violet-300">
                <Sparkles className="w-4 h-4" />
                Demo access ready
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white">Sample login data is available</h2>
              <p className="mt-2 text-sm text-white/60">Use these credentials to preview the employee and admin experience instantly.</p>
            </div>

            <div className="mt-6 space-y-3">
              {demoCredentials.map((credential) => (
                <button
                  key={credential.employeeId}
                  type="button"
                  onClick={() => {
                    setEmployeeId(credential.employeeId);
                    setPassword(credential.password);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-violet-400/50 hover:bg-violet-500/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{credential.employeeId}</p>
                      <p className="text-xs text-white/50">Password: {credential.password}</p>
                    </div>
                    <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs text-violet-300">Use</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
