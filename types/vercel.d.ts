import { VercelRequest } from '@vercel/node';

export interface AuthenticatedRequest extends VercelRequest {
  user: any;
  session: any;
}