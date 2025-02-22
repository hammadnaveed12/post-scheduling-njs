import { z } from 'zod';

const PathsSchema = z.object({
  auth: z.object({
    signIn: z.string().min(1),
    signUp: z.string().min(1),
    verifyMfa: z.string().min(1),
    callback: z.string().min(1),
    passwordReset: z.string().min(1),
    passwordUpdate: z.string().min(1),
  }),
  app: z.object({
    home: z.string().min(1),
    newPost: z.string().min(1),
    drafts: z.string().min(1),
    scheduled: z.string().min(1),
    posted: z.string().min(1),
    accounts: z.string().min(1),
    profileSettings: z.string().min(1),
  }),
});

const pathsConfig = PathsSchema.parse({
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    verifyMfa: '/auth/verify',
    callback: '/auth/callback',
    passwordReset: '/auth/password-reset',
    passwordUpdate: '/update-password',
  },
  app: {
    home: '/home',
    newPost: '/home/new-post',
    drafts: '/home/drafts',
    scheduled: '/home/scheduled',
    posted: '/home/posted',
    accounts: '/home/accounts',
    profileSettings: '/home/settings',
  },
} satisfies z.infer<typeof PathsSchema>);

export default pathsConfig;
