import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const { stdout, stderr } = await execAsync('npx prisma db push --force-reset && npx tsx prisma/seed.ts');
    return NextResponse.json({
      success: true,
      message: 'Database successfully scrubbed and seeded!',
      stdout,
      stderr,
    });
  } catch (error: any) {
    console.error('API Reset DB Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset database' },
      { status: 500 }
    );
  }
}
