import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * TASK-004 audit A4: English text shown to every locale. Each phrase below was hard-coded in the
 * listed file; it now comes from next-intl (`UI`, `FilterModal`, `AI.*`, existing keys) or, for
 * short-lived loading placeholders, a language-neutral skeleton/spinner.
 */
const FIXED: Record<string, string[]> = {
  'src/app/[locale]/ai/page.tsx': ['Ask our AI assistant', 'Start chatting', 'Generate personalized', 'Create itinerary', 'New to Beachrex AI?'],
  'src/app/[locale]/ai/chat/page.tsx': ['View details →', 'Suggestions:'],
  'src/components/AiChat/ChatMessageList.tsx': ['View details →', 'Suggestions:'],
  'src/components/AiChat/AiChatWidget.tsx': ['New conversation', 'Close', 'AI beach assistant'],
  'src/app/[locale]/ai/itinerary/page.tsx': ['Assumptions:', 'Failed to initiate purchase'],
  'src/components/DestinationsCarousel.tsx': ['Loading carousel'],
  'src/components/AccommodationCard/AccommodationCarousel.tsx': ['Loading carousel'],
  'src/components/PropertySection.tsx': ['Loading...'],
  'src/components/Map/BeachMapClient.tsx': ['Loading map'],
  'src/components/BannerSection/WeatherWidget.tsx': ["'Loading...'"],
  'src/components/Home/BeachCategorySearch.tsx': ['Loading filters'],
  'src/components/Map/LeftSidebarFilters.tsx': ['Select an option'],
  'src/components/ui/StyledSelect.tsx': ['Select an option'],
  'src/components/Map/VirtualizedBeachList.tsx': ['No beaches found in this area'],
  'src/components/Map/MapWithSidebar.tsx': ['Single column layout', 'Double column layout', '"Close map"', '"Close filters"'],
  'src/components/Beach/BeachPageView.tsx': ['title="Video"', '360° Virtual Tour'],
  'src/components/Beach/BeachDetails/beachDetailsSection.tsx': ['Path to the beach map'],
  'src/components/Home/FilterModal.tsx': ['All Beach Filters', 'Search filters...', 'Clear all', 'Cancel', 'Apply Filters', "'Show less'", 'more...'],
};

test('no hard-coded English UI text in the fixed files', () => {
  for (const [file, phrases] of Object.entries(FIXED)) {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    for (const phrase of phrases) {
      expect(source.includes(phrase), `${file}: "${phrase}"`).toBe(false);
    }
  }
});

test('new UI and FilterModal keys are translated (not English) in Slovenian', () => {
  const en = JSON.parse(readFileSync(join(process.cwd(), 'messages/en.json'), 'utf8')) as Record<string, Record<string, string>>;
  const si = JSON.parse(readFileSync(join(process.cwd(), 'messages/si.json'), 'utf8')) as Record<string, Record<string, string>>;
  for (const ns of ['UI', 'FilterModal']) {
    for (const key of Object.keys(en[ns]!)) {
      expect(si[ns]![key], `${ns}.${key}`).not.toBe(en[ns]![key]);
    }
  }
});
