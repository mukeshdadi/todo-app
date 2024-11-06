
export interface Todo {
  id: number;
  title: string;
  description: string;
  role: string;
  fromDate?: string;
  toDate?: string | null;
  repeatDays: string[];
  repeatType:string;
  status?: string;
  LsaHrs: number;
  date_stamp: string;
  LsaTime: string;
}

export interface Schedule {
  id:number;
  dynamicId:number;
  task_id: number;
  title: string; 
  status: string;
  date_stamp: string;
  lsaHrs:number;
  lsaTime:string;
  todo?: Todo;
}

