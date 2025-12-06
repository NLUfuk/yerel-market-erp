/**
 * Role Domain Entity
 */
export enum RoleName {
  SUPER_ADMIN = 'SuperAdmin',
  TENANT_ADMIN = 'TenantAdmin',
  CASHIER = 'Cashier',
  VIEWER = 'Viewer',
}

export class Role {
  constructor(
    public readonly id: string,
    public name: RoleName,
    public description?: string,
    public readonly createdAt: Date = new Date(),
  ) {
    this.validate();
  }

  private validate(): void {
    if (!Object.values(RoleName).includes(this.name)) {
      throw new Error(`Invalid role name: ${this.name}`);
    }
  }

  static createSuperAdmin(id: string): Role {
    return new Role(id, RoleName.SUPER_ADMIN, 'System administrator with full access');
  }

  static createTenantAdmin(id: string): Role {
    return new Role(id, RoleName.TENANT_ADMIN, 'Tenant administrator with full tenant access');
  }

  static createCashier(id: string): Role {
    return new Role(id, RoleName.CASHIER, 'Cashier with sales permissions');
  }

  static createViewer(id: string): Role {
    return new Role(id, RoleName.VIEWER, 'Viewer with read-only access');
  }
}

