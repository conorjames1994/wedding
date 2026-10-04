import Nav from './components/Nav';
import Hero from './components/Hero';
import OurStory from './components/OurStory';
import Schedule from './components/Schedule';
import Travel from './components/Travel';
import RSVP from './components/RSVP';
import Gallery from './components/Gallery';
import Guestbook from './components/Guestbook';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Simple hash-based route for /admin — no router dependency needed for one extra page.
  if (window.location.hash.startsWith('#admin')) {
    return <AdminDashboard />;
  }

  return (
    <div>
      <Nav />
      <Hero />
      <OurStory />
      <Schedule />
      <Travel />
      <RSVP />
      <Gallery />
      <Guestbook />
      <FAQ />
      <Footer />
    </div>
  );
}
