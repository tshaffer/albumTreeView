export const serverUrl = 'http://localhost:8080';

export const apiUrlFragment = '/api/v1/';

export type StringToStringLUT = {
  [key: string]: string;
}

export type StringToStringArrayLUT = {
  [key: string]: string[];
}

export type StringToBooleanLUT = {
  [key: string]: boolean;
}

export type StringToNumberLUT = {
  [key: string]: number;
}

export type Dimensions = {
  width: number;
  height: number;
};