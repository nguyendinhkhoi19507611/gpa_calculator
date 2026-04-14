import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Semester from '@/lib/models/Semester';
import Subject from '@/lib/models/Subject';
import { getSession } from '@/lib/session';
import { SemesterSchema } from '@/lib/definitions';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = SemesterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    await dbConnect();

    const semester = await Semester.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { name: parsed.data.name },
      { new: true }
    );

    if (!semester) {
      return NextResponse.json({ error: 'Không tìm thấy học kỳ' }, { status: 404 });
    }

    return NextResponse.json({ semester });
  } catch (error) {
    console.error('Update semester error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const semester = await Semester.findOneAndDelete({ _id: id, userId: session.userId });
    if (!semester) {
      return NextResponse.json({ error: 'Không tìm thấy học kỳ' }, { status: 404 });
    }

    // Delete all subjects in this semester
    await Subject.deleteMany({ semesterId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete semester error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
