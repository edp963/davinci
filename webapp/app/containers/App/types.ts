export interface IDownloadRecord {
  id: number
  name: string
  status: number
  createTime: string
  lastDownloadTime: string
  userId?: number
  uuid?: string
}

export interface IServerConfigurations {
  version: string
  jwtToken: {
    timeout: number
  }
  security: {
    oauth2: {
      enable: boolean
    }
  }
}
