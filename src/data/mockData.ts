
export const MOCK_DATA = {
  users: [
    { id: 'U001', name: 'Alice Wu', element: 'Wood', missing: 'Metal', subscription: 'Premium', lastLogin: '2023-10-25', status: 'Active', email: 'alice@example.com' },
    { id: 'U002', name: 'Bob Chen', element: 'Fire', missing: 'Water', subscription: 'Free', lastLogin: '2023-10-24', status: 'Active', email: 'bob@example.com' },
    { id: 'U003', name: 'Charlie Liu', element: 'Earth', missing: 'Wood', subscription: 'VIP', lastLogin: '2023-10-20', status: 'Inactive', email: 'charlie@example.com' },
    { id: 'U004', name: 'Diana Zhang', element: 'Metal', missing: 'Fire', subscription: 'Premium', lastLogin: '2023-10-25', status: 'Active', email: 'diana@example.com' },
    { id: 'U005', name: 'Evan Wang', element: 'Water', missing: 'Earth', subscription: 'Free', lastLogin: '2023-10-22', status: 'Suspended', email: 'evan@example.com' },
  ],
  profiles: [
    { id: 1, user: 'Alice Wu', dob: '1990-05-15', hour: '08:30', master: 'Wood', missing: 'Metal', direction: 'South-East', score: 85 },
    { id: 2, user: 'Bob Chen', dob: '1985-08-20', hour: '14:15', master: 'Fire', missing: 'Water', direction: 'South', score: 72 },
    { id: 3, user: 'Charlie Liu', dob: '1988-02-10', hour: '20:00', master: 'Earth', missing: 'Wood', direction: 'North-East', score: 90 },
  ],
  fortunes: [
    { id: 1, type: 'Daily', user: 'Alice Wu', date: '2023-10-26', summary: 'Excellent day for creativity.', sentiment: 'Positive' },
    { id: 2, type: 'Monthly', user: 'Bob Chen', date: '2023-11', summary: 'Be cautious with investments.', sentiment: 'Neutral' },
  ],
  subscriptions: [
    { id: 'SUB-001', user: 'Alice Wu', plan: 'Premium', status: 'Active', renewal: '2023-11-25', amount: 19.99 },
    { id: 'SUB-002', user: 'Charlie Liu', plan: 'VIP', status: 'Active', renewal: '2024-01-01', amount: 99.99 },
  ],
  notifications: [
     { id: 1, title: 'System Update', message: 'Platform maintenance scheduled for tonight.', date: '2023-10-25', read: false },
     { id: 2, title: 'New Feature', message: 'Yearly predictions are now available!', date: '2023-10-24', read: true },
  ],
  rules: [
    { id: 1, name: 'Main Door Direction', category: 'Exterior', description: 'Ensure the main door faces a lucky direction.', impact: 'High' },
    { id: 2, name: 'Bed Placement', category: 'Interior', description: 'Head should not point to the door.', impact: 'Critical' },
  ],
  plans: [
    { id: 1, name: 'Free Tier', price: '$0', duration: 'Forever', users: '1,250', features: ['Daily Fortune', 'Basic Profile'] },
    { id: 2, name: 'Premium Month', price: '$19.99', duration: 'Monthly', users: '450', features: ['Daily Fortune', 'Monthly Forecast', 'Wealth Tips', 'Ad Free'] },
    { id: 3, name: 'VIP Annual', price: '$99.99', duration: 'Yearly', users: '120', features: ['All Premium Features', 'Personal Consultant', 'Yearly Forecast', 'Remedies'] },
  ],
  reports: [
    { id: 1, name: 'Monthly Growth', date: '2023-10-01', type: 'Performance', status: 'Ready' },
    { id: 2, name: 'User Retention', date: '2023-10-15', type: 'Analytics', status: 'Ready' },
  ],
  placeholders: [
    { id: 'p1', text: 'A surprise awaits you in the north.', category: 'General', active: true },
    { id: 'p2', text: 'Wear red today to boost your luck.', category: 'General', active: true },
  ]
};
