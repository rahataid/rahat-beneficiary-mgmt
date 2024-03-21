import { Beneficiary } from '../beneficiary';

export type GroupInput = {
  name: string;
};

export type ListGroup = {
  name: string;
  id: number;
  beneficiariesGroup: [
    {
      beneficiary: Beneficiary;
    },
  ];
};
export type GroupResponse = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type BeneficiariesGroup = {
  id: number;
  beneficiaryId: number;
  groupId: number;
  createdAt: Date;
  updatedAt: Date;
  beneficiary: Beneficiary;
};

export type GroupResponseById = BeneficiariesGroup[];
