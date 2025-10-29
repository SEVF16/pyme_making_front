import { ICreateUserDto, IUpdateUserDto, IUser } from "./user-interfaces";

export class User implements IUser {
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

  constructor(
    companyId: string,
    firstName: string,
    lastName: string,
    fullName: string,
    email: string,
    role: string,
    status: string,
    permissions: string,
    emailVerified: boolean,
    id?: string,
    password?: string,
    phone?: string,
    avatar?: string,
    lastLoginAt?: string,
    createdAt?: string,
    updatedAt?: string,
    sendWelcomeEmail?: boolean
  ) {
    this.id = id;
    this.companyId = "4e3657a9-31be-4af7-b1a8-a6380d3fb107";
    this.firstName = firstName;
    this.lastName = lastName;
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.avatar = avatar;
    this.role = role;
    this.status = status;
    this.permissions = permissions;
    this.emailVerified = emailVerified;
    this.lastLoginAt = lastLoginAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.sendWelcomeEmail = sendWelcomeEmail;
  }
  static userToCreateDto(user: IUser): ICreateUserDto {
    // Convertir permissions de string a string[]
    const permissionsArray = user.permissions ? 
      (typeof user.permissions === 'string' ? 
        user.permissions.split(',').map(p => p.trim()) : 
        [user.permissions]) : 
      [];

    return {
      companyId: "4e3657a9-31be-4af7-b1a8-a6380d3fb107",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password || '', // Requerido en DTO, por defecto vacío
      phone: user.phone,
      role: user.role,
      permissions: permissionsArray,
      sendWelcomeEmail: user.sendWelcomeEmail || false
    };
  }


}

export class CreateUserDto implements ICreateUserDto {
  readonly companyId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
  readonly phone?: string;
  readonly role: string;
  readonly permissions: string[];
  readonly sendWelcomeEmail?: boolean;

  constructor(data: {
    companyId: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role: string;
    permissions: string[];
    sendWelcomeEmail?: boolean;
  }) {
    this.companyId = "4e3657a9-31be-4af7-b1a8-a6380d3fb107";
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
    this.phone = data.phone;
    this.role = data.role;
    this.permissions = data.permissions;
    this.sendWelcomeEmail = data.sendWelcomeEmail;
  }

    /**
   * Convierte ICreateUserDto a IUser (para creación)
   * Genera los campos automáticos que no vienen en el DTO
   */
  static createDtoToUser(dto: ICreateUserDto): Omit<IUser, 'id'> {
    const timestamp = new Date().toISOString();
    
    return {
      companyId: "4e3657a9-31be-4af7-b1a8-a6380d3fb107",
      firstName: dto.firstName,
      lastName: dto.lastName,
      fullName: `${dto.firstName} ${dto.lastName}`.trim(),
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      avatar: '', // Valor por defecto
      role: dto.role,
      status: 'active', // Valor por defecto
      permissions: Array.isArray(dto.permissions) ? 
        dto.permissions.join(',') : 
        String(dto.permissions), // Convertir array a string
      emailVerified: false, // Valor por defecto
      lastLoginAt: undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
      sendWelcomeEmail: dto.sendWelcomeEmail || false
    };
  }

  static createToUpdateDto(createDto: ICreateUserDto): IUpdateUserDto {
    return {
      firstName: createDto.firstName,
      lastName: createDto.lastName,
      email: createDto.email,
      phone: createDto.phone,
      role: createDto.role,
      permissions: createDto.permissions,
      // status y emailVerified no vienen en createDto, se usarán valores por defecto
      status: 'active',
      emailVerified: false
    };
  }
}

export class UpdateUserDto implements IUpdateUserDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly role: string;
  readonly permissions: string[];
  readonly status?: string;
  readonly emailVerified?: boolean;

  constructor(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    permissions: string[];
    status?: string;
    emailVerified?: boolean;
  }) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.role = data.role;
    this.permissions = data.permissions;
    this.status = data.status;
    this.emailVerified = data.emailVerified;
  }

  /**
   * Convierte IUser a IUpdateUserDto para edición
   */
  static userToUpdateDto(user: IUser): IUpdateUserDto {
    // Convertir permissions de string a string[]
    const permissionsArray = user.permissions ? 
      (typeof user.permissions === 'string' ? 
        user.permissions.split(',').map(p => p.trim()) : 
        [user.permissions]) : 
      [];

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: permissionsArray,
      status: user.status,
      emailVerified: user.emailVerified
      // NOTA: No incluir companyId, password, sendWelcomeEmail
    };
  }

  /**
   * Actualiza un usuario existente con datos del DTO
   */
  static updateDtoToUser(dto: IUpdateUserDto, existingUser: IUser): IUser {
    return {
      ...existingUser,
      firstName: dto.firstName,
      lastName: dto.lastName,
      fullName: `${dto.firstName} ${dto.lastName}`.trim(),
      email: dto.email,
      phone: dto.phone,
      role: dto.role,
      permissions: Array.isArray(dto.permissions) ? 
        dto.permissions.join(',') : 
        String(dto.permissions),
      status: dto.status || existingUser.status,
      emailVerified: dto.emailVerified !== undefined ? dto.emailVerified : existingUser.emailVerified,
      updatedAt: new Date().toISOString()
    };
  }
}