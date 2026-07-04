"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Users, BarChart3, Shield, Sparkles, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
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

  if (user) return null;

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-xl">AuraHR</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
<Link href="/login">
               <Button variant="ghost" size="sm">Employee Login</Button>
             </Link>
             <Link href="/login">
               <Button size="sm">Admin Login</Button>
             </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered HR Intelligence</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Transform Employee
            <span className="gradient-text block">Feedback into Insights</span>
          </h1>
          
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            AuraHR uses advanced AI to analyze employee sentiment, identify workplace issues, 
            and generate actionable HR recommendations in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
<Link href="/login">
               <Button size="xl" className="group">
                 Employee Portal
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Button>
             </Link>
             <Link href="/login">
               <Button size="xl" variant="outline">
                 Admin Dashboard
               </Button>
             </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-2xl"
        >
          {[
            { value: "AI Powered", label: "Sentiment Analysis" },
            { value: "Real-time", label: "Feedback Processing" },
            { value: "Secure", label: "JWT Authentication" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything HR Needs
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              A complete platform for managing employee feedback with AI-driven insights.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Sentiment Analysis",
                description: "Google Gemini AI analyzes every feedback for emotion, tone, and intent automatically.",
                color: "from-violet-500 to-purple-600",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description: "Beautiful charts showing trends, department performance, and satisfaction scores.",
                color: "from-blue-500 to-indigo-600",
              },
              {
                icon: Shield,
                title: "Secure & Anonymous",
                description: "JWT authentication with role-based access and anonymous feedback options.",
                color: "from-emerald-500 to-teal-600",
              },
              {
                icon: Users,
                title: "Multi-role Access",
                description: "Separate portals for employees and admins with tailored experiences.",
                color: "from-orange-500 to-red-600",
              },
              {
                icon: Sparkles,
                title: "AI Chat Agent",
                description: "Ask HR questions, get summaries, and generate reports through natural conversation.",
                color: "from-pink-500 to-rose-600",
              },
              {
                icon: Star,
                title: "Smart Recommendations",
                description: "AI suggests specific HR actions based on feedback patterns and sentiment.",
                color: "from-yellow-500 to-amber-600",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:bg-white/8 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass rounded-3xl p-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your HR?
          </h2>
          <p className="text-white/50 mb-8">
            Connect MongoDB Atlas and add your Gemini API key to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login/employee">
              <Button size="lg">Employee Login</Button>
            </Link>
            <Link href="/login/admin">
              <Button size="lg" variant="outline">Admin Login</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span className="text-white/70 text-sm">AuraHR AI Employee Feedback Agent</span>
          </div>
          <p className="text-white/30 text-sm">Built with Next.js, MongoDB Atlas & Google Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}
