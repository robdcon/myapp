import { ApolloWrapper } from '@/lib/apollo-wrapper';
import { Provider } from "@/components/ui/provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <ApolloWrapper>
          <Provider>
            {children}
          </Provider>
        </ApolloWrapper>
      </body>
    </html>
  );
}