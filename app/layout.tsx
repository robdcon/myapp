import { ApolloWrapper } from '@/lib/apollo-wrapper';
import { Provider } from '@/components/ui/provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ApolloWrapper>
          <Provider>{children}</Provider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
