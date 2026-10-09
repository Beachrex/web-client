'use client';

import { FavoriteButton } from '@/components/Favorites/FavoriteButton';
import { FEATURES } from '@/lib/constants/features';
import ShareMenu from './ShareMenu';

/**
 * Beach banner actions: save to favorites (owner 2026-10-09) and share. Google ratings (a hardcoded
 * value) stay hidden for launch — see the backend docs/features/hidden-for-launch.md.
 */
const TopBarBeachRight: React.FC<{ beachId?: number }> = ({ beachId }) => (
  <div className="flex items-center gap-[14px]">
    {FEATURES.favorites && beachId ? <FavoriteButton beachId={beachId} variant="banner" /> : null}
    <ShareMenu />
  </div>
);

export default TopBarBeachRight;
