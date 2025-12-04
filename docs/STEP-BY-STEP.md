# 🚀 Feature Development Workflow: Full Stack CRUD

This step-by-step guide outlines the end-to-end process for implementing a new resource (CRUD functionality) in the application, from database migration to frontend page creation.

-----

## 1\. 💾 Data Layer Setup

The foundational step involves defining the database schema and running the migration.

  * **Create `.sql` Migration File**

      * **Location:** `migrations/XXX_description.sql`
      * Include table creation with appropriate **indexes**.
      * Use the UUID function for primary keys: `gen_random_uuid()`.
      * Add **soft delete support** with the column: `deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL`.

  * **Migrate the Database**

    ```bash
    sql-migrate up
    ```

-----

## 2\. 🤝 Shared Module Definitions (`src/shared`)

Define the data contracts and constants used by both the server (API) and the client (UI).

### 2.1 Entity and Enums (DB Mapping)

  * **Create Entity Interface (if applicable)**
      * **Location:** `src/shared/entities/<name>.entity.ts`
      * Define the interface to **match the database schema**.
      * Use **camelCase** for properties (database snake\_case will be mapped by the repository).
      * **Mandatory Fields:** `id: string`, `createdAt: Date`, `updatedAt: Date`, `deletedAt: Date | null`.
      * *Export from `src/shared/entities/index.ts`.*
  * **Create Enums (if applicable)**
      * **Location:** `src/shared/enums/<name>.enum.ts`
      * Define domain-specific enums (e.g., Status, Type).
      * *Export from `src/shared/enums/index.ts`.*

### 2.2 Request and Response Contracts (API Contract)

  * **Create Request Types**
      * **Location:** `src/shared/request/<name>.request.ts`
      * Define **`Create<Name>Request`** (required fields).
      * Define **`Update<Name>Request`** (optional fields).
      * Define **`Get<Names>Request`** (extending `PaginationRequest`).
      * *Export from `src/shared/request/index.ts`.*
  * **Create Response Types**
      * **Location:** `src/shared/response/<name>.response.ts`
      * Define **`<Name>Response`**. All date fields **MUST** be `string` (RFC3339 format).
      * Include populated relation fields (e.g., `relatedName?`).
      * *Export from `src/shared/response/index.ts`.*

### 2.3 Update Role-Based Access Control (RBAC)

  * **Update Access Permissions**
      * **Location:** `src/shared/enums/access_permission.enum.ts`
      * Add new granular permissions (e.g., **`CREATE_PRODUCT`**, **`MENU_PRODUCT`**, **`EDIT_PRODUCT`**).
  * **Update Role Mappings**
      * **Location:** `src/shared/rbac/rbac.ts`
      * Update the permissions array for the relevant user roles (`super_admin`, `admin`, etc.).

-----

## 3\. 🖥️ Server Implementation (Layered Architecture)

The backend follows a strict **three-tier architecture**. Each layer has isolated responsibilities.

### 3.1 Repository Layer (Data Access)

  * **Location:** `src/server/repositories/<name>.repository.ts`
  * **Role:** Handles direct communication with the database (SQL queries).
  * **Key Rules (CRITICAL):**
      * ALL methods **MUST accept `PoolClient` as the first parameter**.
      * Uses **client parameter** for ALL queries (NOT the global pool).
      * Uses **parameterized queries** to prevent SQL injection.
      * Implements **soft delete logic** (`WHERE deleted_at IS NULL` and `UPDATE SET deleted_at = NOW()`).
      * **❌ NO** business logic.
      * **❌ NO** transaction management (`BEGIN`/`COMMIT`/`ROLLBACK`).

### 3.2 Service Layer (Business Logic & Transactions)

  * **Location:** `src/server/services/<name>.service.ts`
  * **Role:** Contains all business rules, validation, and orchestrates repository calls within a transaction.
  * **Key Rules (CRITICAL):**
      * Every method **MUST implement the Transaction Pattern**:
        1.  Get client: `const client = await getDbClient()`
        2.  Start: `await client.query('BEGIN')`
        3.  Execute logic (passing `client` to repository methods)
        4.  Commit: `await client.query('COMMIT')` (on success)
        5.  Rollback: `await client.query('ROLLBACK')` (in catch block)
        6.  Release: `client.release()` (in finally block)
      * Throws **`AppError`** for business rule violations (e.g., "User not found," "Insufficient inventory").
      * **❌ NO** SQL queries (except transaction commands).
      * **❌ NO** HTTP handling.

### 3.3 Handler Layer (HTTP)

  * **Location:** `src/server/handlers/<name>.handler.ts`
  * **Role:** Handles all HTTP protocol concerns (request/response).
  * **Key Rules (CRITICAL):**
      * Parses **request body** and **query parameters** (HTTP concerns only).
      * **Calls service methods** (the only layer that calls Service).
      * Formats and returns **HTTP responses** (e.g., `NextResponse.json`).
      * Handles errors and maps them to proper **HTTP status codes** (e.g., mapping `AppError` to 404/400).
      * **❌ NO** business logic or validation.
      * **❌ NO** database operations.

### 3.4 API Routes (Next.js App Router)

  * **List/Create:** `src/app/(private)/api/<names>/route.ts`
      * `GET` calls `handler.getNames(request)`
      * `POST` calls `handler.createName(request)`
  * **Detail/Update/Delete:** `src/app/(private)/api/<names>/[id]/route.ts`
      * `GET` calls `handler.getName(request, params.id)`
      * `PUT` calls `handler.updateName(request, params.id)`
      * `DELETE` calls `handler.deleteName(request, params.id)`

-----

## 4\. 🎨 Client Implementation (UI)

Implement the pages and link them to the API endpoints using client architecture patterns.

### 4.1 Create Page Components (`src/client/pages/<domain>`)

Always aim to use the generic templates for consistency and reduced boilerplate.

| Page Type | Goal | Recommended Approach |
| :--- | :--- | :--- |
| **List View** | Display paginated, searchable data with CRUD actions. | Use **`ListPageTemplate`** from `@/client/template`. Configure columns, permissions, and API endpoint. |
| **Form View** | Handle Create/Edit logic, validation, and submission. | Use **`FormPageTemplate`** from `@/client/template`. Configure fields, validation function, and data transformers. |
| **Custom View** | For complex dashboards, reports, or unique workflows. | **Custom Implementation:** Use `usePagination` (if needed), API helpers (`fetchById`, `createResource`), and custom layout/components. |

### 4.2 Create App Routes (`src/app/(protected)/<names>`)

Routes handle only navigation flow, linking the client pages to the URL structure.

  * **List Route:** `src/app/(protected)/<names>/page.tsx`
  * **Create Route:** `src/app/(protected)/<names>/create/page.tsx`
  * **Edit Route:** `src/app/(protected)/<names>/[id]/edit/page.tsx`

The pages accept callbacks (e.g., `onCreate`, `onEdit`) which the route component wires up using `useRouter` to navigate.

### 4.3 Update Sidebar Navigation

  * **Location:** `src/client/layouts/navigation.json`
  * Add the new entry so users can access the page.