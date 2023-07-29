export const parseStringToNumber = (str: string): number | undefined => {
  const num = Number(str);
  return !str || Number.isNaN(num) ? undefined : num;
};
