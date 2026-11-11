const { z } = require('zod');

const email = z.string('Email is required').trim().toLowerCase().pipe(z.email('Invalid email').max(255));

const newPassword = z
  .string('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'Password is too long');

const registerSchema = z.object({ email, password: newPassword });

const loginSchema = z.object({
  email,
  password: z.string('Password is required').min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };
