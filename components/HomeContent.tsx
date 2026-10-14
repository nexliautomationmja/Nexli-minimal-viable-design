'use client';

import React from 'react';
import Hero from './Hero';
import CardShredder from './CardShredder';
import ValueProposition from './ValueProposition';
import ClientComplaints from './ClientComplaints';
import BookingSection from './BookingSection';

const HomeContent: React.FC = () => {
  return (
    <>
      <Hero />
      <CardShredder />
      <ValueProposition />
      <ClientComplaints />
      <BookingSection />
    </>
  );
};

export default HomeContent;
