import Navbar from '@/components/storefront/Navbar';
import HeroSection from '@/components/storefront/HeroSection';
import TickerTape from '@/components/storefront/TickerTape';
import FeaturedGrid from '@/components/storefront/FeaturedGrid';
import StatsCounter from '@/components/storefront/StatsCounter';
import BrandsSection from '@/components/storefront/BrandsSection';
import Testimonials from '@/components/storefront/Testimonials';
import CTASection from '@/components/storefront/CTASection';
import Footer from '@/components/storefront/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  title: 'Chrono Craft — Premium Luxury Watches India',
  description:
    'Discover authenticated brand-new luxury watches from Rolex, Omega, Patek Philippe, Audemars Piguet and more. India\'s premier luxury watch destination.',
  alternates: { canonical: siteUrl },
  openGraph: {
    title: 'Chrono Craft — Premium Luxury Watches India',
    description: 'Authenticated brand-new luxury watches delivered across India.',
    url: siteUrl,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TickerTape />
        <FeaturedGrid />
        <StatsCounter />
        <BrandsSection />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
