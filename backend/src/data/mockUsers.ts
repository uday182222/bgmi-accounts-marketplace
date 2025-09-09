// Mock user data - shared across controllers
// In a real app, this would be replaced with database operations

export interface MockUser {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const users: MockUser[] = [];

export const findUserById = (id: string): MockUser | undefined => {
  return users.find(u => u.id === id);
};

export const findUserByEmail = (email: string): MockUser | undefined => {
  return users.find(u => u.email === email);
};

export const addUser = (user: MockUser): void => {
  users.push(user);
};

export const updateUser = (id: string, updates: Partial<MockUser>): MockUser | null => {
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return null;
  }
  
  const existingUser = users[userIndex];
  if (!existingUser) {
    return null;
  }
  
  users[userIndex] = {
    id: existingUser.id,
    username: existingUser.username,
    email: existingUser.email,
    password: existingUser.password,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName,
    phone: existingUser.phone,
    role: existingUser.role,
    isVerified: existingUser.isVerified,
    createdAt: existingUser.createdAt,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return users[userIndex];
};

export const deleteUser = (id: string): boolean => {
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return false;
  }
  
  users.splice(userIndex, 1);
  return true;
};
