import {
  REPORTING_FIELD,
  VALID_AGE_GROUP_KEYS,
} from '@rahataid/community-tool-sdk';

const {
  TYPE_OF_SSA_1,
  TYPE_OF_SSA_2,
  TYPE_OF_SSA_3,
  HOW_MANY_LACTATING,
  HOW_MANY_PREGNANT,
  NO_OF_FEMALE,
  NO_OF_MALE,
  OTHERS,
} = REPORTING_FIELD;

const PHONE_NUMBER_PATTERN = '99900';

export const filterExtraFieldValues = (main_query_result: any, extras: any) => {
  if (Object.keys(extras).length < 1) return main_query_result;

  const filteredArray = () => {
    return main_query_result.filter((item) => {
      return Object.keys(extras).every((key) => {
        const queryValues = extras[key]
          .split(',')
          .map((value) => value.trim())
          .filter((value) => value !== '');
        if (queryValues.length === 0) return true; // Don't filter if all query values are empty
        return queryValues.some((value) => item.extras[key] === value);
      });
    });
  };

  const result = filteredArray();
  return result;
};

export const createSearchQuery = (filters: any) => {
  const AND_CONDITIONS = [];
  const filtersKeys = Object.keys(filters);
  let conditions = {};

  for (const key of filtersKeys) {
    if (filters[key]) {
      let condition = {};

      if (key === 'firstName' || key === 'lastName' || key === 'location') {
        condition[key] = { contains: filters[key], mode: 'insensitive' };
      } else {
        if (filters[key].includes(',')) {
          // Multiple values
          const values = filters[key].split(',').map((value) => value.trim());
          condition[key] = { in: values };
        } else {
          condition[key] = filters[key]; // Single Value
        }
      }

      AND_CONDITIONS.push(condition);
    }
  }

  if (AND_CONDITIONS.length > 0) {
    conditions = { AND: AND_CONDITIONS };
  }
  return conditions;
};

export const mapSentenceCountFromArray = (data: string[]) => {
  const countMap = {} as any;
  data.forEach((sentence) => {
    if (countMap[sentence]) {
      countMap[sentence]++;
    } else {
      countMap[sentence] = 1;
    }
  });

  return Object.keys(countMap).map((sentence) => ({
    id: sentence,
    count: countMap[sentence],
  }));
};

export const bankedUnbankedMapping = (data: any[]) => {
  let myData = {};

  for (let d of data) {
    const { extras } = d as any;
    if (
      extras[REPORTING_FIELD.FAMILY_MEMBER_BANK_ACCOUNT] &&
      extras[REPORTING_FIELD.FAMILY_MEMBER_BANK_ACCOUNT].toUpperCase() === 'YES'
    ) {
      if (myData['Banked']) {
        myData['Banked'] += 1;
      } else myData['Banked'] = 1;
    }
    if (
      extras[REPORTING_FIELD.FAMILY_MEMBER_BANK_ACCOUNT] &&
      extras[REPORTING_FIELD.FAMILY_MEMBER_BANK_ACCOUNT].toUpperCase() === 'NO'
    ) {
      if (myData['UnBanked']) {
        myData['UnBanked'] += 1;
      } else myData['UnBanked'] = 1;
    }
  }
  return myData;
};

export const phoneUnphonedMapping = (data: any[]) => {
  let myData = {};
  for (let d of data) {
    const hasTrippleNine = d.phone.startsWith(PHONE_NUMBER_PATTERN);
    if (hasTrippleNine) {
      if (myData['Unphoned']) {
        myData['Unphoned'] += 1;
      } else {
        myData['Unphoned'] = 1;
      }
    } else {
      if (myData['Phoned']) {
        myData['Phoned'] += 1;
      } else {
        myData['Phoned'] = 1;
      }
    }
  }
  return myData;
};

export const mapVulnerabilityStatusCount = (data: any[]) => {
  let myData = {};
  for (let d of data) {
    const { extras } = d;
    if (extras[HOW_MANY_LACTATING]) {
      if (myData['Lactating']) {
        myData['Lactating'] += +extras[HOW_MANY_LACTATING];
      } else myData['Lactating'] = +extras[HOW_MANY_LACTATING];
    }
    if (extras[HOW_MANY_PREGNANT]) {
      if (myData['Pregnant']) {
        myData['Pregnant'] += +extras[HOW_MANY_PREGNANT];
      } else myData['Pregnant'] = +extras[HOW_MANY_PREGNANT];
    }

    if (extras[TYPE_OF_SSA_1]) {
      const label = extras[TYPE_OF_SSA_1];
      if (myData[label]) {
        myData[label] += 1;
      } else myData[label] = 1;
    }
    if (extras[TYPE_OF_SSA_2]) {
      const label = extras[TYPE_OF_SSA_2];
      if (myData[label]) {
        myData[label] += 1;
      } else myData[label] = 1;
    }
    if (extras[TYPE_OF_SSA_3]) {
      const label = extras[TYPE_OF_SSA_3];
      if (myData[label]) {
        myData[label] += 1;
      } else myData[label] = 1;
    }
  }
  return myData;
};

//====================Location based reporting (V2)===================

export const calculateTotalBenef = (beneficiaries: any[]) => {
  const data = { id: 'total', count: beneficiaries.length };
  return {
    name: 'BENEFICIARY_TOTAL',
    data: data,
  };
};

export const calculateTotalWithGender = (beneficiaries: any[]) => {
  let myData = {};
  if (!beneficiaries.length) return [];
  for (let item of beneficiaries) {
    const d = item.extras;
    if (d && d[NO_OF_MALE]) {
      if (myData[NO_OF_FEMALE]) {
        myData[NO_OF_FEMALE] += 1;
      } else myData[NO_OF_FEMALE] = 1;
    }
    if (d && d[NO_OF_MALE]) {
      if (myData[NO_OF_MALE]) {
        myData[NO_OF_MALE] += 1;
      } else myData[NO_OF_MALE] = 1;
    }
    if (d && d[OTHERS]) {
      if (myData[OTHERS]) {
        myData[OTHERS] += 1;
      } else myData[OTHERS] = 1;
    }
  }
  const data = Object.keys(myData).map((d) => ({
    id: d,
    count: myData[d],
  }));
  return {
    name: 'TOTAL_WITH_GENDER',
    data,
  };
};

export const calculateTotalWithAgeGroup = (beneficiaries: any[]) => {
  if (!beneficiaries.length) return [];
  const result = beneficiaries.reduce((acc, obj) => {
    for (const [key, value] of Object.entries(obj.extras)) {
      if (VALID_AGE_GROUP_KEYS.includes(key)) {
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += +value;
      }
    }
    return acc;
  }, {});

  const data = Object.entries(result).map(([key, value]) => {
    return { id: key, count: value };
  });
  return {
    name: 'TOTAL_BY_AGEGROUP',
    data,
  };
};

export const calculateVulnerabilityStatus = (beneficiaries: any[]) => {
  if (!beneficiaries.length) return [];
  let myData = mapVulnerabilityStatusCount(beneficiaries);
  const data = Object.keys(myData).map((d) => ({
    id: d,
    count: myData[d],
  }));
  return {
    name: 'VULNERABIILTY_STATUS',
    data,
  };
};
