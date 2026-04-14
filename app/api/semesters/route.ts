import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Semester from '@/lib/models/Semester';
import Year from '@/lib/models/Year';
import { getSession } from '@/lib/session';
import { SemesterSchema } from '@/lib/definitions';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = SemesterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    await dbConnect();

    // Verify parent year belongs to user
    const year = await Year.findOne({ _id: parsed.data.yearId, userId: session.userId });
    if (!year) {
      return NextResponse.json({ error: 'Không tìm thấy năm học tương ứng' }, { status: 404 });
    }

    const lastSemester = await Semester.findOne({ yearId: year._id }).sort({ order: -1 });
    const order = lastSemester ? lastSemester.order + 1 : 0;

    const semester = await Semester.create({
      userId: session.userId,
      yearId: parsed.data.yearId,
      name: parsed.data.name,
      targetCredits: parsed.data.targetCredits,
      order,
    });

    return NextResponse.json({
      semester: {
        _id: semester._id.toString(),
        userId: semester.userId.toString(),
        yearId: semester.yearId.toString(),
        name: semester.name,
        targetCredits: semester.targetCredits,
        order: semester.order,
        createdAt: semester.createdAt,
        subjects: [],
      },
    });
  } catch (error) {
    console.error('Create semester error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
