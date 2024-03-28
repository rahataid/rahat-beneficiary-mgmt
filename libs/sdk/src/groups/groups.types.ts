import { Beneficiary } from '../beneficiary';

export type GroupInput = {
  name: string;
};

export type ListGroup = {
  name: string;
  uuid: string;
  id: number;
  beneficiariesGroup: [
    {
      beneficiary: Beneficiary;
    },
  ];
};
export type GroupResponse = {
  uuid: string;
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type BeneficiariesGroup = {
  id: number;
  uuid: string;
  beneficiaryId: number;
  groupId: number;
  createdAt: Date;
  updatedAt: Date;
  beneficiary: Beneficiary;
};

export type GroupResponseById = BeneficiariesGroup[];
