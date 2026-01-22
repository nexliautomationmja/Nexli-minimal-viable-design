import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Bot, Zap, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const painPoints = [
  {
    id: "01",
    painTitle: "Your Website Says 'Fine.' Your Clients Expect Exceptional.",
    painDescription: "You didn't build a successful practice by being average. But when prospects visit your site, do they see the caliber of advisor who manages seven-figure portfolios—or just another template that looks like everyone else's?",
    statistic: "82%",
    statisticLabel: "of clients expect your digital presence to match Amazon and Netflix in quality",
    solutionTitle: "Premium Digital Presence That Commands Respect",
    solutionDescription: "We craft bespoke websites that communicate your expertise before you ever speak. Strategic design, compelling copy, and modern functionality that positions you as the obvious choice for discerning clients.",
    solutionBullets: [
      "Custom design that reflects your unique approach and philosophy",
      "Conversion-optimized layouts that turn visitors into consultations",
      "Mobile-first builds for the modern investor researching on the go"
    ],
    icon: <Monitor className="text-orange-500" size={32} />,
    color: "from-orange-500/20",
    video: "/videos/value-prop-1.mp4",
    image: "/logos/Nexli Value Prop 1 .png",
    mobileImage: "/logos/Nexli Value Prop 1-mobile.png"
  },
  {
    id: "02",
    painTitle: "You Became an Advisor to Help People—Not to Drown in Admin.",
    painDescription: "Every hour spent on meeting prep, follow-up emails, CRM updates, and scheduling is an hour you're not building relationships or growing your book. And when things slip through the cracks? That's when clients start looking elsewhere.",
    statistic: "30%",
    statisticLabel: "of investors would switch advisors due to poor communication and follow-up",
    solutionTitle: "AI Automations That Handle the Busywork",
    solutionDescription: "Reclaim 10-15 hours every week with intelligent automations that prep you for meetings, capture notes, update your CRM, and send personalized follow-ups—all without lifting a finger.",
    solutionBullets: [
      "Automated meeting prep with client history and talking points",
      "AI-powered notes that sync directly to your CRM",
      "Smart follow-up sequences that keep clients engaged"
    ],
    icon: <Bot className="text-blue-500" size={32} />,
    color: "from-blue-500/20",
    image: "/logos/Nexli Value Prop 2.png",
    mobileImage: "/logos/Nexli Value Prop 2-mobile.png"
  },
  {
    id: "03",
    painTitle: "Great Prospects Are Slipping Away Before You Even Meet Them.",
    painDescription: "By the time a prospect fills out your contact form, they've already visited 3 other advisors' sites. If your response time or onboarding process feels clunky, you've lost them to someone who made it easier.",
    statistic: "55%",
    statisticLabel: "of advisors say acquiring new clients is their biggest challenge",
    solutionTitle: "Automated Lead Capture & Nurturing",
    solutionDescription: "Turn website visitors into booked consultations with intelligent lead funnels that respond instantly, nurture prospects with value, and make scheduling frictionless.",
    solutionBullets: [
      "Instant response sequences that engage leads 24/7",
      "Automated nurture campaigns that build trust before the first call",
      "One-click scheduling integration with your calendar"
    ],
    icon: <Zap className="text-green-500" size={32} />,
    color: "from-green-500/20",
    image: "/logos/Nexli Value Prop Section 3.png",
    mobileImage: "/logos/Nexli Value Prop 3-mobile.png"
  }
];

const ValueProposition: React.FC = () => {
  return (
    <section className="py-12 md:py-32 bg-[var(--bg-main)] transition-colors duration-300" id="solutions">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 md:mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
          >
            <span className="text-blue-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">The Problems We Solve</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, ease: "circOut" }}
            className="text-[var(--text-main)] max-w-4xl mx-auto leading-tight text-2xl md:text-5xl lg:text-7xl font-bold"
          >
            We Solve the Structural Growth Issues That <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">Actually</span> Hold Your Practice Back
          </motion.h2>
        </div>

        <div className="space-y-20 md:space-y-48">
          {painPoints.map((point, idx) => (
            <motion.div
              key={point.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Content Side */}
              <div className={`space-y-6 md:space-y-10 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="text-4xl md:text-7xl font-black text-[var(--text-main)] opacity-5 select-none">{point.id}</span>
                    <div className="h-[1px] md:h-[2px] w-6 md:w-12 bg-blue-500/20" />
                    <span className="text-blue-400/80 text-[9px] md:text-xs font-black uppercase tracking-[0.2em]">The Inefficiency</span>
                  </div>
                  <h3 className="text-xl md:text-4xl font-bold text-[var(--text-main)] leading-tight">
                    {point.painTitle}
                  </h3>
                  <p className="text-[var(--text-muted)] leading-relaxed text-sm md:text-lg">
                    {point.painDescription}
                  </p>

                  <div className="flex items-center gap-3 md:gap-6 p-4 md:p-6 glass-card rounded-xl md:rounded-3xl border border-[var(--glass-border)]">
                    <div className="text-2xl md:text-4xl font-black text-blue-500">{point.statistic}</div>
                    <div className="h-8 md:h-10 w-[1px] bg-[var(--glass-border)]" />
                    <p className="text-[var(--text-muted)] text-[9px] md:text-xs font-bold leading-tight uppercase tracking-wide">{point.statisticLabel}</p>
                  </div>
                </div>

                <div className="glass-card p-5 md:p-10 rounded-2xl md:rounded-[40px] border border-[var(--glass-border)] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 mb-4 md:mb-6">
                    <div className="p-2 md:p-3 bg-blue-500/10 rounded-lg md:rounded-2xl border border-blue-500/20">
                      {React.cloneElement(point.icon as React.ReactElement, { size: 20, className: 'text-blue-400' })}
                    </div>
                    <div>
                      <span className="text-blue-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] block mb-1">The High-End Fix</span>
                      <h4 className="text-base md:text-xl font-bold text-[var(--text-main)]">{point.solutionTitle}</h4>
                    </div>
                  </div>
                  <p className="text-[var(--text-muted)] text-xs md:text-base leading-relaxed mb-6 md:mb-8">
                    {point.solutionDescription}
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {point.solutionBullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 md:gap-3 text-[var(--text-muted)] text-[10px] md:text-sm font-medium">
                        <CheckCircle className="text-blue-500 mt-0.5 flex-shrink-0" size={12} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Image/Video Side */}
              <div className={`relative ${idx % 2 === 1 ? 'lg:order-1' : ''} group`}>
                <div className={`relative rounded-2xl md:rounded-[40px] overflow-hidden border border-[var(--glass-border)] shadow-3xl ${(point as any).video ? 'aspect-square md:aspect-video lg:aspect-[4/3]' : 'aspect-[4/5] md:aspect-video lg:aspect-[4/3]'}`}>
                  {(point as any).video ? (
                    /* Video */
                    <video
                      src={(point as any).video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      {/* Desktop Image */}
                      <img
                        src={point.image}
                        alt={point.solutionTitle}
                        className="hidden md:block w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      {/* Mobile Image */}
                      <img
                        src={(point as any).mobileImage}
                        alt={point.solutionTitle}
                        className="block md:hidden w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-transparent to-transparent opacity-60 dark:opacity-60" />
                </div>
                {/* Visual Flair */}
                <div className={`absolute inset-0 bg-blue-500/5 blur-[80px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
