'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useBooking } from './QualificationProvider';

type CalculatorState = 'input' | 'capture' | 'results';

const RevenueCalculator: React.FC = () => {
  const { openBooking } = useBooking();

  // State management
  const [currentState, setCurrentState] = useState<CalculatorState>('input');
  const [submitting, setSubmitting] = useState(false);

  // Form inputs - State 1
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [adminHours, setAdminHours] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  // Form inputs - State 2
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');

  // Calculate all metrics
  const calculateMetrics = () => {
    const revenue = parseFloat(annualRevenue) || 0;
    const hours = parseFloat(adminHours) || 0;
    const rate = parseFloat(hourlyRate) || 0;

    const annualAdminCost = hours * rate * 52;
    const fiveYearLoss = annualAdminCost * 5;
    const clientRetentionRisk = revenue * 0.15;
    const missedAdvisoryCapacity = (hours / 5) * rate * 52;
    const totalOpportunity = annualAdminCost + clientRetentionRisk + missedAdvisoryCapacity;

    return {
      annualAdminCost,
      fiveYearLoss,
      clientRetentionRisk,
      missedAdvisoryCapacity,
      totalOpportunity,
    };
  };

  const metrics = calculateMetrics();

  // State 1: Calculate button handler
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annualRevenue || !adminHours || !hourlyRate) return;
    setCurrentState('capture');
  };

  // State 2: Email capture handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email || submitting) return;
    setSubmitting(true);

    try {
      // Fire Meta Pixel lead event
      if (typeof (window as any).fbq === 'function') {
        (window as any).fbq('track', 'Lead', {
          content_name: 'Revenue Leak Calculator',
          content_category: 'Lead Magnet',
          value: metrics.totalOpportunity,
        });
      }

      // Send to GHL webhook
      await fetch('https://services.leadconnectorhq.com/hooks/aFlQmmyaRZncBaqSQz2L/webhook-trigger/d22e5d91-61de-46ac-ad9a-8e7a6e7a0fa1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          email,
          source: 'revenuecalc-page',
          lead_magnet: 'Revenue Leak Calculator',
          annual_revenue: annualRevenue,
          admin_hours: adminHours,
          hourly_rate: hourlyRate,
          annual_admin_cost: metrics.annualAdminCost.toFixed(0),
          five_year_loss: metrics.fiveYearLoss.toFixed(0),
          client_retention_risk: metrics.clientRetentionRisk.toFixed(0),
          missed_advisory_capacity: metrics.missedAdvisoryCapacity.toFixed(0),
          total_opportunity: metrics.totalOpportunity.toFixed(0),
        }),
      });

      setCurrentState('results');
    } catch (error) {
      console.error('Failed to submit:', error);
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
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] bg-orange-500/6 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* STATE 1: INPUT FORM */}
          {currentState === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-10 sm:mb-14">
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #f06595 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Calculate Your Firm's Revenue Leak
                </motion.h1>
                <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
                  See exactly how much growth your firm is leaving on the table with outdated systems
                </p>
              </div>

              <motion.form
                onSubmit={handleCalculate}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl"
              >
                <div className="space-y-6">
                  {/* Question 1: Annual Revenue */}
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-white mb-3">
                      What is your firm's annual revenue?
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                      <input
                        type="number"
                        value={annualRevenue}
                        onChange={(e) => setAnnualRevenue(e.target.value)}
                        placeholder="500000"
                        className="w-full pl-8 pr-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-lg focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Question 2: Admin Hours */}
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-white mb-2">
                      How many hours per week does your team spend on manual admin tasks?
                    </label>
                    <p className="text-sm text-gray-400 mb-3">Email follow-ups, document collection, data entry, scheduling</p>
                    <div className="relative">
                      <input
                        type="number"
                        value={adminHours}
                        onChange={(e) => setAdminHours(e.target.value)}
                        placeholder="15"
                        className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-lg focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">hours/week</span>
                    </div>
                  </div>

                  {/* Question 3: Hourly Billing Rate */}
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-white mb-3">
                      What is your average hourly billing rate?
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="250"
                        className="w-full pl-8 pr-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-lg focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">/hour</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-5 rounded-xl text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-600/25 flex items-center justify-center gap-3 mt-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Calculate My Growth Opportunity
                    <ArrowRight size={22} />
                  </motion.button>
                </div>
              </motion.form>
            </motion.div>
          )}

          {/* STATE 2: LEAD CAPTURE GATE */}
          {currentState === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-10 sm:mb-14">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-6 py-3 mb-6"
                >
                  <AlertCircle className="text-red-400" size={20} />
                  <span className="text-red-300 font-semibold">Revenue Leak Detected</span>
                </motion.div>

                <motion.h2
                  className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Your firm has an estimated{' '}
                  <span
                    className="block mt-2 text-5xl sm:text-6xl md:text-7xl"
                    style={{
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #f06595 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {formatCurrency(metrics.annualAdminCost)}
                  </span>
                  <span className="block mt-2 text-2xl sm:text-3xl text-gray-300">revenue leak</span>
                </motion.h2>

                <motion.p
                  className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Enter your details to unlock your full personalized Revenue Leak Report and see exactly where you are losing money.
                </motion.p>
              </div>

              <motion.form
                onSubmit={handleEmailSubmit}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="space-y-5">
                  {/* First Name */}
                  <div>
                    <label className="block text-base font-semibold text-white mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      required
                    />
                  </div>

                  {/* Work Email */}
                  <div>
                    <label className="block text-base font-semibold text-white mb-2">
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@yourfirm.com"
                      className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      required
                    />
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-5 rounded-xl text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center gap-3 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                  >
                    {submitting ? 'Unlocking...' : 'Unlock My Full Report'}
                    <ArrowRight size={22} />
                  </motion.button>
                </div>
              </motion.form>
            </motion.div>
          )}

          {/* STATE 3: RESULT REVEAL (Strategic Blurring) */}
          {currentState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-10 sm:mb-14">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-6 py-3 mb-6"
                >
                  <CheckCircle2 className="text-green-400" size={20} />
                  <span className="text-green-300 font-semibold">Report Unlocked</span>
                </motion.div>

                <motion.h2
                  className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Your Revenue Leak Report
                </motion.h2>

                <motion.p
                  className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Here's what your firm is losing to inefficient systems
                </motion.p>
              </div>

              {/* Metrics Dashboard */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {/* Metric 1: Annual Admin Cost (CLEAR) */}
                <div className="bg-gradient-to-br from-red-900/30 to-orange-900/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-red-200">Annual Admin Cost</h3>
                  </div>
                  <p className="text-4xl font-bold text-red-400 mb-2">
                    {formatCurrency(metrics.annualAdminCost)}
                  </p>
                  <p className="text-sm text-gray-400">Wasted on manual tasks per year</p>
                </div>

                {/* Metric 2: 5-Year Compounding Loss (CLEAR) */}
                <div className="bg-gradient-to-br from-red-900/30 to-orange-900/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-red-200">5-Year Compounding Loss</h3>
                  </div>
                  <p className="text-4xl font-bold text-red-400 mb-2">
                    {formatCurrency(metrics.fiveYearLoss)}
                  </p>
                  <p className="text-sm text-gray-400">Total impact over 5 years</p>
                </div>

                {/* Metric 3: Client Retention Risk (BLURRED) */}
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 relative">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-300">Client Retention Risk</h3>
                    <Lock className="text-gray-500" size={20} />
                  </div>
                  <p className="text-4xl font-bold text-gray-400 mb-2 select-none" style={{ filter: 'blur(6px)' }}>
                    {formatCurrency(metrics.clientRetentionRisk)}
                  </p>
                  <p className="text-sm text-gray-500">Annual revenue at risk</p>
                </div>

                {/* Metric 4: Missed Advisory Capacity (BLURRED) */}
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 relative">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-300">Missed Advisory Capacity</h3>
                    <Lock className="text-gray-500" size={20} />
                  </div>
                  <p className="text-4xl font-bold text-gray-400 mb-2 select-none" style={{ filter: 'blur(6px)' }}>
                    {formatCurrency(metrics.missedAdvisoryCapacity)}
                  </p>
                  <p className="text-sm text-gray-500">Lost advisory opportunity</p>
                </div>

                {/* Metric 5: Total Opportunity Score (HEAVILY BLURRED) */}
                <div className="md:col-span-2 bg-gradient-to-br from-gray-900/70 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 relative">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-300">Total Opportunity Score</h3>
                    <Lock className="text-gray-500" size={24} />
                  </div>
                  <p className="text-6xl font-bold text-gray-400 mb-3 select-none" style={{ filter: 'blur(10px)' }}>
                    {formatCurrency(metrics.totalOpportunity)}
                  </p>
                  <p className="text-base text-gray-500">Complete growth potential unlocked with optimization</p>
                </div>
              </motion.div>

              {/* Final CTA */}
              <motion.div
                className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <CheckCircle2 className="text-blue-400 mx-auto mb-4" size={48} />
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Your Full Revenue Leak Report Has Been Sent
                </h3>
                <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                  Book your free firm audit to walk through every number with our team and unlock your complete breakdown.
                </p>
                <motion.button
                  onClick={() => openBooking()}
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-10 py-5 rounded-xl text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  See If Your Firm Qualifies
                  <TrendingUp size={24} />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default RevenueCalculator;
