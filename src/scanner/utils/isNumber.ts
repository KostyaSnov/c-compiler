const isNumber = (value: string): boolean => Boolean(Number(value)) || value === "0";


export default isNumber;