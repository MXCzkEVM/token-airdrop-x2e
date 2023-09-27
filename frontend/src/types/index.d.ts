declare module '*.jpg';
declare module '*.jpeg';
declare module "*.png" {
    const path: string;
    export default path;
}