import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { requirementId, variableId } = req.query;

  if (req.method === 'PUT') {
    try {
      const { value } = req.body;
      const variable = await prisma.variable.update({
        where: { id: variableId as string },
        data: { value },
        include: {
          requirement: {
            include: {
              variables: true,
              history: {
                orderBy: {
                  createdAt: 'desc'
                },
                take: 1
              }
            }
          }
        }
      });

      return res.status(200).json(variable);
    } catch (error) {
      console.error('Error updating variable:', error);
      return res.status(500).json({ error: 'Failed to update variable' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 