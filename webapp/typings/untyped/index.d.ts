declare module "*.json" {
  const value: any;
  export default value;
}

declare module "*.less" {
  const value: any;
  export default value;
}

declare type valueof<T> = T[keyof T]
declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
