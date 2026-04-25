'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, TrendingUp, CheckCircle2, AlertCircle, BarChart3, Star } from 'lucide-react';
import { useBooking } from './QualificationProvider';

type CalculatorState = 'input' | 'capture' | 'results';

const RevenueCalculator: React.FC = () => {
  const { openBooking } = useBooking();

  // State management
  const [currentState, setCurrentState] = useState<CalculatorState>('input');
  const [submitting, setSubmitting] = useState(false);

  // Form inputs - State 1
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [missedRequests, setMissedRequests] = useState('');
  const [currentReviews, setCurrentReviews] = useState('');

  // Form inputs - State 2
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');

  // Calculate all metrics with RESEARCH-BACKED FORMULAS
  const calculateMetrics = () => {
    const revenue = parseFloat(annualRevenue) || 0;
    const team = parseFloat(teamSize) || 0;
    const missed = parseFloat(missedRequests) || 0;
    const reviews = parseFloat(currentReviews) || 0;

    // 1. ANNUAL ADMIN COST (CLEAR)
    const wastedCapacityHours = team * 12; // 12 hrs/week per team member (conservative)
    const blendedRate = 175; // Industry benchmark blended rate
    const annualAdminCost = wastedCapacityHours * blendedRate * 52;

    // 2. 5-YEAR COMPOUNDING LOSS (CLEAR)
    const valuationMultiple = 1.2; // CPA firms sell at ~1.2x revenue
    const fiveYearLoss = annualAdminCost * 5 * valuationMultiple;

    // 3. GOOGLE REVIEW GAP (CLEAR - ACTUAL USER INPUT)
    const targetReviews =
      revenue < 500000 ? 50 :
      revenue < 1000000 ? 75 :
      revenue < 3000000 ? 100 : 150;

    const reviewGap = Math.max(0, targetReviews - reviews);

    // Discovery calls lost per month due to review gap
    const monthlySearches = 500; // Conservative for mid-market
    const clickShareGain = 0.23; // Moving from position #3 to #1 in Local Pack
    const discoveryCallsLost = Math.round(monthlySearches * clickShareGain * 0.18);

    // 4. CLIENT RETENTION RISK (BLURRED)
    // Base churn risk is 8%, scales with missed requests
    const retentionRiskMultiplier = Math.min(missed / 20, 1.5);
    const clientRetentionRisk = revenue * 0.08 * retentionRiskMultiplier;

    // Also calculate retention health grade
    const retentionGrade = missed <= 5 ? 'A' :
                          missed <= 10 ? 'B' :
                          missed <= 20 ? 'C' : 'D';

    // 5. MISSED ADVISORY REVENUE (BLURRED)
    // If half the wasted time went to advisory at $250/hr
    const advisoryHoursPotential = wastedCapacityHours / 2;
    const missedAdvisoryRevenue = advisoryHoursPotential * 250 * 52;

    // 6. TOTAL OPPORTUNITY SCORE (HEAVILY BLURRED)
    const totalOpportunity = annualAdminCost + clientRetentionRisk + missedAdvisoryRevenue;

    return {
      // Clear metrics
      annualAdminCost,
      fiveYearLoss,
      reviewGap,
      currentReviews: reviews,
      targetReviews,
      discoveryCallsLost,

      // Blurred metrics
      clientRetentionRisk,
      retentionGrade,
      missedAdvisoryRevenue,
      advisoryHoursPotential,
      totalOpportunity,

      // Supporting data
      wastedCapacityHours,
      blendedRate,
    };
  };

  const metrics = calculateMetrics();

  // State 1: Calculate button handler
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annualRevenue || !teamSize || !missedRequests || !currentReviews) return;
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
          content_name: 'Growth Ceiling Calculator',
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
          lead_magnet: 'Growth Ceiling Calculator',
          annual_revenue: annualRevenue,
          team_size: teamSize,
          missed_requests: missedRequests,
          current_reviews: currentReviews,
          annual_admin_cost: metrics.annualAdminCost.toFixed(0),
          five_year_loss: metrics.fiveYearLoss.toFixed(0),
          review_gap: metrics.reviewGap,
          target_reviews: metrics.targetReviews,
          discovery_calls_lost: metrics.discoveryCallsLost,
          client_retention_risk: metrics.clientRetentionRisk.toFixed(0),
          retention_grade: metrics.retentionGrade,
          missed_advisory_revenue: metrics.missedAdvisoryRevenue.toFixed(0),
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
    <section className="relative min-h-screen py-8 sm:py-12 md:py-16 lg:py-12 px-4" style={{ backgroundColor: '#0a1018' }}>
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] bg-orange-500/8 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] bg-blue-500/6 pointer-events-none" />

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
              <div className="text-center mb-6 sm:mb-8 lg:mb-6">
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  What's Your Firm's Growth Ceiling?
                </motion.h1>
                <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
                  Calculate how much additional revenue your firm could handle with optimized systems
                </p>
              </div>

              <motion.form
                onSubmit={handleCalculate}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-7 md:p-8 shadow-2xl"
              >
                <div className="space-y-5">
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

                  {/* Question 2: Team Size */}
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-white mb-2">
                      How many full-time team members do you have?
                    </label>
                    <p className="text-sm text-gray-400 mb-3">Include yourself, partners, and staff</p>
                    <div className="relative">
                      <input
                        type="number"
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        placeholder="5"
                        className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-lg focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">team members</span>
                    </div>
                  </div>

                  {/* Question 3: Missed Requests */}
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-white mb-2">
                      How many client requests/emails go unanswered each week?
                    </label>
                    <p className="text-sm text-gray-400 mb-3">
                      Calls missed, emails delayed 24+ hours, document requests pending
                    </p>
                    <div className="relative">
                      <input
                        type="number"
                        value={missedRequests}
                        onChange={(e) => setMissedRequests(e.target.value)}
                        placeholder="15"
                        className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-lg focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">per week</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Research shows 80% of prospects won't call back after being missed once
                    </p>
                  </div>

                  {/* Question 4: Current Google Reviews */}
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-white mb-2">
                      How many Google reviews does your firm currently have?
                    </label>
                    <p className="text-sm text-gray-400 mb-3">
                      Check your Google Business Profile or estimate
                    </p>
                    <div className="relative">
                      <input
                        type="number"
                        value={currentReviews}
                        onChange={(e) => setCurrentReviews(e.target.value)}
                        placeholder="25"
                        className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-lg focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">reviews</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-5 rounded-xl text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-600/25 flex items-center justify-center gap-3 mt-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Calculate My Growth Ceiling
                    <TrendingUp size={22} />
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
              <div className="text-center mb-6 sm:mb-8 lg:mb-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-6 py-3 mb-4"
                >
                  <AlertCircle className="text-orange-400" size={20} />
                  <span className="text-orange-300 font-semibold">Capacity Analysis Complete</span>
                </motion.div>

                <motion.h2
                  className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Your firm is wasting{' '}
                  <span
                    className="block mt-2 text-5xl sm:text-6xl md:text-7xl"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {formatCurrency(metrics.annualAdminCost)}
                  </span>
                  <span className="block mt-2 text-2xl sm:text-3xl text-gray-300">on manual admin tasks annually</span>
                </motion.h2>

                <motion.div
                  className="mt-5 mb-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-xl sm:text-2xl text-gray-300 mb-3">Plus you're</p>
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <svg width="120" height="40" viewBox="0 0 272 92" fill="none">
                      <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335"/>
                      <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05"/>
                      <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4"/>
                      <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853"/>
                      <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335"/>
                      <path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" fill="#4285F4"/>
                    </svg>
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FBBC05]">
                      {metrics.reviewGap}
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl text-gray-300">reviews behind competitors</p>
                  <p className="text-base sm:text-lg text-gray-400 mt-4">
                    Missing ~{metrics.discoveryCallsLost} discovery calls per month from lower search visibility
                  </p>
                </motion.div>

                <motion.p
                  className="text-lg text-gray-300 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Enter your details to unlock your complete capacity audit
                </motion.p>

                <motion.div
                  className="mt-6 inline-flex items-center gap-2 text-sm text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <BarChart3 size={16} />
                  <span>Based on {metrics.wastedCapacityHours} hrs/week at ${metrics.blendedRate}/hr blended rate</span>
                </motion.div>
              </div>

              <motion.form
                onSubmit={handleEmailSubmit}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-7 md:p-8 shadow-2xl max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="mb-5 text-center">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Unlock Your Full Capacity Audit
                  </h3>
                  <p className="text-gray-400">
                    See your 5-year firm value impact, client retention risk, missed advisory revenue, and complete growth potential
                  </p>
                </div>

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

          {/* STATE 3: RESULT REVEAL (Your Exact 6-Metric Structure) */}
          {currentState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-6 sm:mb-8 lg:mb-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-6 py-3 mb-4"
                >
                  <CheckCircle2 className="text-green-400" size={20} />
                  <span className="text-green-300 font-semibold">Complete Audit Unlocked</span>
                </motion.div>

                <motion.h2
                  className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-white"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Your Capacity Audit Report
                </motion.h2>

                <motion.p
                  className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Here's exactly what's holding your firm back from its next growth phase
                </motion.p>
              </div>

              {/* Metrics Dashboard - YOUR EXACT 6-METRIC STRUCTURE */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {/* 1. ANNUAL ADMIN COST (CLEAR) */}
                <div className="bg-gradient-to-br from-red-900/30 to-orange-900/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-red-200">Annual Admin Cost</h3>
                  </div>
                  <p className="text-4xl font-bold text-red-400 mb-2">
                    {formatCurrency(metrics.annualAdminCost)}
                  </p>
                  <p className="text-sm text-gray-400 mb-3">Wasted on manual tasks per year</p>
                  <div className="text-xs text-gray-500 bg-gray-800/50 rounded-lg p-3">
                    <p className="font-semibold text-gray-400 mb-1">📊 What's Causing This:</p>
                    <p>Manual client communication consuming {metrics.wastedCapacityHours} hrs/week of billable capacity</p>
                  </div>
                </div>

                {/* 2. 5-YEAR COMPOUNDING LOSS (CLEAR) */}
                <div className="bg-gradient-to-br from-red-900/30 to-orange-900/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-red-200">5-Year Compounding Loss</h3>
                  </div>
                  <p className="text-4xl font-bold text-red-400 mb-2">
                    {formatCurrency(metrics.fiveYearLoss)}
                  </p>
                  <p className="text-sm text-gray-400 mb-3">Total firm value impact over 5 years</p>
                  <div className="text-xs text-gray-500 bg-gray-800/50 rounded-lg p-3">
                    <p className="font-semibold text-gray-400 mb-1">💡 What This Means:</p>
                    <p>Calculated at 1.2x revenue valuation multiple — this is real enterprise value lost</p>
                  </div>
                </div>

                {/* 3. GOOGLE REVIEW GAP (CLEAR - NEW!) */}
                <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-blue-200">Google Review Gap</h3>
                    <div className="flex items-center gap-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-5xl sm:text-6xl md:text-7xl font-bold mb-2"
                     style={{
                       background: 'linear-gradient(135deg, #4285F4 0%, #34A853 35%, #FBBC05 65%, #EA4335 100%)',
                       WebkitBackgroundClip: 'text',
                       WebkitTextFillColor: 'transparent',
                       backgroundClip: 'text',
                     }}>
                    {metrics.reviewGap}
                  </p>
                  <p className="text-sm text-gray-400 mb-3">reviews behind top competitors</p>
                  <div className="text-xs text-gray-500 bg-gray-800/50 rounded-lg p-3">
                    <p className="font-semibold text-gray-400 mb-1">🎯 Impact:</p>
                    <p>You have {metrics.currentReviews} reviews vs. {metrics.targetReviews} target for firms your size — costing ~{metrics.discoveryCallsLost} discovery calls/month from lower Local Pack visibility</p>
                  </div>
                </div>

                {/* 4. CLIENT RETENTION RISK (BLURRED) */}
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 relative">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-300">Client Retention Risk</h3>
                    <Lock className="text-gray-500" size={20} />
                  </div>
                  <p className="text-4xl font-bold text-gray-400 mb-2 select-none" style={{ filter: 'blur(6px)' }}>
                    {formatCurrency(metrics.clientRetentionRisk)}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">Annual revenue at risk from responsiveness gaps</p>
                  <div className="text-xs text-gray-600 bg-gray-800/30 rounded-lg p-3">
                    <p className="font-semibold mb-1">🔒 Unlock on Call:</p>
                    <p>Retention Health Grade: {metrics.retentionGrade} — Moving to Grade A = 25% profit boost</p>
                  </div>
                </div>

                {/* 5. MISSED ADVISORY REVENUE (BLURRED) */}
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 relative">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-300">Missed Advisory Revenue</h3>
                    <Lock className="text-gray-500" size={20} />
                  </div>
                  <p className="text-4xl font-bold text-gray-400 mb-2 select-none" style={{ filter: 'blur(6px)' }}>
                    {formatCurrency(metrics.missedAdvisoryRevenue)}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">High-margin opportunity from freed capacity</p>
                  <div className="text-xs text-gray-600 bg-gray-800/30 rounded-lg p-3">
                    <p className="font-semibold mb-1">🔒 Unlock on Call:</p>
                    <p>If freed capacity redirected to advisory services at $250/hr (30-50% margins)</p>
                  </div>
                </div>

                {/* 6. TOTAL OPPORTUNITY SCORE (HEAVILY BLURRED) */}
                <div className="md:col-span-2 bg-gradient-to-br from-gray-900/70 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 relative">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-300">Total Growth Potential</h3>
                    <Lock className="text-gray-500" size={24} />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl text-gray-500">Your Total Opportunity:</span>
                    <p className="text-6xl font-bold text-gray-400 select-none" style={{ filter: 'blur(10px)' }}>
                      {formatCurrency(metrics.totalOpportunity)}
                    </p>
                  </div>
                  <p className="text-base text-gray-500 mt-4">
                    Complete capacity optimization + advisory migration + retention improvement — without hiring
                  </p>
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
                  Your Full Capacity Audit Has Been Sent
                </h3>
                <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                  Book your free capacity audit call to unlock the blurred metrics and walk through exactly where your bottlenecks are — plus get a custom roadmap to capture this growth in the next 90 days.
                </p>
                <motion.button
                  onClick={() => openBooking()}
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-10 py-5 rounded-xl text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Book Your Free Capacity Audit
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
