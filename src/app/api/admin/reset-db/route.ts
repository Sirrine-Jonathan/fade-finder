import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getSessionUser } from '@/lib/auth';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const session = await getSessionUser(request);

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
    const { stdout, stderr } = await execAsync('npm run db:reset', {
      env: {
        ...process.env,
        DATABASE_URL: dbUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Database successfully scrubbed and seeded!',
      stdout,
      stderr,
    });
  } catch (error: any) {
    console.error('API Admin Reset DB Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset database' },
      { status: 500 }
    );
  }
}
