# Internationalization (i18n) Setup

This project uses Vue I18n for internationalization support with English and Amharic locales.

## Installation

Install the required package:

```bash
npm install vue-i18n@9
```

## Usage

### In Components

Use the `$t()` function to translate text:

```vue
<template>
  <h1>{{ $t('common.appName') }}</h1>
  <button>{{ $t('common.save') }}</button>
</template>
```

### Programmatic Usage

```javascript
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const message = t('common.appName')
```

### Language Switching

The language switcher is available in the NavBar. Users can toggle between English (EN) and Amharic (አማ) by clicking the language button.

The selected language is saved in localStorage and persists across sessions.

## Translation Files

- `frontend/src/i18n/locales/en.json` - English translations
- `frontend/src/i18n/locales/am.json` - Amharic translations

## Adding New Translations

1. Add the key-value pair to both `en.json` and `am.json`
2. Use the key in your components with `$t('key.path')`

Example:
```json
// en.json
{
  "mySection": {
    "myKey": "My English Text"
  }
}

// am.json
{
  "mySection": {
    "myKey": "የእኔ አማርኛ ጽሑፍ"
  }
}
```

Then use: `{{ $t('mySection.myKey') }}`

## Current Translation Keys

- `common.*` - Common UI elements (buttons, labels, etc.)
- `nav.*` - Navigation items
- `auth.*` - Authentication related text
- `property.*` - Property related text
- `building.*` - Building related text
- `loan.*` - Loan application related text
- `banking.*` - Banking module text
- `dashboard.*` - Dashboard text
- `validation.*` - Form validation messages

## Notes

- The default locale is English (`en`)
- The locale preference is stored in localStorage
- All components should use `$t()` for user-facing text
- Keep translation keys organized by feature/module
