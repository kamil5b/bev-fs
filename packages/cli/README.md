# create-bev-fs

A CLI tool for scaffolding full-stack applications with **Bun**, **Elysia**, **Vue 3**, and the **bev-fs framework**.

## Overview

`create-bev-fs` is an npm CLI package that generates pre-configured project templates, helping you quickly bootstrap full-stack applications with sensible defaults, optional Tailwind CSS integration, and a clean project structure.

## Installation

```bash
# Using npm
npm create bev-fs@latest my-app

# Or using npx directly
npx create-bev-fs@latest my-app
```

## Usage

### Interactive Mode

```bash
create-bev-fs my-awesome-app
```

The tool will prompt you to:

1. Select a template (base or full)
2. Choose whether to add Tailwind CSS

### Programmatic Mode

```bash
create-bev-fs my-app --template full --tailwind
```

**Options:**

- `--template <base|full>` — Choose template type (default: interactive)
- `--tailwind` — Enable Tailwind CSS setup (default: interactive)

## Templates

### Base Template

A minimal, starting-point template with:

- Basic Vue 3 client setup
- Simple server with middleware and routing
- Shared types and entities
- Essential dependencies only

**Best for:** Learning, minimal projects, or custom setups

### Full Template

A feature-rich template with:

- Complete product management example
- File upload handling with progress tracking
- Database integration (SQLite via `store.ts`)
- Repository and service patterns
- File storage gateway
- Handler layer examples
- Two client variants:
  - Standard Bootstrap-based UI
  - Tailwind CSS version

**Best for:** Production applications, following best practices

## Tailwind CSS Integration

When Tailwind CSS is selected during setup, the CLI:

- Installs Tailwind dependencies
- Generates `tailwind.config.js` and `postcss.config.js`
- Creates `index.css` with Tailwind directives
- Configures your build process for optimal output
- Automatically consolidates shared client logic (`composables`, `pages`, `router`) from `client-shared/`

The generated project uses the `client-tailwind/` variant with Tailwind-styled components while sharing all business logic with the vanilla CSS variant.

## Project Structure

After scaffolding, you'll have:

```
my-app/
├── src/
│   ├── client/              # Vue 3 frontend (vanilla CSS styling)
│   │   ├── App.vue          # Vanilla CSS root component
│   │   └── components/      # Reusable Vue components (styled)
│   ├── client-shared/       # Shared client logic (auto-merged by CLI)
│   │   ├── router/          # Directory-based routes
│   │   ├── components/      # Reusable Vue components
│   │   ├── composables/     # Vue composables (business logic)
│   │   ├── pages/           # Page components
│   │   ├── main.ts          # Vue entry point
│   │   └── index.html       # HTML template
│   ├── client-tailwind/     # Tailwind CSS variant (if selected)
│   │   ├── App.vue          # Tailwind root component
│   │   ├── index.css        # Tailwind configuration
│   │   └── components/      # Reusable Vue components (Tailwind styled)
│   ├── server/              # Elysia backend
│   │   ├── router/          # API endpoints
│   │   ├── handler/         # Request handlers
│   │   ├── service/         # Business logic
│   │   ├── repository/      # Data access layer
│   │   ├── middleware.ts    # Express-like middleware
│   │   └── index.ts         # Server entry
│   └── shared/              # Shared types & utilities
├── package.json
├── tsconfig.json
├── vite.config.ts           # Vite configuration
├── bunfig.toml              # Bun configuration
├── .env.example             # Environment template
└── GUIDE.md                 # Framework documentation
```

**Note:** The `client-shared/` directory contains shared logic that is automatically merged into the active client variant (`client/` or `client-tailwind/`) by the CLI during project setup. This eliminates duplication while allowing each styling variant to maintain its own UI components.

## Getting Started

After scaffolding:

```bash
cd my-app
bun install
bun run dev
```

Your app will be available at `http://localhost:5173` (Vite dev server) with auto-reload.

## Development Commands

Inside your scaffolded project:

```bash
# Start development server with hot reload
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Type checking
bunx tsc --noEmit
```

## What's bev-fs?

The generated projects use the **bev-fs framework**, which provides:

- **Directory-based routing** — File structure automatically becomes API/client routes
- **Type-safe integration** — Shared types between frontend and backend
- **Minimal overhead** — Zero-config framework with sensible defaults
- **Elysia server** — Fast, composable HTTP framework
- **Vue 3 + Vue Router** — Modern reactive UI framework
- **Bun runtime** — All-in-one JavaScript runtime for fast development

See `GUIDE.md` in your generated project for framework documentation.

## Architecture

The CLI uses a modular, DRY architecture:

### Template Structure

```
packages/cli/src/
├── shared-template/        # Shared configs (tsconfig, vite, bunfig)
├── base/                   # Minimal starter template
└── template/               # Full-featured template
    ├── client-shared/      # Shared client logic (composables, pages, router)
    ├── client/             # Vanilla CSS styling variant
    └── client-tailwind/    # Tailwind CSS styling variant
```

### Key Design Patterns

1. **Shared Configs** — `tsconfig.json`, `vite.config.ts`, and `bunfig-template.toml` are defined once in `shared-template/` and used by both `base/` and `template/` templates.

2. **Shared Client Logic** — Business logic (composables, pages, router, main.ts) is centralized in `client-shared/` to eliminate duplication between styling variants.

3. **Styling Variants** — Each styling variant (`client/` for vanilla CSS, `client-tailwind/` for Tailwind) contains only:
   - `App.vue` (root component with framework-specific styling)
   - `components/` (UI components with framework-specific styling)
   - `index.css` (styling configuration, if needed)

4. **Automatic Consolidation** — When generating a project, the CLI's `consolidateClientResources()` function automatically copies shared logic from `client-shared/` into the active variant, providing a complete working application.

### Build Process

```bash
npm run build
```

This:

1. Compiles TypeScript CLI source to `dist/`
2. Copies template directories (`base/`, `template/`, `shared-template/`) to `dist/`
3. Prepares distribution for npm publish

The wrapper script (`wrapper.js`) handles the `create-bev-fs` command entry point.

## Environment Configuration

Generated projects support `.env` and `.env.local` files for configuration:

```env
SERVER_PORT=3000
SERVER_ROUTER_DIR=src/server/router
SERVER_STATIC_DIR=dist/client
```

## Support

For issues or questions about:

- **CLI generation** — See this README
- **Framework usage** — Check `GUIDE.md` in your generated project
- **bev-fs framework** — See `packages/framework/FRAMEWORK.md`

## License

Part of the bev-fs full-stack system.
