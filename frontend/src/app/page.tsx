import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { Categories } from "@/components/sections/Categories";
import { TopInfluencers } from "@/components/sections/TopInfluencers";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
import { VideoSection } from "@/components/sections/VideoSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { Footer } from "@/components/layout/Footer";
import { HowItWorks } from "@/components/sections/HowItWorks";
import CreatorsList from '@/components/CreatorsList';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Categories />
      <TopInfluencers />
      <Stats />
      <Testimonials />
      <VideoSection />
      <BlogSection />
      <section className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Discover Top Influencers</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with creative minds across various platforms and niches.
          </p>
        </div>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Featured Creators</h2>
          <CreatorsList />
        </section>
      </section>
      <Footer />
    </div>
  );
}
