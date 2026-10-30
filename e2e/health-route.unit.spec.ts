import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { GET, dynamic } from '@/app/api/health/route';

/**
 * /api/health is what the blue/green deploy waits for and probes (backend deploy/scripts/front-deploy.sh,
 * which reads `"color":"<blue|green>"` from the body). It must stay a cheap, uncached 200.
 */
test.describe('/api/health', () => {
  test('answers 200 JSON with the blue/green color, never cached', async () => {
    const before = process.env.BEACHREX_COLOR;
    process.env.BEACHREX_COLOR = 'green';
    try {
      const res = GET();
      expect(res.status).toBe(200);
      expect(res.headers.get('cache-control')).toBe('no-store');
      const text = await res.text();
      expect(JSON.parse(text)).toMatchObject({ status: 'ok', color: 'green' });
      // The deploy script parses the color with a plain pattern: keep the compact JSON form.
      expect(text).toContain('"color":"green"');
    } finally {
      if (before === undefined) delete process.env.BEACHREX_COLOR;
      else process.env.BEACHREX_COLOR = before;
    }
    expect(dynamic).toBe('force-dynamic');
  });

  test('color is null outside the VPS containers', async () => {
    const before = process.env.BEACHREX_COLOR;
    delete process.env.BEACHREX_COLOR;
    try {
      expect(await GET().json()).toMatchObject({ status: 'ok', color: null });
    } finally {
      if (before !== undefined) process.env.BEACHREX_COLOR = before;
    }
  });

  test('the locale/preview middleware skips /api/health', () => {
    const middleware = readFileSync(join(process.cwd(), 'src', 'middleware.ts'), 'utf8');
    expect(middleware).toContain("'/((?!api/health|");
  });
});
