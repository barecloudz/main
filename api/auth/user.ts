import { VercelRequest, VercelResponse } from '@vercel/node';
import { validateSession } from '../../lib/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authData = await validateSession(req);
    if (!authData) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { user } = authData;
    return res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}