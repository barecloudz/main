import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { requireAdmin } from '../lib/session';

export default requireAdmin(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const users = await storage.getUsers();
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
});