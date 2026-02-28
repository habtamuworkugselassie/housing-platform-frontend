# Frontend Architecture Guide

## 🏗️ Feature-First Architecture

This application follows a **feature-first (domain-driven)** architecture designed for scalability, team collaboration, and future micro-frontend extraction.

## 📁 Directory Structure

```
frontend/src/
├── features/                    # Feature modules (domain-driven)
│   ├── auth/                    # Authentication feature
│   │   ├── api/                 # API contracts & services
│   │   │   ├── auth.api.ts      # API client methods
│   │   │   └── auth.types.ts    # TypeScript types/interfaces
│   │   ├── composables/         # Business logic (Vue composables)
│   │   │   ├── useAuth.ts       # Auth store & logic
│   │   │   └── usePermissions.ts # Permission checks
│   │   ├── components/          # Feature-specific components
│   │   │   └── LoginForm.vue
│   │   ├── views/               # Feature views
│   │   │   ├── LoginView.vue
│   │   │   └── RegisterView.vue
│   │   └── index.ts             # Public API (barrel export)
│   │
│   ├── property/                # Property management feature
│   │   ├── api/
│   │   │   ├── property.api.ts
│   │   │   └── property.types.ts
│   │   ├── composables/
│   │   │   └── useProperties.ts
│   │   ├── components/
│   │   ├── views/
│   │   └── index.ts
│   │
│   ├── construction/            # Construction management feature
│   ├── banking/                  # Banking feature
│   ├── loan/                     # Loan management feature
│   │
│   └── shared/                  # Shared across features
│       ├── api/
│       │   └── client.ts         # Base API client
│       ├── components/           # Shared UI components
│       │   └── NavBar.vue
│       ├── composables/           # Shared composables
│       │   └── useApi.ts         # Generic API composable
│       ├── types/                 # Shared types
│       │   └── index.ts
│       └── utils/                # Shared utilities
│           └── currency.js
│
├── router/                       # Application routing
│   └── index.ts
├── stores/                       # Global stores (if needed)
│   └── locale.js
├── i18n/                         # Internationalization
└── main.ts                       # Application entry point
```

## 🧠 Core Principles

### 1. Feature-First (Domain-Driven)

**Why:** Features are organized by business domain, not file type. This makes it easy to:
- Find related code quickly
- Understand feature boundaries
- Extract features into micro-frontends later
- Assign features to teams

**Example:**
```typescript
// ✅ Good: Feature-first
import { useProperties, propertyApi } from '@/features/property'

// ❌ Bad: File-type-first
import { useProperties } from '@/composables/properties'
import { propertyApi } from '@/services/property'
```

### 2. Clear Separation of Concerns

Each feature has three clear layers:

#### **API Layer** (`api/`)
- **Purpose:** Contract between frontend and backend
- **Contains:** API client methods, TypeScript types/interfaces
- **Rules:**
  - No business logic
  - No UI components
  - Pure data fetching/transformation

```typescript
// features/property/api/property.api.ts
export const propertyApi = {
  getProperties: async (filters, page) => {
    const response = await api.get('/properties', { params: { ...filters, ...page } })
    return response.data
  }
}
```

#### **Business Logic Layer** (`composables/`)
- **Purpose:** Feature-specific business logic
- **Contains:** Vue composables, state management, validation
- **Rules:**
  - No direct API calls (use API layer)
  - No UI components
  - Reusable logic

```typescript
// features/property/composables/useProperties.ts
export function useProperties() {
  const properties = ref([])
  const loading = ref(false)
  
  const loadProperties = async () => {
    loading.value = true
    const data = await propertyApi.getProperties()
    properties.value = data
    loading.value = false
  }
  
  return { properties, loading, loadProperties }
}
```

#### **UI Layer** (`views/`, `components/`)
- **Purpose:** User interface
- **Contains:** Vue components, views
- **Rules:**
  - Use composables for logic
  - Use API layer only if needed
  - Keep components focused

```typescript
// features/property/views/PropertiesView.vue
<script setup>
import { useProperties } from '@/features/property'

const { properties, loading, loadProperties } = useProperties()
onMounted(() => loadProperties())
</script>
```

### 3. Public API Pattern (Barrel Exports)

Each feature exports a **public API** via `index.ts`. This:
- Hides internal implementation details
- Makes imports predictable
- Enables easy refactoring
- Prepares for micro-frontend extraction

```typescript
// features/property/index.ts
export { useProperties } from './composables/useProperties'
export type { PropertyResponse } from './api/property.types'
export { propertyApi } from './api/property.api'
export { default as PropertiesView } from './views/PropertiesView.vue'
```

**Usage:**
```typescript
// ✅ Always import from feature root
import { useProperties, PropertyResponse } from '@/features/property'

// ❌ Never import from internal paths
import { useProperties } from '@/features/property/composables/useProperties'
```

### 4. Low Coupling, High Cohesion

**Low Coupling:**
- Features don't import from each other's internals
- Features communicate through shared types/utilities
- Use dependency injection for cross-feature needs

**High Cohesion:**
- Related code lives together
- Feature boundaries are clear
- Easy to understand feature scope

### 5. Predictable Imports

**Pattern:** `@/features/{feature-name}`

```typescript
// Auth
import { useAuthStore, usePermissions } from '@/features/auth'

// Property
import { useProperties, PropertyResponse } from '@/features/property'

// Construction
import { useConstructionProjects } from '@/features/construction'

// Shared
import { useApi } from '@/shared/composables/useApi'
import type { PaginatedResponse } from '@/shared/types'
```

## 📋 Feature Template

When creating a new feature, follow this structure:

```
features/
└── {feature-name}/
    ├── api/
    │   ├── {feature}.api.ts      # API client
    │   └── {feature}.types.ts    # Types/interfaces
    ├── composables/
    │   └── use{Feature}.ts       # Business logic
    ├── components/                # Feature-specific components
    ├── views/                     # Feature views
    └── index.ts                   # Public API
```

## 🔄 Migration Guide

### Step 1: Update Imports

**Before:**
```typescript
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
```

**After:**
```typescript
import { useAuthStore } from '@/features/auth'
import api from '@/shared/api/client'
```

### Step 2: Use Feature Composables

**Before:**
```typescript
// In view component
const properties = ref([])
const loading = ref(false)

const loadProperties = async () => {
  loading.value = true
  const response = await api.get('/properties')
  properties.value = response.data
  loading.value = false
}
```

**After:**
```typescript
// In view component
import { useProperties } from '@/features/property'

const { properties, loading, loadProperties } = useProperties()
onMounted(() => loadProperties())
```

### Step 3: Update Router

**Before:**
```typescript
import LoginView from '@/views/LoginView.vue'
```

**After:**
```typescript
import { LoginView } from '@/features/auth'
```

## 🚀 Benefits

1. **Scalability:** Easy to add new features without affecting existing ones
2. **Team Collaboration:** Teams can work on features independently
3. **Maintainability:** Clear boundaries make code easier to understand
4. **Testability:** Business logic separated from UI
5. **Micro-frontend Ready:** Features can be extracted with minimal changes
6. **Type Safety:** Centralized types prevent inconsistencies

## 🎯 Best Practices

1. **Always import from feature root** (`@/features/{feature}`)
2. **Never import from internal paths** (`@/features/{feature}/composables/...`)
3. **Keep features independent** - no cross-feature imports
4. **Use shared utilities** for common functionality
5. **Document feature boundaries** in feature README
6. **Keep API layer thin** - just data fetching
7. **Keep composables focused** - single responsibility

## 🔮 Future: Micro-Frontends

When extracting features to micro-frontends:

1. Each feature becomes a separate package
2. Public API (`index.ts`) becomes the package entry point
3. Shared code moves to shared packages
4. Features communicate via events/contracts
5. Routing handled by main shell application

## 📚 Additional Resources

- [Vue Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Micro-frontends](https://micro-frontends.org/)
