export enum DownloadTypes {
  Folder = 'folder',
  Dashboard = 'dashboard',
  Widget = 'widget'
}

export enum DownloadStatus {
  Processing = 1,
  Success = 2,
  Failed = 3
}

export interface IDownloadRecord {
  id: number
  name: string
  path: string
  status: number
}