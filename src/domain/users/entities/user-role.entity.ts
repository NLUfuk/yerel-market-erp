/**
 * UserRole Domain Entity (Join Table)
 * Represents the many-to-many relationship between User and Role
 */
export class UserRole {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
    public readonly assignedAt: Date = new Date(),
    public readonly assignedBy: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    if (!this.roleId || this.roleId.trim().length === 0) {
      throw new Error('Role ID is required');
    }
    if (!this.assignedBy || this.assignedBy.trim().length === 0) {
      throw new Error('Assigned by user ID is required');
    }
  }
}

