export interface User {
  id_utilisateur: number;
  prenom: string;
  nom: string;
  login: string;
  email: string;
  role: UserRole;
  structure: string;
  actif: boolean;
  provinces?: string[]; // New field: list of provinces for the user
  communes?: string[];  // New field: list of communes for the user
}

export type UserRole = 'Admin' | 'Coordinateur' | 'Opérateur' | 'Observateur';

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface CreateUserRequest {
  prenom: string;
  nom: string;
  login: string;
  email: string;
  password: string;
  role: UserRole;
  structure: string;
  actif?: boolean;
  provinces?: string[]; // optional when creating a user
  communes?: string[];  // optional when creating a user
}

// Authentication interfaces
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ProfileUpdateRequest {
  prenom: string;
  nom: string;
  login: string;
  email: string;
  structure: string;
  provinces?: string[]; // allow updating provinces in profile
  communes?: string[];  // allow updating communes in profile
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  token?: string; // Optional token field for login changes
}