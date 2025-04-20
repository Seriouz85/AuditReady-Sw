import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequirementStatus } from "@prisma/client";

export async function GET() {
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

    return NextResponse.json(requirements);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, category, status, variables } = body;

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

    return NextResponse.json(requirement);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create requirement" },
      { status: 500 }
    );
  }
} 