'use client';

import ShareMenu from './ShareMenu';

/**
 * Beach banner actions. Owner, 2026-10-08: Google ratings (a hardcoded value) and save (favorites,
 * FEATURES.favorites) are hidden for launch — see the backend docs/features/hidden-for-launch.md;
 * share opens the share menu.
 */
const TopBarBeachRight: React.FC = () => (
  <div className="flex items-center gap-[14px]">
    <ShareMenu />
  </div>
);

export default TopBarBeachRight;
