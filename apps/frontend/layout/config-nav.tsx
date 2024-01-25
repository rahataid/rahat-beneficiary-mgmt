import { useMemo } from 'react';

export function useNavData() {
  const data = useMemo(
    () => [
      {
        title: 'Reporting',
        icon: '/assets/svg/reporting-icon.svg',
      },
      {
        title: 'Beneficiaries List',
        icon: '/assets/svg/beneficieries-icon.svg',
      },
      {
        title: 'Users',
        icon: '/assets/svg/users-icon.svg',
      },
    ],
    [],
  );
  return data;
}
