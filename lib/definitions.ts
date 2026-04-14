import { z } from 'zod';

export const SignupSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').trim(),
  email: z.string().email('Email không hợp lệ').trim().toLowerCase(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ').trim().toLowerCase(),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const YearSchema = z.object({
  name: z.string().min(1, 'Tên năm học không được để trống').trim(),
});

export const SemesterSchema = z.object({
  yearId: z.string().min(1, 'ID Năm học không được để trống'),
  name: z.string().min(1, 'Tên học kỳ không được để trống').trim(),
  targetCredits: z.number().min(1, 'Số tín chỉ dự kiến phải >= 1'),
});

export const SubjectSchema = z.object({
  name: z.string().min(1, 'Tên môn học không được để trống').trim(),
  credits: z.number().min(1, 'Số tín chỉ phải >= 1').max(30),
  grade10: z.number().min(0).max(10),
  grade4: z.number().min(0).max(4),
  letter: z.string(),
  type: z.string(),
  formula: z.string().optional().default(''),
  rawInputs: z.any().optional(),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type YearInput = z.infer<typeof YearSchema>;
export type SemesterInput = z.infer<typeof SemesterSchema>;
export type SubjectInput = z.infer<typeof SubjectSchema>;
