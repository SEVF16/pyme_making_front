export interface IUser {
  id?: string;
  companyId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: string;
  permissions: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  sendWelcomeEmail?: boolean;
}


// También puedes crear una interfaz si lo prefieres
export interface ICreateUserDto {
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  permissions: string[];
  sendWelcomeEmail?: boolean;
}

export interface IUpdateUserDto extends Omit<ICreateUserDto, 'companyId' | 'password' | 'sendWelcomeEmail'> {
  status?: string;
  emailVerified?: boolean;
}