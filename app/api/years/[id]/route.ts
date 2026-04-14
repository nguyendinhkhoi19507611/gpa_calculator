import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Year from '@/lib/models/Year';
import Semester from '@/lib/models/Semester';
import Subject from '@/lib/models/Subject';
import { getSession } from '@/lib/session';
import { YearSchema } from '@/lib/definitions';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = YearSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    await dbConnect();

    const year = await Year.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { name: parsed.data.name },
      { new: true }
    );

    if (!year) {
      return NextResponse.json({ error: 'Không tìm thấy năm học' }, { status: 404 });
    }

    return NextResponse.json({ year });
  } catch (error) {
    console.error('Update year error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const year = await Year.findOneAndDelete({ _id: id, userId: session.userId });
    if (!year) {
      return NextResponse.json({ error: 'Không tìm thấy năm học' }, { status: 404 });
    }

    // Cascade delete semesters and subjects via yearId
    const semestersToDelete = await Semester.find({ yearId: id }).select('_id');
    const semIds = semestersToDelete.map(s => s._id);

    await Semester.deleteMany({ yearId: id });
    await Subject.deleteMany({ semesterId: { $in: semIds } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete year error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
