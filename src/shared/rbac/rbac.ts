import { UserRole } from '../enums/user.enum';
import { AccessPermission } from '../enums/access_permission.enum';

export interface RBACPermission {
  role: UserRole;
  permissions: AccessPermission[];
}

export const RBACPermissions: RBACPermission[] = [
  {
    role: UserRole.SUPER_ADMIN,
    permissions: [
      AccessPermission.CREATE_USER,
      AccessPermission.READ_USER,
      AccessPermission.UPDATE_USER,
      AccessPermission.DELETE_USER,
      AccessPermission.MENU_USER,
      AccessPermission.CREATE_CUSTOMER,
      AccessPermission.READ_CUSTOMER,
      AccessPermission.UPDATE_CUSTOMER,
      AccessPermission.DELETE_CUSTOMER,
      AccessPermission.MENU_CUSTOMER,
      AccessPermission.CREATE_UNIT_QUANTITY,
      AccessPermission.READ_UNIT_QUANTITY,
      AccessPermission.UPDATE_UNIT_QUANTITY,
      AccessPermission.DELETE_UNIT_QUANTITY,
      AccessPermission.MENU_UNIT_QUANTITY,
      AccessPermission.CREATE_PRODUCT,
      AccessPermission.READ_PRODUCT,
      AccessPermission.UPDATE_PRODUCT,
      AccessPermission.DELETE_PRODUCT,
      AccessPermission.MENU_PRODUCT,
    ],
  },
  // Add other roles and permissions as needed
];
