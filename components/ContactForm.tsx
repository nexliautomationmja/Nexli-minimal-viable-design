
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Clock, Users, TrendingUp, Send, ArrowRight, CheckCircle } from 'lucide-react';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    clientMeetings: 15,
    adminHoursPerMeeting: 25,
    missedFollowups: 3,
    name: '',
    email: '',
    firm: '',
    message: ''
  });

  const [showResults, setShowResults] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const calculations = useMemo(() => {
    const weeklyAdminHours = (formData.clientMeetings * formData.adminHoursPerMeeting) / 60;
    const monthlyAdminHours = weeklyAdminHours * 4;
    const hoursSavedWeekly = weeklyAdminHours * 0.8; // 80% reduction with automation
    const hoursSavedMonthly = hoursSavedWeekly * 4;
    const recapturedLeads = formData.missedFollowups * 0.6; // 60% of missed follow-ups converted
    const potentialNewClients = Math.round(recapturedLeads * 4 * 0.25); // 25% close rate monthly

    return {
      weeklyAdminHours: weeklyAdminHours.toFixed(1),
      monthlyAdminHours: monthlyAdminHours.toFixed(0),
      hoursSavedWeekly: hoursSavedWeekly.toFixed(1),
      hoursSavedMonthly: hoursSavedMonthly.toFixed(0),
      recapturedLeadsMonthly: Math.round(recapturedLeads * 4),
      potentialNewClients
    };
  }, [formData.clientMeetings, formData.adminHoursPerMeeting, formData.missedFollowups]);

  const handleCalculate = () => {
    setShowResults(true);
  };

  return (
    <section className="py-32 bg-[#020617]" id="calculator">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
          >
            <span className="text-blue-400 text-xs font-black tracking-[0.2em] uppercase">The Opportunity Cost</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, ease: "circOut" }}
            className="text-white mb-6"
          >
            Quantify the <span className="text-blue-500">Inefficiency</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 max-w-2xl mx-auto text-lg"
          >
            Discover the exact hours being drained by admin work—and the hidden revenue being lost to manual systems.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-10 md:p-16 rounded-[48px] border border-white/10 shadow-3xl"
        >
          {!showContactForm ? (
            <>
              {/* Calculator Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                {[
                  { label: "Client meetings / week", val: formData.clientMeetings, min: 5, max: 40, key: 'clientMeetings', icon: <Users size={20} />, color: 'blue' },
                  { label: "Admin mins / meeting", val: formData.adminHoursPerMeeting, min: 10, max: 45, key: 'adminHoursPerMeeting', step: 5, icon: <Clock size={20} />, color: 'blue' },
                  { label: "Leads lost / week", val: formData.missedFollowups, min: 0, max: 10, key: 'missedFollowups', icon: <TrendingUp size={20} />, color: 'blue' }
                ].map((input, i) => (
                  <div key={i} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <span className="text-blue-400">{input.icon}</span>
                      </div>
                      <label className="text-white font-bold text-sm uppercase tracking-wider">{input.label}</label>
                    </div>
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.step || 1}
                      value={input.val}
                      onChange={(e) => setFormData({ ...formData, [input.key]: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between items-end">
                      <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">{input.min}</span>
                      <span className="text-blue-400 font-black text-2xl">{input.val}{input.key === 'adminHoursPerMeeting' ? 'm' : ''}</span>
                      <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">{input.max}</span>
                    </div>
                  </div>
                ))}
              </div>

              {!showResults ? (
                <button
                  onClick={handleCalculate}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-600/20 active:scale-[0.98] uppercase tracking-widest text-sm"
                >
                  <Calculator size={18} />
                  Run Impact Audit
                </button>
              ) : (
                <>
                  {/* Results Display */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
                  >
                    {[
                      { val: calculations.hoursSavedMonthly, label: "Hours Reclaimed", sub: `${calculations.hoursSavedWeekly} hrs/week`, color: 'blue' },
                      { val: calculations.recapturedLeadsMonthly, label: "Leads Rescued", sub: "Via Smart Follow-ups", color: 'blue' },
                      { val: `+${calculations.potentialNewClients}`, label: "Projected Growth", sub: "Add'l Clients / Mo", color: 'blue' }
                    ].map((res, i) => (
                      <div key={i} className="glass-card p-10 rounded-[32px] border border-white/5 text-center group hover:border-blue-500/30 transition-colors">
                        <div className="text-5xl font-black text-white mb-3 group-hover:text-blue-500 transition-colors">
                          {res.val}
                        </div>
                        <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{res.label}</div>
                        <div className="text-white/20 text-[10px] font-bold italic">
                          {res.sub}
                        </div>
                      </div>
                    ))}
                  </motion.div>

                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-600/20 active:scale-[0.98] uppercase tracking-widest text-sm"
                  >
                    Build My Efficiency Roadmap
                    <ArrowRight size={18} />
                  </button>
                </>
              )}
            </>
          ) : (
            /* Contact Form */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-12">
                <h3 className="text-3xl font-black text-white mb-4">Request Your Custom Strategy</h3>
                <p className="text-white/40">Our team will review your calculator results and prep a personalized performance plan.</p>
              </div>

              <form className="space-y-8 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Work Email</label>
                    <input
                      type="email"
                      placeholder="john@yourfirm.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Firm or Practice Name</label>
                  <input
                    type="text"
                    placeholder="Smith Wealth Management"
                    value={formData.firm}
                    onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Current Biggest Scaling Bottleneck</label>
                  <textarea
                    rows={4}
                    placeholder="E.g., Website is outdated, admin is overwhelming, or lead follow-up is manual..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white focus:outline-none focus:border-blue-500 transition-all resize-none font-medium text-sm"
                  />
                </div>

                <button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-600/20 active:scale-[0.98] uppercase tracking-widest text-sm"
                >
                  <Send size={18} />
                  Secure Your Strategy Session
                </button>

                <p className="text-center text-white/20 text-[10px] font-black uppercase tracking-[0.1em]">
                  Elite Partners Only • NDA Guaranteed • RESPONSE IN 24H
                </p>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ContactForm;
