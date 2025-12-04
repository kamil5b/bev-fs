This is a comprehensive guide to your shared module structure. No significant refactoring is needed here, as the content is **purely descriptive of types and interfaces**, making it entirely **framework-agnostic** and compatible with both the original React/Next.js environment and the refactored Bun/Vue 3 stack.

The only changes required are minor language adjustments to acknowledge that the module is used by the client/server structures detailed in the previous responses.

## ✅ Shared Module Guide (Framework-Agnostic)

This folder contains all shared types, interfaces, entities, enums, and configurations used across both **client (Vue 3)** and **server (Bun/PostgreSQL)** code in the application.

-----

## 📁 Structure

```
shared/
├── entities/          # Database entity interfaces
├── enums/            # Application enums
├── rbac/             # Role-Based Access Control
├── request/          # API request types
├── response/         # API response types
└── index.ts          # Main export file
```

-----

## 📂 Folders

### `entities/` 🤝

Database entity interfaces that match the **PostgreSQL schema** used by the **Server Repository Layer**. They ensure type safety when mapping database rows to application objects.

**Files:**

  - `user.entity.ts` - User entity with roles
  - `customer.entity.ts` - Customer entity
  - `product.entity.ts` - Product entity with types and units
  - `unit_quantity.entity.ts` - Unit quantity entity
  - `tax.entity.ts` - Tax entity
  - `inventory_history.entity.ts` - Inventory history entity
  - `transaction.entity.ts` - Transaction entity (buy/sell)
  - `transaction_item.entity.ts` - Transaction item entity
  - `discount.entity.ts` - Discount entity
  - `payment.entity.ts` - Payment entity
  - `payment_detail.entity.ts` - Payment detail entity

### `enums/` 🔢

Application-wide enumerations organized by domain, ensuring constants are consistent across the **Server Services** and **Client Views**.

**Files:**

  - `user.enum.ts` - **UserRole** enum (`super_admin`, `admin`, `warehouse_manager`, `cashier`, `finance`)
  - `access_permission.enum.ts` - **AccessPermission** enum (granular permissions)
  - `product.enum.ts` - **ProductType** enum (`raw_material`, `finished_goods`, `service`)
  - `transaction.enum.ts` - **TransactionType**, **TransactionStatus** enums
  - `payment.enum.ts` - **PaymentType**, **PaymentStatus** enums
  - `discount.enum.ts` - **DiscountType** enum

### `rbac/` 🛡️

**Role-Based Access Control** configuration and permissions used by:

1.  **Server Middleware**: To enforce access rights on API endpoints.
2.  **Client Composables**: To conditionally render UI elements based on the user's role.

**Files:**

  - `rbac.ts` - **RBACPermission** interface and **RBACPermissions** array mapping roles to permissions

### `request/` ➡️

Type definitions for API request bodies and query parameters. These types are primarily used by the **Server Handler Layer** for parsing and validation, and by the **Client Helpers** for making type-safe API calls.

**Files (Core):**

  - `common.request.ts` - **PaginationRequest** (base for all list queries)
  - `user.request.ts` - `CreateUserRequest`, `UpdateUserRequest`, `GetUsersRequest`
  - `customer.request.ts` - `CreateCustomerRequest`, `UpdateCustomerRequest`, `GetCustomersRequest`
  - `product.request.ts` - `CreateProductRequest`, `UpdateProductRequest`, `GetProductsRequest`
  - `auth.request.ts` - `LoginRequest`, `RegisterRequest`, `ForgotPasswordRequest`, etc.

### `response/` ⬅️

Type definitions for API responses, ensuring the data returned by the **Server Handler** matches the expectations of the **Client Views and Components**.

**Files (Core):**

  - `common.response.ts` - **BaseResponse**, **PaginationMeta**, **PaginatedResponse**
  - `user.response.ts` - `UserResponse`
  - `customer.response.ts` - `CustomerResponse`
  - `product.response.ts` - `ProductResponse`
  - `auth.response.ts` - `LoginResponse`, `AuthTokenPayload`, `MeResponse`

-----

## 🛠️ Best Practices

1.  **One domain per file** - Keep related types together.
2.  **Use descriptive names** - Follow pattern: `{Domain}{Type}.{category}.ts`.
3.  **Export from index** - Always add exports to subfolder `index.ts`.
4.  **Extend common types** - Use `PaginationRequest`, `BaseResponse` as a base.
5.  **Keep it pure** - **No business logic or functions**, only type definitions.
6.  **Use enums for constants** - Avoid magic strings.

-----

## 📝 Common Patterns

| Pattern | Description | Server Usage | Client Usage |
| :--- | :--- | :--- | :--- |
| **Entity** | Database structure interface. Dates as `Date`. | Repository layer (SQL mapping). | Never used directly on client. |
| **Response** | API contract interface. Dates as `string` (RFC3339). | Handler layer (formatting JSON). | Views, Composables (data consumption). |
| **Request** | API input interface. | Handler layer (parsing, validation). | Helpers (API submission). |
| **Pagination** | `PaginationRequest` base type. | Server Services (calculating LIMIT/OFFSET). | `usePagination` composable. |

### Example: Entity vs. Response Date Types (CRITICAL)

The differentiation of date types is crucial for type consistency:

| Type | Date Representation | Why? |
| :--- | :--- | :--- |
| **Entity** (`shared/entities`) | `Date` | Database clients (like `pg`) return native `Date` objects for date/timestamp columns. |
| **Response** (`shared/response`) | `string` | API payloads transmit dates as standard **ISO 8601 strings** (e.g., `"2025-11-28T16:12:22.000Z"`). The client is responsible for formatting these strings. |