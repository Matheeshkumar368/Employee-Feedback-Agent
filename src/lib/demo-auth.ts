export type DemoRole = "employee" | "admin";

export interface DemoUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: DemoRole;
  department: string;
  position: string;
  avatar?: string;
  password: string;
}

const demoUsers: DemoUser[] = [
  {
    id: "demo-admin-1",
    employeeId: "ADMIN001",
    name: "Alex Johnson",
    email: "admin@aurahr.com",
    role: "admin",
    department: "Human Resources",
    position: "HR Director",
    password: "password123",
  },
  {
    id: "demo-employee-1",
    employeeId: "EMP001",
    name: "Sarah Chen",
    email: "sarah@aurahr.com",
    role: "employee",
    department: "Engineering",
    position: "Senior Developer",
    password: "password123",
  },
  {
    id: "demo-employee-2",
    employeeId: "EMP002",
    name: "Marcus Williams",
    email: "marcus@aurahr.com",
    role: "employee",
    department: "Marketing",
    position: "Marketing Manager",
    password: "password123",
  },
  {
    id: "demo-employee-3",
    employeeId: "EMP003",
    name: "Priya Sharma",
    email: "priya@aurahr.com",
    role: "employee",
    department: "Design",
    position: "UI/UX Designer",
    password: "password123",
  },
  {
    id: "demo-employee-4",
    employeeId: "EMP004",
    name: "James Brown",
    email: "james@aurahr.com",
    role: "employee",
    department: "Sales",
    position: "Sales Executive",
    password: "password123",
  },
  {
    id: "demo-employee-5",
    employeeId: "EMP005",
    name: "Emma Davis",
    email: "emma@aurahr.com",
    role: "employee",
    department: "Finance",
    position: "Financial Analyst",
    password: "password123",
  },
];

export function authenticateDemoUser(employeeId: string, password: string, role?: DemoRole) {
  const normalizedId = employeeId.trim().toUpperCase();
  const user = demoUsers.find((candidate) => {
    const matchesRole = role ? candidate.role === role : true;
    return matchesRole && candidate.employeeId.toUpperCase() === normalizedId;
  });

  if (!user || user.password !== password) {
    return null;
  }

  return {
    id: user.id,
    employeeId: user.employeeId,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    position: user.position,
    avatar: user.avatar,
  };
}

export function getDemoCredentials() {
  return demoUsers.map(({ employeeId, role, password }) => ({ employeeId, role, password }));
}
