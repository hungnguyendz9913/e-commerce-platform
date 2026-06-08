export type CreateUserDto = {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
};
