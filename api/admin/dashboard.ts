import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { requireAdmin } from '../../lib/session';

export default requireAdmin(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      // Get dashboard statistics
      const [users, contacts, marketingPlans, invoices] = await Promise.all([
        storage.getUsers(),
        storage.getContacts(),
        storage.getMarketingPlans(),
        storage.getInvoices()
      ]);

      const stats = {
        totalUsers: users.length,
        totalContacts: contacts.length,
        totalMarketingPlans: marketingPlans.length,
        totalInvoices: invoices.length,
        recentContacts: contacts.slice(0, 5),
        recentPlans: marketingPlans.slice(0, 5)
      };

      return res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
});