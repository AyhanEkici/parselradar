export function buildInvestorNotifications(input: {
  investorSignal?: string;
  opportunityScore?: number;
  volatilityIndex?: number;
  alertSignals?: string[];
}) {
  const notifications: Array<{ level: 'info' | 'watch' | 'action'; title: string; message: string }> = [];
  const signal = String(input.investorSignal || 'CAUTION').toUpperCase();

  if (signal === 'BULLISH') {
    notifications.push({
      level: 'action',
      title: 'Bullish setup detected',
      message: `Opportunity score ${input.opportunityScore || 0} with volatility ${input.volatilityIndex || 0}.`,
    });
  } else if (signal === 'WATCH') {
    notifications.push({
      level: 'watch',
      title: 'Watchlist condition',
      message: 'Momentum and heat are balanced; monitor connector freshness for next decision.',
    });
  } else {
    notifications.push({
      level: 'info',
      title: 'Caution signal',
      message: 'Risk-adjusted opportunity is limited under current deterministic inputs.',
    });
  }

  if ((input.alertSignals || []).includes('market_momentum_shift_detected')) {
    notifications.push({
      level: 'watch',
      title: 'Momentum shift',
      message: 'District momentum changed significantly versus baseline snapshot.',
    });
  }

  return notifications;
}
