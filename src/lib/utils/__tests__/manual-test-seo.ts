/**
 * Manual Test for SEO Helper Utilities
 *
 * This file can be used to manually test the SEO helper functions
 * Run with: npx tsx src/lib/utils/__tests__/manual-test-seo.ts
 *
 * Or just verify the functions can be imported and used
 */

import {
  truncateTitle,
  truncateDescription,
  buildBeachImageAlt,
  sanitizeMetaText,
} from '../seo-helpers';

import {
  getBaseUrl,
  buildAlternateLanguages,
  buildCanonicalUrl,
  buildBeachAlternateLanguages,
} from '../metadata-helpers';

console.log('🧪 Testing SEO Helper Utilities\n');

// Test 1: Truncate Title
console.log('1️⃣ Testing truncateTitle:');
const longTitle = 'Bačvice Beach - Split, Croatia | BeachRex - The Best Beach Guide for Finding Perfect Beaches';
const truncated = truncateTitle(longTitle);
console.log(`   Original (${longTitle.length} chars): ${longTitle}`);
console.log(`   Truncated (${truncated.length} chars): ${truncated}`);
console.log(`   ✅ ${truncated.length <= 63 ? 'PASS' : 'FAIL'}\n`);

// Test 2: Truncate Description
console.log('2️⃣ Testing truncateDescription:');
const longDesc = 'Discover the beautiful Bačvice Beach in Split, Croatia. This stunning sandy beach offers crystal clear waters, excellent facilities, and is perfect for families. Located in the heart of Split, it features restaurants, cafes, and water sports activities for all ages.';
const truncatedDesc = truncateDescription(longDesc);
console.log(`   Original (${longDesc.length} chars): ${longDesc}`);
console.log(`   Truncated (${truncatedDesc.length} chars): ${truncatedDesc}`);
console.log(`   ✅ ${truncatedDesc.length <= 163 ? 'PASS' : 'FAIL'}\n`);

// Test 3: Sanitize Meta Text
console.log('3️⃣ Testing sanitizeMetaText:');
const htmlText = '<p>Beach with <strong>bold</strong> text & "quotes"</p>';
const sanitized = sanitizeMetaText(htmlText);
console.log(`   Original: ${htmlText}`);
console.log(`   Sanitized: ${sanitized}`);
console.log(`   ✅ ${!sanitized.includes('<') && !sanitized.includes('>') ? 'PASS' : 'FAIL'}\n`);

// Test 4: Build Beach Image Alt (mock translation function)
console.log('4️⃣ Testing buildBeachImageAlt:');
const mockT = (key: string, values?: Record<string, string>) => {
  if (key === 'beachImageAlt') {
    return `${values?.beachName} beach in ${values?.cityName}, ${values?.countryName}`;
  }
  return key;
};
const altText = buildBeachImageAlt('Bačvice', 'Split', 'Croatia', mockT);
console.log(`   Alt text: ${altText}`);
console.log(`   ✅ ${altText.includes('Bačvice') && altText.includes('Split') ? 'PASS' : 'FAIL'}\n`);

// Test 5: Get Base URL
console.log('5️⃣ Testing getBaseUrl:');
try {
  const baseUrl = getBaseUrl();
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   ✅ ${baseUrl.startsWith('http') ? 'PASS' : 'FAIL'}\n`);
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.log(`   ❌ FAIL: ${errorMessage}\n`);
}

// Test 6: Build Canonical URL
console.log('6️⃣ Testing buildCanonicalUrl:');
try {
  const canonical = buildCanonicalUrl('en', '/beaches/europe/croatia/split/bacvice-beach');
  console.log(`   Canonical URL: ${canonical}`);
  console.log(`   ✅ ${canonical.includes('/en/beaches/') ? 'PASS' : 'FAIL'}\n`);
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.log(`   ❌ FAIL: ${errorMessage}\n`);
}

// Test 7: Build Alternate Languages
console.log('7️⃣ Testing buildAlternateLanguages:');
try {
  const alternates = buildAlternateLanguages('/beaches/europe/croatia');
  console.log(`   Number of alternates: ${Object.keys(alternates).length}`);
  console.log(`   English: ${alternates.en ?? 'N/A'}`);
  console.log(`   Slovenian: ${alternates.si ?? 'N/A'}`);
  console.log(`   x-default: ${alternates['x-default'] ?? 'N/A'}`);
  console.log(`   ✅ ${Object.keys(alternates).length === 15 ? 'PASS' : 'FAIL'}\n`);
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.log(`   ❌ FAIL: ${errorMessage}\n`);
}

// Test 8: Build Beach Alternate Languages
console.log('8️⃣ Testing buildBeachAlternateLanguages:');
try {
  const beachAlternates = buildBeachAlternateLanguages(
    'bacvice-beach',
    'europe',
    'croatia',
    null,
    null,
    'split'
  );
  console.log(`   Number of alternates: ${Object.keys(beachAlternates).length}`);
  console.log(`   English: ${beachAlternates.en ?? 'N/A'}`);
  console.log(`   Slovenian: ${beachAlternates.si ?? 'N/A'}`);
  const enCheck = beachAlternates.en?.includes('/beaches/') ?? false;
  const siCheck = beachAlternates.si?.includes('/plaze/') ?? false;
  console.log(`   ✅ ${enCheck && siCheck ? 'PASS' : 'FAIL'}\n`);
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.log(`   ❌ FAIL: ${errorMessage}\n`);
}

console.log('✅ All manual tests completed!\n');
console.log('📝 Note: Some tests may fail if environment variables are not set.');
console.log('   Make sure NEXT_PUBLIC_BASE_URL is set in your .env file.\n');

