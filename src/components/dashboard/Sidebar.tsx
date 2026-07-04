"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  placeholder?: boolean;
}

interface SidebarProps {
  navItems: NavItem[];
  role: "admin" | "employee";
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  navItems,
  role,
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const accentColor =
    role === "admin"
      ? "from-blue-500 to-indigo-600"
      : "from-violet-500 to-purple-600";

  const accentText = role === "admin" ? "text-blue-400" : "text-violet-400";
  const accentBg =
    role === "admin"
      ? "bg-blue-500/10 border-blue-500/20"
      : "bg-violet-500/10 border-violet-500/20";
  const activeGlow =
    role === "admin" ? "shadow-blue-500/20" : "shadow-violet-500/20";

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full flex-col",
          "hidden lg:flex",
          "border-r border-white/[0.06] bg-[#0a0a1a]/90 backdrop-blur-2xl",
          "transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent
          navItems={navItems}
          pathname={pathname}
          user={user}
          role={role}
          isCollapsed={isCollapsed}
          accentColor={accentColor}
          accentText={accentText}
          accentBg={accentBg}
          activeGlow={activeGlow}
          logout={logout}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed top-0 left-0 z-50 h-full w-64 flex-col",
              "flex lg:hidden",
              "border-r border-white/[0.06] bg-[#0a0a1a]/95 backdrop-blur-2xl"
            )}
          >
            <SidebarContent
              navItems={navItems}
              pathname={pathname}
              user={user}
              role={role}
              isCollapsed={false}
              accentColor={accentColor}
              accentText={accentText}
              accentBg={accentBg}
              activeGlow={activeGlow}
              logout={logout}
              onClose={onClose}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

interface SidebarContentProps {
  navItems: NavItem[];
  pathname: string;
  user: { name: string; employeeId: string; department: string; position: string } | null;
  role: "admin" | "employee";
  isCollapsed: boolean;
  accentColor: string;
  accentText: string;
  accentBg: string;
  activeGlow: string;
  logout: () => void;
  onToggleCollapse?: () => void;
  onClose?: () => void;
}

function SidebarContent({
  navItems,
  pathname,
  user,
  role,
  isCollapsed,
  accentColor,
  accentText,
  accentBg,
  activeGlow,
  logout,
  onToggleCollapse,
  onClose,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]",
          isCollapsed && "justify-center px-0"
        )}
      >
        <div
          className={cn(
            `w-8 h-8 rounded-lg bg-gradient-to-br ${accentColor} flex items-center justify-center shadow-lg flex-shrink-0`,
            isCollapsed ? "shadow-none" : ""
          )}
        >
          <Brain className="w-4 h-4 text-white" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <span className="text-white font-bold text-base tracking-tight">
              AuraHR
            </span>
            <p className={cn("text-xs font-medium", accentText)}>
              {role === "admin" ? "Admin Panel" : "Employee Portal"}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.placeholder ? "#" : item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                isCollapsed && "justify-center px-2",
                isActive
                  ? `bg-gradient-to-r ${accentColor} text-white shadow-lg ${activeGlow}`
                  : "text-white/50 hover:text-white hover:bg-white/[0.06]",
                item.placeholder &&
                  "opacity-50 cursor-not-allowed pointer-events-none"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-transform duration-200",
                  !isActive && "group-hover:scale-110"
                )}
              />
              {!isCollapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!isCollapsed && item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-violet-500/20 text-violet-400"
                  )}
                >
                  {item.badge}
                </span>
              )}
              {!isCollapsed && item.placeholder && (
                <span className="text-[9px] font-semibold uppercase tracking-wide text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile at bottom */}
      <div className="border-t border-white/[0.06] p-3">
        {!isCollapsed ? (
          <div
            className={cn(
              "rounded-xl p-3 mb-2 border",
              accentBg
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accentColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
              >
                {user?.name?.charAt(0) ?? "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold truncate">
                  {user?.name}
                </p>
                <p className="text-white/40 text-[10px] truncate">
                  {user?.position}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accentColor} flex items-center justify-center text-white text-xs font-bold mx-auto mb-2`}
          >
            {user?.name?.charAt(0) ?? "U"}
          </div>
        )}

        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? "Sign out" : undefined}
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          {!isCollapsed && <span>Sign out</span>}
        </button>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[10px] text-white/20 hover:text-white/50 hover:bg-white/5 transition-all duration-200 mt-1"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <>
                <ChevronLeft className="w-3 h-3" />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
