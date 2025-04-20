import { prisma } from '@/lib/prisma';
import { RequirementStatus, Requirement, Variable } from '@prisma/client';

export interface RequirementData extends Omit<Requirement, 'variables' | 'history'> {
  variables: Array<Variable>;
  history: Array<{
    id: string;
    status: RequirementStatus;
    comment: string | null;
    updatedBy: string;
    createdAt: Date;
  }>;
}

export const requirementService = {
  async getAllRequirements() {
    return await prisma.requirement.findMany({
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
  },

  async createRequirement(data: Omit<RequirementData, 'id' | 'createdAt' | 'lastUpdated'>) {
    return await prisma.requirement.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        status: data.status,
        variables: {
          create: data.variables.map(v => ({
            name: v.name,
            value: v.value
          }))
        },
        history: {
          create: {
            status: data.status,
            updatedBy: "system", // Replace with actual user ID from auth
            comment: "Initial status"
          }
        }
      },
      include: {
        variables: true,
        history: true
      }
    });
  },

  async updateRequirementStatus(id: string, status: RequirementStatus, comment?: string) {
    return await prisma.requirement.update({
      where: { id },
      data: {
        status,
        history: {
          create: {
            status,
            updatedBy: "system", // Replace with actual user ID from auth
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
  },

  async updateRequirementVariable(id: string, variableId: string, value: string) {
    return await prisma.variable.update({
      where: { id: variableId },
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
  }
}; 