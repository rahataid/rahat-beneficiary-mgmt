import { useMemo } from 'react';
import { paths } from '@/routes/paths';

export function useNavData() {
  const data = useMemo(
    () => [
      {
        title: 'Reporting',
        icon: '/assets/svg/reporting-icon.svg',
        path: paths.dashboard.root,
      },
      {
        title: 'Beneficiaries List',
        icon: '/assets/svg/beneficieries-icon.svg',
        path: paths.dashboard.general.beneficiary,
      },
      {
        title: 'Users',
        icon: '/assets/svg/users-icon.svg',
        path: paths.dashboard.general.user,
      },
    ],
    [],
  );
  return data;
}
