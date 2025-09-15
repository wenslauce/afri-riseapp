# African Countries Module

This module provides a static list of all 54 African countries with their database IDs, names, and ISO codes.

## Purpose

The static list is used during user registration when users are not yet authenticated and cannot access the Supabase database. This solves the chicken-and-egg problem where:

1. Users need to select a country during registration
2. Country data is stored in the database
3. Database access requires authentication
4. But users aren't authenticated yet during registration

## Usage

```typescript
import { AFRICAN_COUNTRIES, getCountryById, getCountryByCode } from '@/lib/countries/african-countries';

// Get all countries
const countries = AFRICAN_COUNTRIES;

// Find country by ID
const country = getCountryById('7e2db0e4-9864-40a4-95e8-78e106f49344');

// Find country by code
const country = getCountryByCode('KE'); // Kenya
```

## Data Structure

Each country object contains:
- `id`: UUID from the Supabase database
- `name`: Full country name
- `code`: ISO 3166-1 alpha-2 country code

## Maintenance

When the database countries are updated, this static list should be updated accordingly to maintain consistency. The IDs must match exactly with the database records.

## Files

- `african-countries.ts`: Main module with country data and helper functions
- `README.md`: This documentation file
