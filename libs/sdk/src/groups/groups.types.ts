import { Beneficiary } from '../beneficiary';

export type GroupInput = {
  name: string;
  isSystem: boolean;
};

export type ListGroup = {
  name: string;
  isSystem: boolean;
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
  isSystem: boolean;
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GroupBeneficiaryQuery = {
  page: number;
  perPage: number;
};

export type ListGroupBeneficiary = {
  name: string;
  uuid: string;
  id: number;
  beneficiariesGroup: [
    {
      beneficiary: Beneficiary;
    },
  ];
};

export type GroupResponseById = {
  id: number;
  uuid: string;
  beneficiaryId: number;
  groupId: number;
  createdAt: Date;
  updatedAt: Date;
  beneficiary: Beneficiary;
};

export type GroupPurge = {
  beneficiaryUuid: string[];
  groupUuid: string;
};

export type GroupMessage = {
  message: string;
  flag: string;
};

export type RemoveGroup = {
  uuid: string;
  deleteBeneficiaryFlag: boolean;
  beneficiaryUuid: string[];
};

export type ResultGroup = {
  message: string;
  success: boolean;
};
