'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, X } from 'lucide-react';
import { useBooking } from './QualificationProvider';

const RevenueCalculator: React.FC = () => {
  const { openBooking } = useBooking();
  const [showResults, setShowResults] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs - SIMPLIFIED TO 3 QUESTIONS
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [adminHours, setAdminHours] = useState('');
  const [currentReviews, setCurrentReviews] = useState('');

  // Calculate growth opportunity using industry benchmarks
  const calculateOpportunity = () => {
    const revenue = parseFloat(annualRevenue) || 0;
    const hours = parseFloat(adminHours) || 0;
    const reviews = parseFloat(currentReviews) || 0;

    // Calculate implied hourly rate based on firm size
    let hourlyRate = 150;
    if (revenue > 1000000) hourlyRate = 200;
    else if (revenue > 500000) hourlyRate = 175;

    // Time waste cost
    const timeWasteCost = hours * hourlyRate * 52;

    // INDUSTRY BENCHMARK: Lost opportunity cost
    const estimatedInquiries = revenue < 500000 ? 8 : revenue < 1000000 ? 12 : 15;
    const avgClientValue = Math.max(revenue / 50, 3000);
    const conversionLoss = 0.27;
    const lostOpportunityCost = estimatedInquiries * conversionLoss * avgClientValue * 12;

    // Review gap impact
    const reviewGap = Math.max(0, 50 - reviews);
    const reviewImpact = reviewGap * 2400;

    // Total annual opportunity
    const totalOpportunity = timeWasteCost + lostOpportunityCost + reviewImpact;

    return {
      lostOpportunityCost,
      timeWasteCost,
      reviewImpact,
      totalOpportunity,
      reviewGap,
      estimatedInquiries,
      hourlyRate,
    };
  };

  const results = calculateOpportunity();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || submitting) return;
    setSubmitting(true);

    try {
      // Fire Meta Pixel lead event
      if (typeof (window as any).fbq === 'function') {
        (window as any).fbq('track', 'Lead', {
          content_name: 'Growth Opportunity Calculator',
          content_category: 'Lead Magnet',
          value: results.totalOpportunity,
        });
      }

      // Send to GHL webhook with calculator data
      await fetch('https://services.leadconnectorhq.com/hooks/aFlQmmyaRZncBaqSQz2L/webhook-trigger/d22e5d91-61de-46ac-ad9a-8e7a6e7a0fa1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          source: 'revenuecalc-page',
          lead_magnet: 'Growth Opportunity Calculator',
          annual_revenue: annualRevenue,
          admin_hours: adminHours,
          current_reviews: currentReviews,
          total_opportunity: results.totalOpportunity.toFixed(0),
          time_waste_cost: results.timeWasteCost.toFixed(0),
          lost_opportunity_cost: results.lostOpportunityCost.toFixed(0),
          review_impact: results.reviewImpact.toFixed(0),
        }),
      });

      setEmailCaptured(true);
    } catch {
      setEmailCaptured(true);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section className="relative min-h-screen py-14 sm:py-20 md:py-28 px-4" style={{ backgroundColor: '#0a1018' }}>
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] bg-red-500/8 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6 border" style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#ef4444' }} />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase" style={{ color: '#ef4444' }}>
              Free Revenue Diagnostic
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-3 sm:mb-4"
            style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
          >
            How Much Revenue Are You{' '}
            <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
              Bleeding?
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            See exactly how much growth you&apos;re leaving on the table with outdated systems. Takes 60 seconds.
          </p>
        </motion.div>

        {/* Calculator Form */}
        {!showResults ? (
          <motion.form
            onSubmit={handleCalculate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl sm:rounded-3xl border p-6 sm:p-8 md:p-10"
            style={{
              backgroundColor: 'rgba(15,23,42,0.6)',
              borderColor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="space-y-5 sm:space-y-6 mb-6 sm:mb-8">
              {/* Annual Revenue */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                  Current annual revenue
                </label>
                <input
                  type="number"
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(e.target.value)}
                  placeholder="e.g., 500000"
                  required
                  min="0"
                  className="w-full rounded-xl px-4 py-3 text-base font-medium outline-none transition-all"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffffff',
                  }}
                />
                <p className="mt-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Helps us calculate your firm's opportunity
                </p>
              </div>

              {/* Admin Hours */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                  Hours per week on manual tasks
                </label>
                <input
                  type="number"
                  value={adminHours}
                  onChange={(e) => setAdminHours(e.target.value)}
                  placeholder="e.g., 15"
                  required
                  min="0"
                  className="w-full rounded-xl px-4 py-3 text-base font-medium outline-none transition-all"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffffff',
                  }}
                />
                <p className="mt-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Email follow-ups, document collection, data entry, scheduling
                </p>
              </div>

              {/* Current Reviews */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                  Current Google reviews
                </label>
                <input
                  type="number"
                  value={currentReviews}
                  onChange={(e) => setCurrentReviews(e.target.value)}
                  placeholder="e.g., 12"
                  required
                  min="0"
                  className="w-full rounded-xl px-4 py-3 text-base font-medium outline-none transition-all"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffffff',
                  }}
                />
                <p className="mt-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Your competitors average 50+
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-8 py-4 rounded-xl text-base sm:text-lg font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              Calculate My Growth Opportunity
              <ArrowRight size={20} />
            </button>
          </motion.form>
        ) : (
          /* Results Display */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Total Opportunity - Hero Number */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center rounded-2xl sm:rounded-3xl border p-8 sm:p-10 md:p-12"
              style={{
                backgroundColor: 'rgba(239,68,68,0.05)',
                borderColor: 'rgba(239,68,68,0.2)',
              }}
            >
              <p className="text-sm sm:text-base font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Based on firms your size
              </p>
              <p
                className="text-5xl sm:text-6xl md:text-7xl font-black mb-3"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  background: 'linear-gradient(to right, #ef4444, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {formatCurrency(results.totalOpportunity)}
              </p>
              <p className="text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Annual growth opportunity with better systems
              </p>
            </motion.div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl sm:rounded-2xl border p-5 sm:p-6"
                style={{
                  backgroundColor: 'rgba(15,23,42,0.6)',
                  borderColor: 'rgba(239,68,68,0.2)',
                }}
              >
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Conversion Gap
                </p>
                <p className="text-2xl sm:text-3xl font-black mb-1" style={{ color: '#ef4444' }}>
                  {formatCurrency(results.lostOpportunityCost)}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  From slow follow-up (industry avg)
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-xl sm:rounded-2xl border p-5 sm:p-6"
                style={{
                  backgroundColor: 'rgba(15,23,42,0.6)',
                  borderColor: 'rgba(239,68,68,0.2)',
                }}
              >
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Time Recapture
                </p>
                <p className="text-2xl sm:text-3xl font-black mb-1" style={{ color: '#f97316' }}>
                  {formatCurrency(results.timeWasteCost)}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Value of automating manual work
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl sm:rounded-2xl border p-5 sm:p-6"
                style={{
                  backgroundColor: 'rgba(15,23,42,0.6)',
                  borderColor: 'rgba(239,68,68,0.2)',
                }}
              >
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Trust Deficit
                </p>
                <p className="text-2xl sm:text-3xl font-black mb-1" style={{ color: '#fb923c' }}>
                  {formatCurrency(results.reviewImpact)}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {results.reviewGap} reviews behind competitors
                </p>
              </motion.div>
            </div>

            {/* Email Capture */}
            {!emailCaptured ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl sm:rounded-3xl border p-6 sm:p-8"
                style={{
                  backgroundColor: 'rgba(15,23,42,0.8)',
                  borderColor: 'rgba(59,130,246,0.2)',
                }}
              >
                <h3 className="text-xl sm:text-2xl font-black mb-2" style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}>
                  Get Your Full Diagnostic Report
                </h3>
                <p className="text-sm sm:text-base mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Enter your info to receive a detailed breakdown + our proven playbook to capture this opportunity.
                </p>

                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      required
                      className="rounded-xl px-4 py-3 text-base font-medium outline-none"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#ffffff',
                      }}
                    />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      required
                      className="rounded-xl px-4 py-3 text-base font-medium outline-none"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#ffffff',
                      }}
                    />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Work email"
                    required
                    className="w-full rounded-xl px-4 py-3 text-base font-medium outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#ffffff',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-base font-bold cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Send My Report'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl sm:rounded-3xl border p-6 sm:p-8 text-center"
                style={{
                  backgroundColor: 'rgba(16,185,129,0.08)',
                  borderColor: 'rgba(16,185,129,0.2)',
                }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                  <TrendingUp size={32} style={{ color: '#10b981' }} />
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-2" style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}>
                  Check Your Inbox
                </h3>
                <p className="text-sm sm:text-base mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Your full diagnostic report is on its way. Now let&apos;s talk about capturing this opportunity.
                </p>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center pt-4"
            >
              <button
                onClick={openBooking}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-8 py-4 rounded-xl text-base sm:text-lg font-bold cursor-pointer transition-all"
              >
                Get Your Custom Strategy Session
                <ArrowRight size={20} />
              </button>
              <p className="mt-3 text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Book a call to see exactly how to capture this growth
              </p>
            </motion.div>

            {/* Recalculate */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <button
                onClick={() => setShowResults(false)}
                className="text-sm font-semibold underline cursor-pointer"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                Recalculate with different numbers
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default RevenueCalculator;
