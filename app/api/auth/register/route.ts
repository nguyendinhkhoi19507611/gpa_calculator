import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { SignupSchema } from '@/lib/definitions';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await dbConnect();

    const { name, email, password } = parsed.data;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: { email: ['Email đã được sử dụng'] } },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    // Create session
    await createSession(user._id.toString());

    return NextResponse.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
