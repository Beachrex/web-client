'use client';

import { Modal } from 'flowbite-react';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { SignInOptions } from '@/components/Auth';
import { useAuth } from '@/contexts/AuthContext';
import { useFavoriteIds, useToggleFavorite, type FavoriteError } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  beachId: number;
  /** `card`: white heart on a photo; `banner`: heart with a label on the beach page. */
  variant?: 'card' | 'banner';
}

/**
 * Heart that saves a beach to "My favorites". Signed-out visitors get the sign-in dialog; after an
 * e-mail sign-in in that dialog the beach is saved, so the click is not lost.
 */
export function FavoriteButton({ beachId, variant = 'card' }: FavoriteButtonProps) {
  const t = useTranslations('Favorites');
  const { isAuthenticated } = useAuth();
  const ids = useFavoriteIds();
  const [message, setMessage] = useState<FavoriteError | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const saveAfterSignIn = useRef(false);
  const toggle = useToggleFavorite(setMessage);
  const saved = ids.includes(beachId);

  useEffect(() => {
    if (!isAuthenticated || !saveAfterSignIn.current) return;
    saveAfterSignIn.current = false;
    setSignInOpen(false);
    toggle.mutate({ beachId, save: true });
  }, [isAuthenticated, beachId, toggle]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const onClick = (e: React.MouseEvent) => {
    // The heart sits on the card's photo carousel and inside the beach banner: keep the click here.
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      saveAfterSignIn.current = true;
      setSignInOpen(true);
      return;
    }
    setMessage(null);
    toggle.mutate({ beachId, save: !saved });
  };

  const label = saved ? t('remove') : t('add');

  return (
    <>
      <span className="relative inline-flex">
        <button
          type="button"
          onClick={onClick}
          onPointerDown={(e) => e.stopPropagation()}
          aria-pressed={saved}
          aria-label={label}
          title={label}
          className={
            variant === 'card'
              ? 'flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/20'
              : 'flex items-center gap-1 font-figtree text-[14px] font-semibold text-white hover:underline'
          }
        >
          <Heart
            size={variant === 'card' ? 22 : 20}
            className={`drop-shadow-[0_0_3px_rgba(0,0,0,0.5)] ${saved ? 'text-red-500' : 'text-white'}`}
            fill={saved ? 'currentColor' : 'none'}
          />
          {variant === 'banner' && <span>{saved ? t('saved') : t('save')}</span>}
        </button>
        {message && (
          <span
            role="status"
            className="absolute right-0 top-full z-30 mt-1 w-56 rounded-md bg-white p-2 text-left font-figtree text-[12px] font-normal text-gray-800 shadow-lg"
          >
            {message === 'limit' ? t('limit') : t('error')}
          </span>
        )}
      </span>

      <Modal
        show={signInOpen}
        onClose={() => {
          saveAfterSignIn.current = false;
          setSignInOpen(false);
        }}
        size="md"
        position="center"
        dismissible
      >
        <Modal.Header>{t('signInTitle')}</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-gray-700">{t('signInText')}</p>
            <SignInOptions />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default FavoriteButton;
