/**
 * @role: shared/lib
 * @rule: 열차명 표시 포맷 변환 순수 함수
 */

export const formatTrainGradeName = (name: string): string => {
  if (name.includes('산천')) {
    const prefix = name.split('-')[0];
    if (name.includes('A')) return `${prefix}-산천A`;
    if (name.includes('B')) return `${prefix}-산천B`;
    return `${prefix}-산천`;
  }
  return name;
};
