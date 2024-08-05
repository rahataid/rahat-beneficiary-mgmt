import {
  Gender,
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
  TYPES_OF_SSA_TO_BE_RECEIVED,
} = REPORTING_FIELD;

const PHONE_NUMBER_PATTERN = '99900';

const LABEL_MAPPING = {
  no_of_female: 'Female',
  no_of_male: 'Male',
};

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

      if (key === 'createdAt') {
        const targetDate = filters[key];
        const startDate = new Date(targetDate + 'T00:00:00.000Z');
        const endDate = new Date(targetDate + 'T23:59:59.999Z');
        condition[key] = {
          gte: startDate,
          lte: endDate,
        };
      }

      AND_CONDITIONS.push(condition);
    }
  }

  if (AND_CONDITIONS.length > 0) {
    conditions = { AND: AND_CONDITIONS };
  }
  return conditions;
};

export const searchConditionQuery = (name: string) => {
  const regex = /\w{4,}\s/;
  const match = regex.exec(name);

  if (match) {
    const spaceIndex = match.index + match[0].length - 1;
    const firstName = name.substring(0, spaceIndex).trim();
    const lastName = name.substring(spaceIndex).trim();
    return { firstName, lastName };
  }

  return { firstName: name };
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

const hasKey = (myObj: any, key: string) => {
  return myObj.hasOwnProperty(key);
};

export const bankedUnbankedMapping = (data: any[]) => {
  let myData = {};

  for (let d of data) {
    const extras = d?.extras ?? null;
    if (
      extras &&
      hasKey(extras, REPORTING_FIELD.FAMILY_MEMBER_BANK_ACCOUNT) &&
      typeof extras[REPORTING_FIELD.FAMILY_MEMBER_BANK_ACCOUNT] === 'string' &&
      extras[REPORTING_FIELD.FAMILY_MEMBER_BANK_ACCOUNT]
        .toUpperCase()
        .trim() === 'YES'
    ) {
      if (myData['Banked']) {
        myData['Banked'] += 1;
      } else myData['Banked'] = 1;
    }
    if (
      extras &&
      extras &&
      hasKey(extras, REPORTING_FIELD.FAMILY_MEMBER_BANK_ACCOUNT) &&
      typeof extras[REPORTING_FIELD.FAMILY_MEMBER_BANK_ACCOUNT] === 'string' &&
      extras[REPORTING_FIELD.FAMILY_MEMBER_BANK_ACCOUNT]
        .toUpperCase()
        .trim() === 'NO'
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
    const extras = d?.extras ?? null;
    if (extras && extras[HOW_MANY_LACTATING]) {
      if (myData['Lactating']) {
        myData['Lactating'] += +extras[HOW_MANY_LACTATING];
      } else myData['Lactating'] = +extras[HOW_MANY_LACTATING];
    }
    if (extras && extras[HOW_MANY_PREGNANT]) {
      if (myData['Pregnant']) {
        myData['Pregnant'] += +extras[HOW_MANY_PREGNANT];
      } else myData['Pregnant'] = +extras[HOW_MANY_PREGNANT];
    }

    if (extras && extras[TYPE_OF_SSA_1]) {
      const label = extras[TYPE_OF_SSA_1];
      if (myData[label]) {
        myData[label] += 1;
      } else myData[label] = 1;
    }
    if (extras && extras[TYPE_OF_SSA_2]) {
      const label = extras[TYPE_OF_SSA_2];
      if (myData[label]) {
        myData[label] += 1;
      } else myData[label] = 1;
    }
    if (extras && extras[TYPE_OF_SSA_3]) {
      const label = extras[TYPE_OF_SSA_3];
      if (myData[label]) {
        myData[label] += 1;
      } else myData[label] = 1;
    }
  }
  return myData;
};

//====================Location based reporting (V2)===================

// Total Household
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
    const d = item?.extras ?? null;
    if (d && d[NO_OF_FEMALE]) {
      if (myData[NO_OF_FEMALE]) {
        const existing = Number(myData[NO_OF_FEMALE]);
        const latest = Number(d[NO_OF_FEMALE]);
        myData[NO_OF_FEMALE] = existing + latest;
      } else myData[NO_OF_FEMALE] = Number(d[NO_OF_FEMALE]);
    }
    if (d && d[NO_OF_MALE]) {
      if (myData[NO_OF_MALE]) {
        const existing = Number(myData[NO_OF_MALE]);
        const latest = Number(d[NO_OF_MALE]);
        myData[NO_OF_MALE] = existing + latest;
      } else myData[NO_OF_MALE] = Number(d[NO_OF_MALE]);
    }
    if (d && d[OTHERS]) {
      if (myData[OTHERS]) {
        const existing = Number(myData[OTHERS]);
        const latest = Number(d[OTHERS]);
        myData[OTHERS] = existing + latest;
      } else myData[OTHERS] = Number(d[OTHERS]);
    }
  }
  const sanitized = updateLabels(myData, LABEL_MAPPING);
  const data = createMyData(sanitized);
  return {
    name: 'TOTAL_WITH_GENDER',
    data,
  };
};

function updateLabels(obj: any, mapping: any) {
  // Iterate through the keys in the mapping
  Object.keys(mapping).forEach((key) => {
    // Check if the key exists in the object
    if (obj.hasOwnProperty(key)) {
      // Update the key with its corresponding label
      obj[mapping[key]] = obj[key];
      delete obj[key]; // Optionally, delete the original key
    }
  });
  return obj;
}

export const calculateTotalWithAgeGroup = (beneficiaries: any[]) => {
  if (!beneficiaries.length) return [];
  const result = beneficiaries.reduce((acc, obj) => {
    const extras = obj?.extras ?? null;
    if (!extras) return {};
    for (const [key, value] of Object.entries(extras)) {
      if (key && VALID_AGE_GROUP_KEYS.includes(key)) {
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

const createMyData = (myData: any) => {
  return Object.keys(myData).map((d) => ({
    id: d || 'Title',
    count: myData[d] || 0,
  }));
};

export const calculateVulnerabilityStatus = (beneficiaries: any[]) => {
  if (!beneficiaries.length) return [];
  let myData = mapVulnerabilityStatusCount(beneficiaries);
  const data = createMyData(myData);
  return {
    name: 'VULNERABIILTY_STATUS',
    data,
  };
};

const checkVulnerableHH = (extras: any) => {
  let hasVulnerable = false;
  if (!extras) return false;
  if (
    (extras[TYPE_OF_SSA_1] && extras[TYPE_OF_SSA_1] !== 'No') ||
    (extras[TYPE_OF_SSA_2] && extras[TYPE_OF_SSA_2] !== 'No') ||
    (extras[TYPE_OF_SSA_3] && extras[TYPE_OF_SSA_3] !== 'No') ||
    (extras[TYPES_OF_SSA_TO_BE_RECEIVED] &&
      extras[TYPES_OF_SSA_TO_BE_RECEIVED] !== 'No') ||
    (extras[HOW_MANY_LACTATING] && extras[HOW_MANY_LACTATING] !== 'No') ||
    (extras[HOW_MANY_PREGNANT] && extras[HOW_MANY_PREGNANT] !== 'No')
  ) {
    hasVulnerable = true;
  }
  return hasVulnerable;
};

export const totalVulnerableHH = (beneficiaries: any[]) => {
  let totalCount = 0;
  if (!beneficiaries.length) return [];
  for (let d of beneficiaries) {
    const { extras } = d;
    const vulnerable = checkVulnerableHH(extras);
    if (vulnerable) totalCount++;
    // if (extras && extras[TYPE_OF_SSA_1]) nonCountData.push(TYPE_OF_SSA_1);
    // if (extras && extras[TYPE_OF_SSA_2]) nonCountData.push(TYPE_OF_SSA_2);
    // if (extras && extras[TYPE_OF_SSA_3]) nonCountData.push(TYPE_OF_SSA_3);
    // if (extras && extras[TYPES_OF_SSA_TO_BE_RECEIVED])
    //   nonCountData.push(TYPES_OF_SSA_TO_BE_RECEIVED);
    // if (extras && extras[HOW_MANY_LACTATING])
    //   countData += +extras[HOW_MANY_LACTATING];
    // if (extras && extras[HOW_MANY_PREGNANT])
    //   countData += +extras[HOW_MANY_PREGNANT];
  }

  return {
    name: 'TOTAL_VULNERABLE_HOUSEHOLD',
    data: { count: totalCount },
  };
};

export const calculateExtraFieldStats = (
  beneficiaries: any[],
  fieldName: string,
  reportName: string,
) => {
  if (!beneficiaries) return [];
  const myData = {};
  beneficiaries.forEach((item: any) => {
    if (item.extras && item.extras[fieldName]) {
      const value = item.extras[fieldName];
      if (myData[value]) {
        myData[value] += 1;
      } else {
        myData[value] = 1;
      }
    }
  });
  const result = createMyData(myData);
  const data = result.filter((f) => f.id.toLocaleUpperCase() !== 'NO');
  return {
    name: reportName,
    data,
  };
};

export const calculatePhoneStats = (beneficiaries: any[]) => {
  if (!beneficiaries.length) return [];
  let myData = phoneUnphonedMapping(beneficiaries);
  const data = createMyData(myData);
  return {
    name: 'BENEFICIARY_PHONE_STATS',
    data,
  };
};

export const calculateBankStats = (beneficiaries: any[]) => {
  if (!beneficiaries.length) return [];
  const myData = bankedUnbankedMapping(beneficiaries);
  const data = createMyData(myData);
  return {
    name: 'BENEFICIARY_BANK_STATS',
    data: data,
  };
};

export const calculateQualifiedSSA = (beneficiaries: any[]) => {
  let ssa_data = [];
  if (!beneficiaries.length) return [];
  for (let d of beneficiaries) {
    const extras = d?.extras ?? null;
    if (extras && extras[TYPES_OF_SSA_TO_BE_RECEIVED])
      ssa_data.push(extras[TYPES_OF_SSA_TO_BE_RECEIVED]);
  }
  const mapped = mapSentenceCountFromArray(ssa_data);
  const data = mapped.filter((f) => f.id.toUpperCase() !== 'NO');
  return {
    name: 'SSA_NOT_RECEIVED_STATS',
    data,
  };
};

export const calculateHHGenderStats = (beneficiaries: any[]) => {
  if (!beneficiaries.length) return [];
  let myData = {};
  for (let b of beneficiaries) {
    if (b.gender === Gender.MALE) {
      if (myData[Gender.MALE]) {
        myData[Gender.MALE] += 1;
      } else myData[Gender.MALE] = 1;
    }
    if (b.gender === Gender.FEMALE) {
      if (myData[Gender.FEMALE]) {
        myData[Gender.FEMALE] += 1;
      } else myData[Gender.FEMALE] = 1;
    }
    if (b.gender === Gender.OTHER) {
      if (myData[Gender.OTHER]) {
        myData[Gender.OTHER] += 1;
      } else myData[Gender.OTHER] = 1;
    }
    if (b.gender === Gender.UKNOWN) {
      if (myData[Gender.UKNOWN]) {
        myData[Gender.UKNOWN] += 1;
      } else myData[Gender.UKNOWN] = 1;
    }
  }
  const data = createMyData(myData);
  return {
    name: 'BENEFICIARY_GENDER',
    data,
  };
};

export const calculateMapStats = (beneficiaries: any[]) => {
  if (!beneficiaries.length) return [];
  const data = beneficiaries.map((b) => {
    return {
      name: `${b.firstName} ${b.lastName}`,
      latitude: b.latitude || null,
      longitude: b.longitude || null,
    };
  });
  return {
    name: 'BENEFICIARY_MAP_STATS',
    data,
  };
};
