
import React from 'react';
import Layout from '@/components/Layout';

const VotingCenters = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gov-gray">Centres et Bureaux de Vote</h1>
          <p className="text-gray-600 mt-2">
            Annuaire détaillé de tous les lieux de vote physiques
          </p>
        </div>
        
        <div className="gov-card p-8 text-center">
          <p className="text-gray-500">Interface en cours de développement...</p>
        </div>
      </div>
    </Layout>
  );
};

export default VotingCenters;
