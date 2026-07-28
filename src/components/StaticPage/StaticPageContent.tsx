'use client';

/**
 * Renders a CMS-managed static page (title + sanitized HTML content).
 *
 * Content comes from the Filament RichEditor in the admin (admin-trusted),
 * but we still sanitize it with DOMPurify on the client to defend against
 * any malformed input. `isomorphic-dompurify` works in both SSR and CSR.
 */

import DOMPurify from 'isomorphic-dompurify';
import type { StaticPage } from '@/lib/api-client/types.gen';

interface StaticPageContentProps {
    page: StaticPage;
}

export default function StaticPageContent({ page }: StaticPageContentProps) {
    const clean = DOMPurify.sanitize(page.content ?? '', {
        // Allow the tags the Filament RichEditor can emit
        // (bold, italic, underline, headings, lists, links, blockquotes).
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'a', 'blockquote', 'span', 'div',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    });

    return (
        <article className="font-figtree max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:py-16 text-[#4D4D4D]">
            {/* Page title — styled separately (not part of injected HTML) */}
            <h1 className="text-4xl font-bold leading-tight text-[#1A3C68] mb-8">
                {page.title}
            </h1>

            {/* Injected, DOMPurify-sanitized admin HTML.
                Styles use Tailwind arbitrary descendant variants because there
                is no @tailwindcss/typography plugin; this scopes rich-text
                styling to this container only. */}
            {/* eslint-disable-next-line react/no-danger -- content is DOMPurify-sanitized admin HTML */}
            <div
                className="
                    text-[16px] leading-relaxed
                    [&_p]:my-4 [&_p:first-child]:mt-0
                    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-[#1A3C68]
                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[#1A3C68]
                    [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[#1A3C68]
                    [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-5 [&_h4]:mb-2
                    [&_h5]:text-base [&_h5]:font-semibold [&_h5]:mt-4 [&_h5]:mb-2
                    [&_h6]:text-sm [&_h6]:font-semibold [&_h6]:uppercase [&_h6]:tracking-wide [&_h6]:mt-4 [&_h6]:mb-2 [&_h6]:text-[#8D8D8D]
                    [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6
                    [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6
                    [&_li]:my-1.5
                    [&_li>ul]:my-1 [&_li>ol]:my-1
                    [&_a]:text-[#1A3C68] [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-[#2a4c78]
                    [&_strong]:font-semibold [&_strong]:text-[#1A3C68]
                    [&_em]:italic
                    [&_u]:underline [&_u]:underline-offset-2
                    [&_s]:line-through [&_s]:text-[#8D8D8D]
                    [&_blockquote]:border-l-4 [&_blockquote]:border-[#E7E7E7] [&_blockquote]:pl-4 [&_blockquote]:my-5 [&_blockquote]:italic [&_blockquote]:text-[#8D8D8D]
                    [&_hr]:my-6 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-[#E7E7E7]
                "
                dangerouslySetInnerHTML={{ __html: clean }}
            />
        </article>
    );
}
