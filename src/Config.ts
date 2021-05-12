export const token: string = process.env.TOKEN;
export const prefix: string = '.';
export const owners: string[] = ['255009837002260482'];
export const lockdownRoles: string[] = [
  '351735832727781376', // everyone
  '356502105529253888', // Member
];
export const lockdownWhitelistRoles: string[] = [
  '351736867944923136', // MVP
  '360802264983666688', // Staff
];
export const primaryColor: string = '#2db7ff';
export const testChannel: string = '765964163054436422';
export const dbName: string = process.env.POSTGRES_DB;
export const dbUser: string = process.env.POSTGRES_USER;
export const dbPassword: string = process.env.POSTGRES_PASSWORD;
export const dbHost: string = process.env.POSTGRES_HOST;
export const dbPort: number = +process.env.POSTGRES_PORT;
