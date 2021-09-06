import { ColorResolvable } from 'discord.js';

export const debug = Boolean(+process.env.DEBUG);
export const token: string = process.env.TOKEN;
export const prefix: string = debug ? ',' : '.';
export const owners: string[] = ['255009837002260482'];
export const lockdownRoles: string[] = [
  '351735832727781376', // everyone
  '356502105529253888', // Member
];
export const lockdownWhitelistRoles: string[] = [
  '351736867944923136', // MVP
  '360802264983666688', // Staff
];
export const primaryColor: ColorResolvable = debug ? '#4cff2d' : '#2db7ff';
export const testChannel = '765964163054436422';
export const dbName: string = process.env.POSTGRES_DB;
export const dbUser: string = process.env.POSTGRES_USER;
export const dbPassword: string = process.env.POSTGRES_PASSWORD;
export const dbHost: string = process.env.POSTGRES_HOST;
export const dbPort: number = +process.env.POSTGRES_PORT;
export const clientPort = 7777;
export const corsOptions = {
  origin: ['http://127.0.0.1:3333', 'https://gideon.koen02.nl'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};
export const gideonId = '363699842200895488';
export const gideonDevId = '460047335460962324';
