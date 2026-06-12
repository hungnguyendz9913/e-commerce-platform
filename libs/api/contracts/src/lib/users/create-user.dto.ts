export interface CreateUserDto {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string | null;
}