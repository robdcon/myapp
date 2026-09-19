import { SerwistProvider } from '@serwist/turbopack/react';
import type { Metadata, Viewport } from 'next';
import { ApolloWrapper } from '@/src/shared/lib/apollo-wrapper';
import { Provider } from '@/components/ui/provider';
import { ErrorBoundary } from '@/src/shared/ui/error-boundary/ErrorBoundary';

const APP_NAME = 'Board Manager';
const APP_DEFAULT_TITLE = 'Board Manager';
const APP_TITLE_TEMPLATE = '%s - Board Manager';
const APP_DESCRIPTION = 'Create shared checklists, notice boards, and event boards.';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#219591',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <SerwistProvider swUrl="/serwist/sw.js">
          <ApolloWrapper>
            <Provider>
              <ErrorBoundary>{children}</ErrorBoundary>
            </Provider>
          </ApolloWrapper>
        </SerwistProvider>
      </body>
    </html>
  );
}
