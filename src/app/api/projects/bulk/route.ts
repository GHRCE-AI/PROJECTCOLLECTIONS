import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/mongoose/mongoose';
import Project from '@/models/Project';
import { bulkProjectSchema } from '@/lib/validations/bulkValidations';

const BATCH_SIZE = 10;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const rawProjects = Array.isArray(body.projects) ? body.projects : [];

    if (rawProjects.length === 0) {
      return NextResponse.json(
        { error: 'No projects provided for import' },
        { status: 400 }
      );
    }

    if (rawProjects.length > 200) {
      return NextResponse.json(
        { error: 'Cannot import more than 200 projects at once' },
        { status: 400 }
      );
    }

    await dbConnect();

    const results: {
      inserted: number;
      failed: { index: number; title: string; errors: string[] }[];
      total: number;
    } = {
      inserted: 0,
      failed: [],
      total: rawProjects.length,
    };

    // Pre-validate all projects and separate them into valid & invalid
    const validProjectsWithIndex: { project: any; index: number }[] = [];

    rawProjects.forEach((proj: any, index: number) => {
      const parsed = bulkProjectSchema.safeParse(proj);
      if (!parsed.success) {
        // Flatten error messages to simple string format
        const errorList: string[] = [];
        const fieldErrors = parsed.error.flatten().fieldErrors;
        Object.entries(fieldErrors).forEach(([field, msgs]) => {
          if (msgs) {
            errorList.push(`${field}: ${msgs.join(', ')}`);
          }
        });

        results.failed.push({
          index,
          title: proj.title || `Project #${index + 1}`,
          errors: errorList.length > 0 ? errorList : ['Validation failed'],
        });
      } else {
        validProjectsWithIndex.push({
          project: parsed.data,
          index,
        });
      }
    });

    // Process valid projects in batches
    for (let i = 0; i < validProjectsWithIndex.length; i += BATCH_SIZE) {
      const batchWithIndex = validProjectsWithIndex.slice(i, i + BATCH_SIZE);
      const batchDocs = batchWithIndex.map((item) => ({
        ...item.project,
        createdBy: session.user.id,
      }));

      try {
        const insertResult = await Project.insertMany(batchDocs, {
          ordered: false,
        });
        results.inserted += insertResult.length;
      } catch (bulkError: any) {
        if (bulkError.insertedDocs) {
          results.inserted += bulkError.insertedDocs.length;
        }

        if (bulkError.writeErrors) {
          for (const writeErr of bulkError.writeErrors) {
            const item = batchWithIndex[writeErr.index];
            if (item) {
              results.failed.push({
                index: item.index,
                title: item.project.title || 'Unknown',
                errors: [writeErr.errmsg || 'Database insertion failed'],
              });
            }
          }
        } else {
          // If it's a general batch write error, fail the batch items
          for (const item of batchWithIndex) {
            results.failed.push({
              index: item.index,
              title: item.project.title || 'Unknown',
              errors: [bulkError.message || 'Batch insertion failed'],
            });
          }
        }
      }
    }

    // Sort failed results by index so they align with original request
    results.failed.sort((a, b) => a.index - b.index);

    return NextResponse.json(results, {
      status: results.failed.length > 0 ? 207 : 201,
    });
  } catch (error) {
    console.error('POST /api/projects/bulk error:', error);
    return NextResponse.json(
      { error: 'Failed to bulk import projects' },
      { status: 500 }
    );
  }
}
