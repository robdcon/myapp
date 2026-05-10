import { ApolloWrapper } from '@/src/shared/lib/apollo-wrapper';
import { Provider } from '@/components/ui/provider';
import { ErrorBoundary } from '@/src/shared/ui/error-boundary/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ApolloWrapper>
          <Provider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </Provider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
