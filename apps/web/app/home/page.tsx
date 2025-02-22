import { PageBody, PageHeader } from '@kit/ui/page';

import { DashboardDemo } from '~/home/_components/dashboard-demo';

export default function HomePage() {
  return (
    <>
      <PageHeader title={'Dashboard'} description={'Your SaaS at a glance'} />

      <PageBody>
        <DashboardDemo />
      </PageBody>
    </>
  );
}
