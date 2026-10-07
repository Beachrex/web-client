import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { isProductionSite } from '@/lib/utils/environment';

/**
 * Pure unit tests for the production-site check that drives
 * robots.txt, the X-Robots-Tag header and the robots meta tag.
 *
 * Guards against UAT being indexed (the old check only excluded "dev.").
 */
test.describe('isProductionSite', () => {
  test('production hosts are indexable', () => {
    expect(isProductionSite('https://beachrex.com')).toBe(true);
    expect(isProductionSite('https://www.beachrex.com/')).toBe(true);
    expect(isProductionSite('beachrex.com')).toBe(true);
  });

  test('non-production hosts are not indexable', () => {
    expect(isProductionSite('https://uat.beachrex.com')).toBe(false);
    expect(isProductionSite('https://dev.beachrex.com')).toBe(false);
    expect(isProductionSite('http://localhost:3000')).toBe(false);
    expect(isProductionSite('https://beachrex.com.example.org')).toBe(false);
    expect(isProductionSite('')).toBe(false);
    expect(isProductionSite(undefined)).toBe(false);
  });

  test('next.config.js host list stays in sync', () => {
    const config = readFileSync(join(process.cwd(), 'next.config.js'), 'utf8');
    const helper = readFileSync(join(process.cwd(), 'src', 'lib', 'utils', 'environment.ts'), 'utf8');
    const hosts = (src: string) =>
      /PRODUCTION_HOSTS = \[([^\]]*)\]/.exec(src)?.[1]?.replace(/['"\s]/g, '');
    expect(hosts(config)).toBeTruthy();
    expect(hosts(config)).toBe(hosts(helper));
  });
});
