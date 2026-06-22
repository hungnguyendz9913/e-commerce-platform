import { Montserrat } from 'next/font/google';
import './global.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata = {
  title: {
    default: "ShopVN",
    template: "%s | ShopVN",
  },
  description: "ShopVN storefront, customer account, checkout, and admin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} font-sans`}>
      <body>{children}</body>
    </html>
  );
}
