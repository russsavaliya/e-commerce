import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { Store, BookOpen, Heart, Sparkles } from 'lucide-react';

// Images
import heroImg from '../../assets/images/about-hero.png';
import modelsImg from '../../assets/images/about-models.png';
import stylingImg from '../../assets/images/about-styling.png';

const story = [
  {
    icon: Store,
    heading: 'Our Origin',
    body: 'We started as a boutique for luxury sarees, working closely with weavers to bring craftsmanship online.',
    accent: '#481d6f',
    bg: 'linear-gradient(135deg, rgba(72,29,111,0.08) 0%, rgba(72,29,111,0.15) 100%)',
    iconBg: 'rgba(72,29,111,0.18)',
    borderTop: '4px solid #481d6f',
  },
  {
    icon: BookOpen,
    heading: 'What We Curate',
    body: 'Kanjivarams, Banarasis, organza edits, pastel silks, and contemporary occasion-wear with handpicked detailing.',
    accent: '#be185d',
    bg: 'linear-gradient(135deg, rgba(190,24,93,0.06) 0%, rgba(190,24,93,0.13) 100%)',
    iconBg: 'rgba(190,24,93,0.15)',
    borderTop: '4px solid #be185d',
  },
  {
    icon: Heart,
    heading: 'Our Promise',
    body: 'Transparent quality, responsive support, and styling help so you pick the drape that truly fits your moment.',
    accent: '#b45309',
    bg: 'linear-gradient(135deg, rgba(180,83,9,0.06) 0%, rgba(180,83,9,0.13) 100%)',
    iconBg: 'rgba(180,83,9,0.15)',
    borderTop: '4px solid #b45309',
  },
];

/* ──────────────── Intersection Observer Hook ──────────────── */
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('about-visible');
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
};

const RevealSection = ({ children, className = '', delay = 0 }) => {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`about-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ──────────────── Main Page ──────────────── */
const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <Navbar />

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '520px' }}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2d0a4e] via-[#481d6f] to-[#6b2fa0]" />

        {/* Decorative flowing wave shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '200px' }}>
            <path fill="rgba(255,255,255,0.06)" d="M0,224L60,218.7C120,213,240,203,360,197.3C480,192,600,192,720,202.7C840,213,960,235,1080,234.7C1200,235,1320,213,1380,202.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '160px' }}>
            <path fill="rgba(255,255,255,0.04)" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
          {/* Golden sparkle dots */}
          <div className="absolute top-[8%] left-[5%] w-2.5 h-2.5 rounded-full bg-amber-300/50 animate-pulse" />
          <div className="absolute top-[15%] left-[12%] w-1.5 h-1.5 rounded-full bg-amber-200/40 animate-pulse" style={{ animationDelay: '0.8s' }} />
          <div className="absolute top-[22%] left-[22%] w-2 h-2 rounded-full bg-yellow-300/45 animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-[35%] left-[8%] w-1 h-1 rounded-full bg-amber-300/60 animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="absolute top-[50%] left-[18%] w-2 h-2 rounded-full bg-amber-200/35 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[65%] left-[6%] w-1.5 h-1.5 rounded-full bg-yellow-200/50 animate-pulse" style={{ animationDelay: '1.2s' }} />
          <div className="absolute top-[12%] left-[38%] w-1 h-1 rounded-full bg-amber-300/55 animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="absolute top-[28%] left-[45%] w-2 h-2 rounded-full bg-yellow-300/35 animate-pulse" style={{ animationDelay: '1.8s' }} />
          <div className="absolute top-[18%] right-[8%] w-2.5 h-2.5 rounded-full bg-amber-300/45 animate-pulse" style={{ animationDelay: '0.4s' }} />
          <div className="absolute top-[30%] right-[15%] w-1.5 h-1.5 rounded-full bg-yellow-200/40 animate-pulse" style={{ animationDelay: '1.1s' }} />
          <div className="absolute top-[45%] right-[25%] w-1 h-1 rounded-full bg-amber-200/55 animate-pulse" style={{ animationDelay: '2.2s' }} />
          <div className="absolute top-[55%] right-[10%] w-2 h-2 rounded-full bg-amber-300/40 animate-pulse" style={{ animationDelay: '0.9s' }} />
          <div className="absolute top-[70%] right-[20%] w-1.5 h-1.5 rounded-full bg-yellow-300/50 animate-pulse" style={{ animationDelay: '1.6s' }} />
          <div className="absolute top-[40%] left-[32%] w-1 h-1 rounded-full bg-amber-300/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute top-[60%] left-[42%] w-2.5 h-2.5 rounded-full bg-yellow-200/30 animate-pulse" style={{ animationDelay: '1.4s' }} />
          <div className="absolute top-[75%] left-[28%] w-1.5 h-1.5 rounded-full bg-amber-200/45 animate-pulse" style={{ animationDelay: '2.5s' }} />
          <div className="absolute top-[5%] left-[55%] w-1 h-1 rounded-full bg-amber-300/50 animate-pulse" style={{ animationDelay: '0.7s' }} />
          <div className="absolute top-[82%] right-[35%] w-2 h-2 rounded-full bg-yellow-300/35 animate-pulse" style={{ animationDelay: '1.9s' }} />
          {/* Larger glowing orbs for depth */}
          <div className="absolute top-[20%] left-[30%] w-4 h-4 rounded-full bg-amber-400/15 blur-sm animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[50%] right-[30%] w-5 h-5 rounded-full bg-yellow-300/12 blur-sm animate-pulse" style={{ animationDelay: '2.3s' }} />
          <div className="absolute top-[70%] left-[50%] w-3 h-3 rounded-full bg-amber-300/18 blur-sm animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-6 py-14 md:py-20">
          {/* Left text */}
          <RevealSection className="text-white space-y-5 max-w-xl md:w-1/2">
            <h1 className="font-luxury-heading text-4xl md:text-5xl lg:text-6xl leading-tight" style={{ color: '#fff' }}>
              About Us
            </h1>
            <p className="text-lg md:text-xl font-medium text-purple-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Crafting Elegance with Heritage and Passion
            </p>
            <p className="text-sm md:text-base text-purple-100/90 leading-relaxed max-w-lg">
              At Siyara, we blend the timeless artistry of traditional sarees with the sophistication of modern design,
              presenting you with a unique collection that celebrates heritage and contemporary elegance.
            </p>
          </RevealSection>

          {/* Right image */}
          <RevealSection className="md:w-1/2 flex justify-end" delay={200}>
            <img
              src={heroImg}
              alt="Siyara – elegant saree model"
              className="w-full max-w-md md:max-w-lg object-contain drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 20px 40px rgba(72,29,111,0.4))' }}
            />
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════ OUR STORY CARDS ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-20">
        <RevealSection className="text-center mb-12">
          <h2 className="font-luxury-heading text-3xl md:text-4xl mb-3" style={{ color: 'rgb(72,29,111)' }}>
            Our Story
          </h2>
          <div className="w-16 h-1 mx-auto rounded-full bg-gradient-to-r from-[#481d6f] to-pink-500" />
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {story.map((item, i) => (
            <RevealSection key={item.heading} delay={i * 150}>
              <div className="group relative h-full rounded-2xl p-7 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                style={{
                  background: item.bg,
                  borderTop: item.borderTop,
                }}
              >
                {/* Glow blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" style={{ background: item.iconBg }} />

                <div className="relative z-10 space-y-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: item.iconBg, border: `1px solid ${item.accent}30` }}>
                    <item.icon className="w-7 h-7" style={{ color: item.accent }} />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: item.accent }}>{item.heading}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{item.body}</p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════ ABOUT SIYARA SECTION ═══════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '480px' }}>
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#2d0a4e] to-[#481d6f]" />
        {/* Bokeh circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] right-[20%] w-40 h-40 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute bottom-[20%] left-[10%] w-56 h-56 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-[50%] right-[40%] w-24 h-24 rounded-full bg-amber-400/8 blur-2xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center gap-10 py-14 md:py-20">
          {/* Left text */}
          <RevealSection className="md:w-1/2 text-white space-y-5">
            <h2 className="font-luxury-heading text-3xl md:text-4xl lg:text-5xl leading-tight" style={{ color: '#fff' }}>
              About Siyara
            </h2>
            <p className="text-base md:text-lg font-semibold text-purple-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Embracing Tradition, Exuding Elegance
            </p>
            <p className="text-sm md:text-base text-purple-100/85 leading-relaxed max-w-lg">
              At Siyara, we bring the timeless artistry of traditional sarees into the modern era, celebrating heritage with
              contemporary elegance. Every piece in our collection is selected to honor India's rich textile legacy while
              meeting today's fashion sensibilities.
            </p>
          </RevealSection>

          {/* Right image */}
          <RevealSection className="md:w-1/2 flex justify-center" delay={200}>
            <img
              src={modelsImg}
              alt="Siyara – two models in traditional sarees"
              className="w-full max-w-md rounded-2xl object-cover shadow-2xl"
              style={{ filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5))' }}
            />
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════ OUR STORY TIMELINE ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-20">
        <RevealSection className="text-center mb-14">
          <h2 className="font-luxury-heading text-3xl md:text-4xl mb-3" style={{ color: 'rgb(72,29,111)' }}>
            Our Story
          </h2>
          <div className="w-16 h-1 mx-auto rounded-full bg-gradient-to-r from-[#481d6f] to-pink-500" />
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Heritage Roots',
              desc: 'Born from a love for India\'s textile heritage, we set out to bring authentic weaves directly from artisan clusters to your doorstep.',
            },
            {
              step: '02',
              title: 'Artisan Partnership',
              desc: 'We partner with master weavers across Varanasi, Kanchipuram, and Chanderi to curate sarees that uphold centuries-old traditions.',
            },
            {
              step: '03',
              title: 'Modern Elegance',
              desc: 'Today, Siyara bridges tradition and trend—offering curated collections that suit every celebration and modern occasion.',
            },
          ].map((item, i) => (
            <RevealSection key={item.step} delay={i * 150}>
              <div className="relative group text-center p-8 rounded-2xl bg-white border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-[#481d6f] to-[#a855f7] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {item.step}
                </div>
                <div className="pt-4 space-y-3">
                  <h4 className="text-xl font-bold text-[#481d6f]">{item.title}</h4>
                  <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════ NEED STYLING HELP CTA ═══════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '360px' }}>
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2d0a4e] via-[#481d6f] to-[#6b2fa0]" />
        {/* Decorative bokeh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[5%] w-48 h-48 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute bottom-[10%] right-[15%] w-40 h-40 rounded-full bg-amber-400/8 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center gap-10 py-14 md:py-20">
          {/* Left image */}
          <RevealSection className="md:w-2/5 flex justify-center">
            <img
              src={stylingImg}
              alt="Siyara – personal styling"
              className="w-full max-w-sm rounded-2xl object-cover shadow-2xl"
              style={{ filter: 'drop-shadow(0 15px 40px rgba(0,0,0,0.45))' }}
            />
          </RevealSection>

          {/* Right text */}
          <RevealSection className="md:w-3/5 text-white space-y-5" delay={150}>
            <h3 className="font-luxury-heading text-2xl md:text-3xl lg:text-4xl leading-tight" style={{ color: '#fff' }}>
              Need Styling Help?
            </h3>
            <p className="text-sm md:text-base text-purple-100/85 leading-relaxed max-w-lg">
              Our expert stylists are here to assist—share your occasion and preferences, and we'll help you find the
              perfect drape that reflects your personality and moment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-7 py-3 rounded-full font-semibold bg-white text-[#481d6f] hover:bg-purple-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm"
              >
                Get in Touch
              </Link>
              <Link
                to="/sale"
                className="inline-flex items-center justify-center px-7 py-3 rounded-full font-semibold border-2 border-white text-white hover:bg-white hover:text-[#481d6f] transition-all duration-300 text-sm"
              >
                Sales with Us
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      <Footer />

      {/* ═══════════════ SCOPED STYLES ═══════════════ */}
      <style>{`
        /* Scroll-reveal */
        .about-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1);
        }
        .about-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default AboutPage;