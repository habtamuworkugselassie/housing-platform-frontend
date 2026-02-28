# Migration Guide: Feature-First Architecture

This guide helps you migrate existing code to the new feature-first architecture.

## Quick Reference

### Import Changes

| Old Import | New Import |
|------------|------------|
| `@/stores/auth` | `@/features/auth` |
| `@/services/api` | `@/shared/api/client` |
| `@/views/LoginView.vue` | `@/features/auth/views/LoginView.vue` |
| `@/components/NavBar.vue` | `@/shared/components/NavBar.vue` |

## Step-by-Step Migration

### 1. Update Auth Imports

**Find:**
```typescript
import { useAuthStore } from '@/stores/auth'
```

**Replace with:**
```typescript
import { useAuthStore } from '@/features/auth'
```

### 2. Update API Imports

**Find:**
```typescript
import api from '@/services/api'
```

**Replace with:**
```typescript
import api from '@/shared/api/client'
// OR for feature-specific APIs:
import { propertyApi } from '@/features/property'
```

### 3. Update Component Imports

**Find:**
```typescript
import NavBar from '@/components/NavBar.vue'
```

**Replace with:**
```typescript
import { NavBar } from '@/shared/components'
```

### 4. Use Feature Composables

Instead of writing API calls directly in components, use feature composables:

**Before:**
```typescript
<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const properties = ref([])
const loading = ref(false)

const loadProperties = async () => {
  loading.value = true
  try {
    const response = await api.get('/properties')
    properties.value = response.data
  } finally {
    loading.value = false
  }
}

onMounted(() => loadProperties())
</script>
```

**After:**
```typescript
<script setup>
import { onMounted } from 'vue'
import { useProperties } from '@/features/property'

const { properties, loading, loadProperties } = useProperties()

onMounted(() => loadProperties())
</script>
```

### 5. Update Router Imports

**Before:**
```typescript
component: () => import('@/views/LoginView.vue')
```

**After:**
```typescript
component: () => import('@/features/auth/views/LoginView.vue')
```

## Migration Checklist

- [ ] Update all auth store imports
- [ ] Update all API client imports
- [ ] Update component imports
- [ ] Refactor views to use feature composables
- [ ] Update router to use feature-based imports
- [ ] Test all features
- [ ] Remove old files (after verification)

## Backward Compatibility

During migration, old imports are still supported via re-exports:

- `@/stores/auth` → re-exports from `@/features/auth`
- `@/services/api` → re-exports from `@/shared/api/client`

These will be removed in a future version.

## Need Help?

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.
