"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, ArrowLeft, User, Lock, Loader2, BarChart3, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { getDemoCredentials } from "@/lib/demo-auth";

export default function AdminLoginPage() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const demoCredentials = getDemoCredentials().filter((cred) => cred.role === "admin");

  useEffect(() => {
    if (user) {
      router.push(user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim() || !password.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await login(adminId.trim(), password, "admin");
      toast({ title: "Welcome, Admin!", description: "Dashboard access granted", variant: "default" });
      router.push("/admin/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast({ title: "Access Denied", description: message, variant: "destructive" });
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto lg:mx-0 mb-4 shadow-xl shadow-blue-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
              <p className="text-white/60">Secure access to the HR dashboard and analytics.</p>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Secure Admin Portal
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="adminId">Admin ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    id="adminId"
                    type="text"
                    placeholder="e.g., ADMIN001"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
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
                    placeholder="Enter admin password"
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

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    Access Dashboard
                  </>
                )}
              </Button>
            </form>

            <p className="text-center mt-6 text-white/50 text-sm">
              Are you an employee?{" "}
              <Link href="/login/employee" className="text-violet-400 hover:text-violet-300 transition-colors">
                Employee Login
              </Link>
            </p>
          </div>

          <div className="glass rounded-3xl p-8 lg:p-10 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                <Sparkles className="w-4 h-4" />
                Demo admin access
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white">Sample credentials are ready</h2>
              <p className="mt-2 text-sm text-white/60">Use the admin demo account to inspect the dashboard without waiting for database setup.</p>
            </div>

            <div className="mt-6 space-y-3">
              {demoCredentials.map((credential) => (
                <button
                  key={credential.employeeId}
                  type="button"
                  onClick={() => {
                    setAdminId(credential.employeeId);
                    setPassword(credential.password);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-blue-400/50 hover:bg-blue-500/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{credential.employeeId}</p>
                      <p className="text-xs text-white/50">Password: {credential.password}</p>
                    </div>
                    <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-xs text-blue-300">Use</span>
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
