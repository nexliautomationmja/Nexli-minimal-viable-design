'use client';

import VslFunnel from '../../components/VslFunnel';

export default function VslFunnelAdmin() {
  return (
    <VslFunnel
      variant="Admin"
      headline={
        <>
          What Happens to Your Firm If Your Admin{' '}
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Quits in 30 Days?
          </span>
        </>
      }
      subheadline={'Who chases the missing documents? Who answers the client calls? Who knows where everything is? If the honest answer is "I have no idea" — your firm doesn\'t have a people problem. It has a systems problem.'}
    />
  );
}
