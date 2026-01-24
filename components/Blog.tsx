import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../App';
import { Carousel, Card } from './ui/AppleCardsCarousel';
import { SparklesCore } from './Sparkles';
import { ArrowRight } from 'lucide-react';

const BlogContent = ({
  title,
  excerpt,
  sections
}: {
  title: string;
  excerpt: string;
  sections: { heading: string; content: string; image?: string }[];
}) => {
  return (
    <>
      <div className="bg-[var(--glass-bg)] dark:bg-neutral-900 p-8 md:p-14 rounded-3xl mb-4 border border-[var(--glass-border)]">
        <p className="text-[var(--text-muted)] text-base md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
          {excerpt}
        </p>
      </div>
      {sections.map((section, index) => (
        <div
          key={index}
          className="bg-[var(--glass-bg)] dark:bg-neutral-900 p-8 md:p-14 rounded-3xl mb-4 border border-[var(--glass-border)]"
        >
          <h3 className="text-xl md:text-2xl font-bold text-[var(--text-main)] mb-4">
            {section.heading}
          </h3>
          <p className="text-[var(--text-muted)] text-base md:text-lg font-medium max-w-3xl mx-auto leading-relaxed">
            {section.content}
          </p>
          {section.image && (
            <img
              src={section.image}
              alt={section.heading}
              className="md:w-3/4 w-full mx-auto object-contain mt-8 rounded-2xl"
            />
          )}
        </div>
      ))}
    </>
  );
};

const blogPosts = [
  {
    category: "AI & Automation",
    title: "How AI is Transforming Wealth Management in 2026",
    src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=3432&auto=format&fit=crop",
    content: (
      <BlogContent
        title="How AI is Transforming Wealth Management in 2026"
        excerpt="Artificial intelligence is no longer a futuristic concept—it's reshaping how financial advisors operate today. From automated client onboarding to predictive analytics, AI tools are helping advisors serve more clients with better outcomes."
        sections={[
          {
            heading: "The Rise of AI-Powered Client Communication",
            content: "Modern AI chatbots can handle initial client inquiries 24/7, qualify leads, and even schedule appointments. This means advisors can focus on high-value conversations while automation handles the routine tasks that used to eat up hours each week.",
          },
          {
            heading: "Predictive Analytics for Client Retention",
            content: "AI can analyze client behavior patterns to identify those at risk of leaving before they even consider it. By spotting early warning signs, advisors can proactively reach out and strengthen relationships.",
          },
          {
            heading: "The Human Touch Still Matters",
            content: "While AI handles the operational heavy lifting, the personal relationship between advisor and client remains irreplaceable. The best practices use AI to enhance human connection, not replace it.",
          },
        ]}
      />
    ),
  },
  {
    category: "Digital Marketing",
    title: "Why Your Website is Your Most Important Employee",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
    content: (
      <BlogContent
        title="Why Your Website is Your Most Important Employee"
        excerpt="Your website works 24 hours a day, 7 days a week, never takes vacation, and is often the first impression prospects have of your practice. Yet most advisors treat it as an afterthought."
        sections={[
          {
            heading: "First Impressions Are Everything",
            content: "Studies show that visitors form an opinion about your website in just 50 milliseconds. That's faster than a blink. If your site looks outdated or unprofessional, prospects will click away before reading a single word.",
          },
          {
            heading: "Mobile-First is No Longer Optional",
            content: "Over 60% of high-net-worth individuals research financial services on their phones. If your website isn't optimized for mobile, you're invisible to the majority of your potential clients.",
          },
          {
            heading: "Conversion is the Goal",
            content: "A beautiful website means nothing if it doesn't convert visitors into consultations. Every element should guide visitors toward taking action—whether that's booking a call or requesting more information.",
          },
        ]}
      />
    ),
  },
  {
    category: "Client Experience",
    title: "The Art of Client Onboarding That Creates Raving Fans",
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=3540&auto=format&fit=crop",
    content: (
      <BlogContent
        title="The Art of Client Onboarding That Creates Raving Fans"
        excerpt="The first 90 days of a client relationship set the tone for everything that follows. Get it right, and you'll have a client for life who refers friends and family. Get it wrong, and you'll struggle to retain them."
        sections={[
          {
            heading: "Set Expectations Early",
            content: "Clear communication about what clients can expect—from meeting frequency to response times—prevents disappointment and builds trust from day one.",
          },
          {
            heading: "Automate Without Losing the Personal Touch",
            content: "Welcome sequences, document collection, and scheduling can all be automated while still feeling personal. The key is thoughtful design that anticipates client needs.",
          },
          {
            heading: "Create Quick Wins",
            content: "Deliver value early in the relationship. Whether it's a quick insight, a useful resource, or simply exceptional responsiveness, early wins cement client confidence in their decision to work with you.",
          },
        ]}
      />
    ),
  },
  {
    category: "Growth Strategy",
    title: "Scaling Your Practice Without Sacrificing Quality",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3387&auto=format&fit=crop",
    content: (
      <BlogContent
        title="Scaling Your Practice Without Sacrificing Quality"
        excerpt="Every advisor hits a ceiling. There are only so many hours in a day, and personal service can only stretch so far. The question isn't whether to scale, but how to do it without diluting what makes you special."
        sections={[
          {
            heading: "Systems Create Freedom",
            content: "Documented processes and automated workflows aren't about becoming robotic—they're about ensuring consistency. When your systems are solid, you can confidently delegate or expand.",
          },
          {
            heading: "Technology as a Force Multiplier",
            content: "The right tech stack lets one advisor accomplish what used to require a team. From CRM automation to AI-powered research, technology amplifies your capabilities.",
          },
          {
            heading: "Know Your Ideal Client",
            content: "Not every client is worth taking. The clearer you are about who you serve best, the more efficiently you can market, onboard, and deliver exceptional service.",
          },
        ]}
      />
    ),
  },
  {
    category: "Industry Trends",
    title: "What High-Net-Worth Clients Really Want in 2026",
    src: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=3542&auto=format&fit=crop",
    content: (
      <BlogContent
        title="What High-Net-Worth Clients Really Want in 2026"
        excerpt="The expectations of wealthy clients have evolved dramatically. They've experienced seamless digital experiences from companies like Apple and Amazon, and they expect the same from their financial advisor."
        sections={[
          {
            heading: "Instant Access, Anytime",
            content: "Gone are the days of waiting for quarterly reports in the mail. Today's HNW clients want real-time access to their portfolio, documents, and their advisor—all from their phone.",
          },
          {
            heading: "Proactive Communication",
            content: "Clients don't want to hear from you only when something goes wrong. They value advisors who reach out with insights, opportunities, and personalized updates before being asked.",
          },
          {
            heading: "Values Alignment",
            content: "Increasingly, wealthy clients want their money managed in ways that align with their values. ESG considerations and impact investing aren't just nice-to-haves anymore.",
          },
        ]}
      />
    ),
  },
  {
    category: "Productivity",
    title: "Reclaim 10 Hours a Week with Smart Automation",
    src: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=3544&auto=format&fit=crop",
    content: (
      <BlogContent
        title="Reclaim 10 Hours a Week with Smart Automation"
        excerpt="Time is your most valuable asset, yet most advisors spend countless hours on tasks that could be automated. Here's how to identify and eliminate the time-wasters holding you back."
        sections={[
          {
            heading: "Audit Your Calendar",
            content: "Spend one week tracking exactly where your time goes. You'll likely find that administrative tasks, scheduling, and follow-ups consume far more hours than you realized.",
          },
          {
            heading: "Automate the Repetitive",
            content: "If you do something more than twice, it's a candidate for automation. Meeting reminders, document requests, birthday messages, and review scheduling can all run on autopilot.",
          },
          {
            heading: "Protect Your High-Value Time",
            content: "Block time for client conversations and strategic thinking. Let automation handle everything else so your best hours go toward your highest-impact activities.",
          },
        ]}
      />
    ),
  },
];

const Blog: React.FC = () => {
  const { theme } = useTheme();

  const cards = blogPosts.map((post, index) => (
    <Card key={post.src} card={post} index={index} />
  ));

  return (
    <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Sparkles Background for Dark Mode */}
        {theme === 'dark' && (
          <div className="absolute inset-0 w-full h-full">
            <SparklesCore
              id="blog-sparkles"
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleCount={100}
              particleColor="#FFFFFF"
              speed={0.8}
              className="w-full h-full"
            />
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-main)] pointer-events-none z-10" />

        <div className="relative z-20 max-w-5xl mx-auto text-center px-6 pt-32 md:pt-24">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6 md:mb-8"
          >
            <div className={`relative inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest overflow-hidden ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {/* Shimmer border effect */}
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span
                  className="absolute inset-[-100%] animate-[shimmer_3s_linear_infinite]"
                  style={{
                    background: theme === 'dark'
                      ? 'conic-gradient(from 90deg at 50% 50%, #3b82f6 0%, transparent 50%, transparent 75%, #06b6d4 100%)'
                      : 'conic-gradient(from 90deg at 50% 50%, #2563eb 0%, transparent 50%, transparent 75%, #0891b2 100%)'
                  }}
                />
              </span>
              <span className={`absolute inset-[1.5px] rounded-full ${
                theme === 'dark' ? 'bg-[#020617]' : 'bg-white'
              }`} />
              <span className="relative z-10">Insights & Resources</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className={`text-3xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 md:mb-8 leading-[1.15] md:leading-[1.1] ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            The Nexli{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
              Blog
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-base md:text-xl leading-relaxed max-w-2xl mx-auto mb-8 ${
              theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
            }`}
          >
            Strategies, insights, and best practices for financial advisors ready to elevate their practice with modern technology.
          </motion.p>
        </div>
      </section>

      {/* Cards Carousel Section */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pl-4 md:pl-8 text-xl md:text-4xl font-bold text-[var(--text-main)] mb-4"
          >
            Latest Articles
          </motion.h2>
          <Carousel items={cards} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-6 md:p-16 rounded-[1.5rem] md:rounded-[3rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10 text-center">
            <h2 className="text-xl md:text-4xl font-bold text-[var(--text-main)] mb-4 md:mb-6">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-sm md:text-lg text-[var(--text-muted)] mb-6 md:mb-10 max-w-2xl mx-auto">
              Stop reading about success and start experiencing it. Book a consultation to see how Nexli can help you attract better clients and reclaim your time.
            </p>
            <a
              href="/#book"
              className="inline-flex items-center gap-2 md:gap-3 bg-blue-600 text-white px-6 md:px-10 py-3 md:py-5 rounded-full text-sm md:text-lg font-bold hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-600/25 active:scale-95 group"
            >
              Book a Consultation
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Blog;
