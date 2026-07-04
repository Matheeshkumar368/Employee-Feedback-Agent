"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Shield, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Link href="/login/admin" className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-strong rounded-3xl p-8 flex flex-col items-center text-center hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/30">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Admin Portal</h2>
              <p className="text-white/60 mb-6">
                Access HR dashboard, view analytics, and manage employee feedback.
              </p>
              <div className="flex items-center gap-2 text-blue-400 font-medium">
                <span>Login as Admin</span>
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="mt-4 text-xs text-white/40">
                Demo: ADMIN001 / password123
              </div>
            </motion.div>
          </Link>

          <Link href="/login/employee" className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-strong rounded-3xl p-8 flex flex-col items-center text-center hover:border-violet-500/30 transition-all duration-300"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-xl shadow-violet-500/30">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Employee Portal</h2>
              <p className="text-white/60 mb-6">
                Submit feedback, view AI analysis, and track your submissions.
              </p>
              <div className="flex items-center gap-2 text-violet-400 font-medium">
                <span>Login as Employee</span>
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="mt-4 text-xs text-white/40">
                Demo: EMP001 / password123
              </div>
            </motion.div>
          </Link>
        </motion.div>

        <div className="text-center mt-8">
          <Link href="/" className="text-white/50 hover:text-white text-sm transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}