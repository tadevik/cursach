export function getTimeFromSeconds(seconds: number) {
  if (Number.isNaN(seconds)) return '';
  const datestr = new Date(Math.floor(seconds * 1000))
    .toISOString()
    .substring(11, 19);
  if (datestr.substring(0, 2) === '00') return datestr.substring(3);
  return datestr;
}

export interface User {
  id: number;
  name: string;
  password: string;
  worker: number;
  type: number;
}
export type Users = Record<number, User>;

export interface Comment {
  id: number;
  author: number;
  comment: string;
  type: string;
  time: number;
  date: string;
}
export interface Recording {
  id: number;
  record: string;
  cust_num: string;
  worker_id: number;
  time: string;
  length: string;
  status: number;
  type: number;
  user?: number;
  tags?: Array<number>;
  rating: Record<number, number>;
  comments: Comment[];
}
export type Recordings = Record<number, Recording>;

export interface Worker {
  id: number;
  name: string;
  role: string;
  depart: number;
}
export type Workers = Record<number, Worker>;

export interface Depart {
  id: number;
  name: string;
}
export type Departs = Record<number, Depart>;

export interface Param {
  id: number;
  name: string;
  weight: number;
  type: number;
}
export type Params = Record<number, Param>;

export interface Rating {
  rating: number;
  record: number;
  param: number;
}
