import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { LoginSchema } from '@/lib/definitions';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await dbConnect();

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    await createSession(user._id.toString());

    return NextResponse.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
