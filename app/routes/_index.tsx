import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { FilterChip } from '~/components/ui/FilterChip';
import { Button } from '~/components/ui/Button';

export const meta: MetaFunction = () => {
  return [{ title: 'Sparti' }, { name: 'description', content: 'Talk with Sparti, your AI development assistant' }];
};

export const loader = () => json({});

/**
 * Landing page component for Bolt
 * Note: Settings functionality should ONLY be accessed through the sidebar menu.
 * Do not add settings button/panel to this landing page as it was intentionally removed
 * to keep the UI clean and consistent with the design system.
 */
export default function Index() {
  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <Header />

      {/* Chat section */}
      <section aria-label="Chat" className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-chat mx-auto">
          <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
        </div>
      </section>
      {/* Divider between sections */}
      <div aria-hidden="true" className="max-w-chat mx-auto w-full border-t border-bolt-elements-borderColor/50" />

      {/* Templates placeholder section */}
      <section aria-label="Templates" className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        <div className="max-w-chat mx-auto">
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
              Templates
            </h2>
            <p className="mt-1 text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark">
              Create reusable chats. Mark a chat as <span className="font-medium">Template</span> and assign categories.
            </p>
          </div>

          {/* Filters row (non-functional placeholders) */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <FilterChip label="All categories" active icon="i-ph:tag" />
            <FilterChip label="Design" icon="i-ph:tag" />
            <FilterChip label="Engineering" icon="i-ph:tag" />
            <FilterChip label="Marketing" icon="i-ph:tag" />
          </div>

          {/* Empty grid placeholder */}
          <div className="mt-4 grid grid-cols-1 gap-4 justify-items-center">
            <div className="w-full max-w-md rounded-xl border border-dashed border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark p-6 flex flex-col items-center justify-center text-center bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3">
              <span className="i-ph:folder-plus-duotone text-3xl text-bolt-elements-textTertiary dark:text-bolt-elements-textTertiary-dark" />
              <p className="mt-2 font-medium text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark">
                No templates yet
              </p>
              <p className="mt-1 text-sm text-bolt-elements-textSecondary dark:text-bolt-elements-textSecondary-dark max-w-[46ch]">
                Templates are chats you mark as <span className="font-medium">Template</span>. You’ll be able to assign
                categories and duplicate them to start faster. Supabase integration coming soon.
              </p>
              <div className="mt-4">
                <Button disabled>Coming soon</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
