import test from 'node:test';
import assert from 'node:assert/strict';

// Helper simulator for browser theme resolution
function resolveThemePreference({
  localStorageTheme,
  cookieTheme,
  systemPrefersDark,
}: {
  localStorageTheme?: string | null;
  cookieTheme?: string | null;
  systemPrefersDark: boolean;
}): { stored: 'system' | 'light' | 'dark'; resolved: 'light' | 'dark' } {
  let stored: 'system' | 'light' | 'dark' = 'system';

  if (localStorageTheme === 'light' || localStorageTheme === 'dark' || localStorageTheme === 'system') {
    stored = localStorageTheme;
  } else if (cookieTheme === 'light' || cookieTheme === 'dark' || cookieTheme === 'system') {
    stored = cookieTheme;
  }

  const resolved: 'light' | 'dark' =
    stored === 'dark' ? 'dark' : stored === 'light' ? 'light' : systemPrefersDark ? 'dark' : 'light';

  return { stored, resolved };
}

test('Theme Session: Restores explicit dark mode from localStorage across sessions', () => {
  const result = resolveThemePreference({
    localStorageTheme: 'dark',
    systemPrefersDark: false,
  });
  assert.equal(result.stored, 'dark');
  assert.equal(result.resolved, 'dark');
});

test('Theme Session: Restores explicit light mode from localStorage', () => {
  const result = resolveThemePreference({
    localStorageTheme: 'light',
    systemPrefersDark: true,
  });
  assert.equal(result.stored, 'light');
  assert.equal(result.resolved, 'light');
});

test('Theme Session: Respects OS system dark mode preference when set to system', () => {
  const darkResult = resolveThemePreference({
    localStorageTheme: 'system',
    systemPrefersDark: true,
  });
  assert.equal(darkResult.stored, 'system');
  assert.equal(darkResult.resolved, 'dark');

  const lightResult = resolveThemePreference({
    localStorageTheme: 'system',
    systemPrefersDark: false,
  });
  assert.equal(lightResult.stored, 'system');
  assert.equal(lightResult.resolved, 'light');
});

test('Theme Session: Falls back to cookie when localStorage is empty (SSR / cross-tab resumption)', () => {
  const result = resolveThemePreference({
    localStorageTheme: null,
    cookieTheme: 'dark',
    systemPrefersDark: false,
  });
  assert.equal(result.stored, 'dark');
  assert.equal(result.resolved, 'dark');
});
