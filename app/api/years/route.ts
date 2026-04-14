import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Year from '@/lib/models/Year';
import Semester from '@/lib/models/Semester';
import Subject from '@/lib/models/Subject';
import { getSession } from '@/lib/session';
import { YearSchema } from '@/lib/definitions';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    // Fetch all related data
    const years = await Year.find({ userId: session.userId }).sort({ order: 1, createdAt: 1 }).lean();
    const semesters = await Semester.find({ userId: session.userId }).sort({ order: 1, createdAt: 1 }).lean();
    
    const semIds = semesters.map(s => s._id);
    const subjects = await Subject.find({ semesterId: { $in: semIds } }).lean();

    // Group subjects into semesters
    const semestersWithSubs = semesters.map(sem => ({
      ...sem,
      _id: sem._id.toString(),
      yearId: sem.yearId.toString(),
      userId: sem.userId.toString(),
      subjects: subjects
        .filter(sub => sub.semesterId.toString() === sem._id.toString())
        .map(sub => ({
          ...sub,
          _id: sub._id.toString(),
          semesterId: sub.semesterId.toString(),
          userId: sub.userId.toString(),
        })),
    }));

    // Group semesters into years
    const result = years.map(y => ({
      ...y,
      _id: y._id.toString(),
      userId: y.userId.toString(),
      semesters: semestersWithSubs.filter(sem => sem.yearId === y._id.toString())
    }));

    return NextResponse.json({ years: result });
  } catch (error) {
    console.error('Get years error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = YearSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    await dbConnect();

    const lastYear = await Year.findOne({ userId: session.userId }).sort({ order: -1 });
    const order = lastYear ? lastYear.order + 1 : 0;

    const year = await Year.create({
      userId: session.userId,
      name: parsed.data.name,
      order,
    });

    return NextResponse.json({
      year: {
        _id: year._id.toString(),
        userId: year.userId.toString(),
        name: year.name,
        order: year.order,
        createdAt: year.createdAt,
        semesters: [],
      },
    });
  } catch (error) {
    console.error('Create year error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
