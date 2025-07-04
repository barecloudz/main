import { parse } from 'cookie';
import { storage } from '../server/storage';

export interface SessionData {
  userId: string;
  role: 'admin' | 'client';
}

export function parseSession(cookieHeader: string | undefined): SessionData | null {
  if (!cookieHeader) return null;

  try {
    const cookies = parse(cookieHeader);
    const sessionToken = cookies.session;
    
    if (!sessionToken) return null;

    // Decode the base64 session token
    const sessionData = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf-8'));
    return sessionData;
  } catch (error) {
    console.error('Error parsing session:', error);
    return null;
  }
}

export async function validateSession(req: any): Promise<{ user: any; session: SessionData } | null> {
  const session = parseSession(req.headers.cookie);
  if (!session) return null;

  try {
    const user = await storage.getUser(session.userId);
    if (!user) return null;

    return { user, session };
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

export function requireAuth(handler: Function) {
  return async (req: any, res: any) => {
    const authData = await validateSession(req);
    if (!authData) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = authData.user;
    req.session = authData.session;
    return handler(req, res);
  };
}

export function requireAdmin(handler: Function) {
  return async (req: any, res: any) => {
    const authData = await validateSession(req);
    if (!authData || authData.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = authData.user;
    req.session = authData.session;
    return handler(req, res);
  };
}