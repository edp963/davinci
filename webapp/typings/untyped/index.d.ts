declare module "*.json" {
  const value: any;
  export default value;
}

declare module "*.less" {
  const value: any;
  export default value;
}

declare module "*.png" {
  const value: any;
  export default value
}

declare type valueof<T> = T[keyof T]
