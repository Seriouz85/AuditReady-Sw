import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { RequirementStatus } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const requirements = await prisma.requirement.findMany({
        include: {
          variables: true,
          history: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      });

      return res.status(200).json(requirements);
    } catch (error) {
      console.error('Error fetching requirements:', error);
      return res.status(500).json({ error: 'Failed to fetch requirements' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, description, category, status, variables } = req.body;

      const requirement = await prisma.requirement.create({
        data: {
          name,
          description,
          category,
          status: status as RequirementStatus,
          variables: {
            create: variables.map((v: { name: string; value: string }) => ({
              name: v.name,
              value: v.value
            }))
          },
          history: {
            create: {
              status: status as RequirementStatus,
              updatedBy: "system",
              comment: "Initial status"
            }
          }
        },
        include: {
          variables: true,
          history: true
        }
      });

      return res.status(201).json(requirement);
    } catch (error) {
      console.error('Error creating requirement:', error);
      return res.status(500).json({ error: 'Failed to create requirement' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, status, comment } = req.body;
      const requirement = await prisma.requirement.update({
        where: { id },
        data: {
          status: status as RequirementStatus,
          history: {
            create: {
              status: status as RequirementStatus,
              updatedBy: "system",
              comment: comment || "Status updated"
            }
          }
        },
        include: {
          variables: true,
          history: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      });

      return res.status(200).json(requirement);
    } catch (error) {
      console.error('Error updating requirement:', error);
      return res.status(500).json({ error: 'Failed to update requirement' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 