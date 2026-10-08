import { Facebook, Instagram, Youtube } from 'lucide-react';

const SOCIAL_LINKS = [
  { href: 'https://www.facebook.com/beachrexproject/', label: 'Facebook', Icon: Facebook },
  { href: 'https://www.instagram.com/beachrex_project/', label: 'Instagram', Icon: Instagram },
  { href: 'https://www.youtube.com/@BeachRex', label: 'YouTube', Icon: Youtube },
];

export default function FooterSocial() {
  return (
    <ul className="flex items-center gap-3">
      {SOCIAL_LINKS.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            aria-label={label}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F4F8] text-[#1A3C68] transition-colors hover:bg-[#1A3C68] hover:text-white"
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
