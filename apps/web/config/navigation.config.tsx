import { CheckCircle, Clock, FilePlus, Home, User, Users } from 'lucide-react';
import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const routes = [
  {
    label: 'common:routes.application',
    children: [
      {
        label: 'common:routes.home',
        path: pathsConfig.app.home,
        Icon: <Home className={iconClasses} />,
        end: true,
      },
    ],
  },
  {
    label: 'common:routes.settings',
    children: [
      {
        label: 'common:routes.profile',
        path: pathsConfig.app.profileSettings,
        Icon: <User className={iconClasses} />,
      },
    ],
  },
  {
    label: 'common:routes.posts',
    children: [
      {
        label: 'common:routes.newPost',
        path: pathsConfig.app.newPost,
        Icon: <FilePlus className={iconClasses} />,
      },
      {
        label: 'common:routes.drafts',
        path: pathsConfig.app.drafts,
        Icon: <Clock className={iconClasses} />,
      },
      {
        label: 'common:routes.scheduled',
        path: pathsConfig.app.scheduled,
        Icon: <Clock className={iconClasses} />,
      },
      {
        label: 'common:routes.posted',
        path: pathsConfig.app.posted,
        Icon: <CheckCircle className={iconClasses} />,
      },
    ],
  },
  {
    label: 'common:routes.accounts',
    children: [
      {
        label: 'common:routes.selectedAccounts',
        path: pathsConfig.app.accounts,
        Icon: <Users className={iconClasses} />,
      },
    ],
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

export const navigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_NAVIGATION_STYLE,
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
});
