import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subject from '@/lib/models/Subject';
import Semester from '@/lib/models/Semester';
import { getSession } from '@/lib/session';
import { SubjectSchema } from '@/lib/definitions';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; subjectId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { subjectId } = await params;
    await dbConnect();

    const subject = await Subject.findOneAndDelete({
      _id: subjectId,
      userId: session.userId,
    });

    if (!subject) {
      return NextResponse.json({ error: 'Không tìm thấy môn học' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete subject error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}



export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subjectId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: semesterId, subjectId } = await params;
    const body = await request.json();
    const parsed = SubjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    await dbConnect();

    const semester = await Semester.findOne({ _id: semesterId, userId: session.userId });
    if (!semester) {
      return NextResponse.json({ error: 'Không tìm thấy học kỳ' }, { status: 404 });
    }

    const subject = await Subject.findOneAndUpdate(
      { _id: subjectId, semesterId, userId: session.userId },
      { $set: parsed.data },
      { new: true }
    );

    if (!subject) {
      return NextResponse.json({ error: 'Không tìm thấy môn học' }, { status: 404 });
    }

    return NextResponse.json({
      subject: {
        ...subject.toObject(),
        _id: subject._id.toString(),
        semesterId: subject.semesterId.toString(),
        userId: subject.userId.toString(),
      },
    });
  } catch (error) {
    console.error('Update subject error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
