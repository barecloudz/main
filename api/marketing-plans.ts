import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertMarketingPlanSchema } from '../shared/schema';
import { generateMarketingPlan } from '../server/openai';
import { requireAuth } from '../lib/session';
import { AuthenticatedRequest } from '../types/vercel';

export default requireAuth(async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const plans = await storage.getMarketingPlans();
      return res.status(200).json(plans);
    } catch (error) {
      console.error('Error fetching marketing plans:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { businessType, goalsPrimary, audience, budget, timeline, clientName, ...otherParams } = req.body;
      
      // Generate marketing plan using OpenAI
      const generatedPlan = await generateMarketingPlan({
        businessType,
        goalsPrimary,
        audience,
        budget,
        timeline,
        ...otherParams
      }, clientName);

      // Save to database
      const planData = {
        title: `Marketing Plan for ${clientName}`,
        businessType,
        goalsPrimary,
        audience,
        budget,
        timeline,
        content: JSON.stringify(generatedPlan),
        userId: (req as any).user.id
      };

      const validatedData = insertMarketingPlanSchema.parse(planData);
      const plan = await storage.createMarketingPlan(validatedData);
      
      return res.status(201).json(plan);
    } catch (error) {
      console.error('Error creating marketing plan:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
});