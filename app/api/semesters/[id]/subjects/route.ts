import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subject from '@/lib/models/Subject';
import Semester from '@/lib/models/Semester';
import { getSession } from '@/lib/session';
import { SubjectSchema } from '@/lib/definitions';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: semesterId } = await params;
    const body = await request.json();
    const parsed = SubjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    await dbConnect();

    // Verify semester belongs to user
    const semester = await Semester.findOne({ _id: semesterId, userId: session.userId });
    if (!semester) {
      return NextResponse.json({ error: 'Không tìm thấy học kỳ' }, { status: 404 });
    }

    const subject = await Subject.create({
      ...parsed.data,
      semesterId,
      userId: session.userId,
    });

    return NextResponse.json({
      subject: {
        ...subject.toObject(),
        _id: subject._id.toString(),
        semesterId: subject.semesterId.toString(),
        userId: subject.userId.toString(),
      },
    });
  } catch (error) {
    console.error('Create subject error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
