import Hero from "../components/landing/Hero";
import CategoryBento from "../components/landing/CategoryBento";
import HowItWorks from "../components/landing/HowItWorks";
import TrustStats from "../components/landing/TrustStats";
import Testimonials from "../components/landing/Testimonials";
import PartnerCTA from "../components/landing/PartnerCTA";

// Landing page Torano — urutan section mengikuti desain final:
// hero → kategori (bento) → cara kerja (zigzag) → statistik & escrow
// → testimoni → ajakan jadi mitra. Navbar & footer dari MainLayout.
const Home = () => (
  <>
    <Hero />
    <CategoryBento />
    <HowItWorks />
    <TrustStats />
    <Testimonials />
    <PartnerCTA />
  </>
);

export default Home;
