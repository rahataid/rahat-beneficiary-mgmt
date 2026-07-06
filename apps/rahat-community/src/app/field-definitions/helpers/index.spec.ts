import {
  convertStringsToFieldOptions,
  convertStringsToDropdownOptions,
  removeConsecutiveSpaces,
  OPTION_SEPARATOR,
} from './index';

describe('OPTION_SEPARATOR', () => {
  it('should be pipe character', () => {
    expect(OPTION_SEPARATOR).toBe('|');
  });
});

describe('convertStringsToFieldOptions', () => {
  it('should split by pipe separator', () => {
    const result = convertStringsToFieldOptions('Yes|No|Maybe');
    expect(result).toEqual({
      data: [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
        { label: 'Maybe', value: 'Maybe' },
      ],
    });
  });

  it('should preserve commas inside values', () => {
    const result = convertStringsToFieldOptions(
      '< NPR 10,000|NPR 10,000–20,000|> NPR 30,000',
    );
    expect(result.data).toHaveLength(3);
    expect(result.data[0]).toEqual({
      label: '< NPR 10,000',
      value: '< NPR 10,000',
    });
    expect(result.data[2]).toEqual({
      label: '> NPR 30,000',
      value: '> NPR 30,000',
    });
  });

  it('should trim extra whitespace from values', () => {
    const result = convertStringsToFieldOptions('  Yes  |  No  ');
    expect(result.data[0].value).toBe('Yes');
    expect(result.data[1].value).toBe('No');
  });

  it('should filter out empty segments from double pipes', () => {
    const result = convertStringsToFieldOptions('Yes||No');
    expect(result.data).toHaveLength(2);
    expect(result.data[0].value).toBe('Yes');
    expect(result.data[1].value).toBe('No');
  });

  it('should return null when all segments are empty', () => {
    const result = convertStringsToFieldOptions('||');
    expect(result).toBeNull();
  });

  it('should handle single value', () => {
    const result = convertStringsToFieldOptions('OnlyOption');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].value).toBe('OnlyOption');
  });

  it('should collapse consecutive spaces within values', () => {
    const result = convertStringsToFieldOptions('Hello   World|Foo   Bar');
    expect(result.data[0].value).toBe('Hello World');
    expect(result.data[1].value).toBe('Foo Bar');
  });
});

describe('convertStringsToDropdownOptions', () => {
  it('should be an alias for convertStringsToFieldOptions', () => {
    expect(convertStringsToDropdownOptions).toBe(convertStringsToFieldOptions);
  });
});

describe('removeConsecutiveSpaces', () => {
  it('should collapse multiple spaces to one', () => {
    expect(removeConsecutiveSpaces('hello   world')).toBe('hello world');
  });

  it('should trim leading and trailing whitespace', () => {
    expect(removeConsecutiveSpaces('  hello  ')).toBe('hello');
  });

  it('should leave single spaces intact', () => {
    expect(removeConsecutiveSpaces('hello world')).toBe('hello world');
  });
});
