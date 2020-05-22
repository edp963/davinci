import UAParser from 'ua-parser-js'
import moment, { Moment } from 'moment'
import request from 'utils/request'
import api from 'utils/api'

export interface IUserData {
  user_id?: number
  email?: string
}

export interface IVizData {
  org_id: number
  project_id: number
  project_name: string
  viz_type: 'dashboard' | 'display'
  viz_id: number
  viz_name: string
  sub_viz_id: number
  sub_viz_name: string
}

export interface IOperation extends IUserData, IVizData {
  id?: number
  action:
    | 'login'
    | 'visit'
    | 'initial'
    | 'sync'
    | 'search'
    | 'linkage'
    | 'drill'
    | 'download'
    | 'print'
  create_time: string
}

export interface IDuration extends IUserData, IVizData {
  id?: number
  start_time: string
  end_time: string
}

export interface ITerminal extends IUserData {
  id?: number
  browser_name: string
  browser_version: string
  engine_name: string
  engine_version: string
  os_name: string
  os_version: string
  device_model: string
  device_type: string
  device_vendor: string
  cpu_architecture: string
  create_time: string
}

class Statistic {
  public constructor() {
    const uaParser = new UAParser().getResult()
    const { browser, cpu, device, engine, os, ua } = uaParser
    const loginUser = this.parse(this.getItemByLocalStorage('loginUser'))
    this.setUserDate({
      user_id: loginUser ? loginUser.id : void 0,
      email: loginUser ? loginUser.email : ''
    })
    this.setTerminal({
      browser_name: browser.name,
      browser_version: browser.version,
      engine_name: engine.name,
      engine_version: engine.version,
      os_name: os.name,
      os_version: os.version,
      device_model: device.model,
      device_type: device.type,
      device_vendor: device.vendor,
      cpu_architecture: cpu.architecture,
      create_time: this.getCurrentDateTime()
    })
    this.setDuration({
      start_time: '',
      end_time: '',
      org_id: void 0,
      project_id: void 0,
      project_name: '',
      viz_type: 'dashboard',
      viz_id: void 0,
      viz_name: '',
      sub_viz_id: void 0,
      sub_viz_name: ''
    })
    this.setOperation({
      action: 'initial',
      org_id: void 0,
      project_id: void 0,
      project_name: '',
      viz_type: 'dashboard',
      viz_id: void 0,
      viz_name: '',
      sub_viz_id: void 0,
      sub_viz_name: '',
      create_time: ''
    })

    const that = this
    Reflect.defineProperty(that.clock, 'checkTime', {
      configurable: true,
      set(value) {
        const time = that.getClock()
        if (time >= 30) {
          that.onceSetDurations(
            {
              end_time: that.getCurrentDateTime()
            },
            (data) => {
              that.sendDuration([that.durationRecord])
            }
          )
        }
      }
    })
    this.onceSendTerminal = this.__once__(this.whenSendTerminal)
  }
  public onceSendTerminal: any
  private onceSetDurations: any
  private clock: { time: number } = { time: 0 }
  private clocker: any
  private startTime: Date
  private endTimd: Date
  public userData: IUserData
  public terminalRecord: ITerminal
  public durationRecord: IDuration
  public operationRecord: IOperation
  private prevDurationRecord: string = 'PREVDURATIONRECORD'
  private setUserDate = (options?: IUserData) => {
    const { user_id, email } = options
    this.userData = {
      user_id: user_id || void 0,
      email: email || ''
    }
  }

  public __once__(fn) {
    let tag = true
    return (...args) => {
      if (tag) {
        tag = !tag
        return fn.apply(this, args)
      } else {
        return void 0
      }
    }
  }

  public startClock = () => {
    this.resetClock()
    this.clocker = setInterval(() => {
      this.clock['time'] += 1
      this.clock['checkTime'] = this.clock['time']
    }, 1000)
    this.onceSetDurations = this.__once__(this.setDurations)
  }

  public resetClock = () => {
    if (this.clocker) {
      clearTimeout(this.clocker)
    }
    this.clock['time'] = 0
  }

  public sendPrevDurationRecord = () => {
    // 从localstorege拿上一次时长数据 send server
    const record = this.getPrevDurationRecord()
    if (record && record.length) {
      this.sendDuration(record).then((data) => {
        this.clearPrevDurationRecord()
      })
    }
  }

  public whenSendTerminal = () => {
    this.sendPrevDurationRecord()
    const loginUser = this.parse(this.getItemByLocalStorage('loginUser'))
    this.setUserDate({
      user_id: loginUser ? loginUser.id : void 0,
      email: loginUser ? loginUser.email : ''
    })
    this.setTerminals({}, (data) => {
      this.sendTerminal(data)
    })
  }

  public isTimeout = (callback?: (data: IDuration) => any) => {
    const time = this.getClock()
    if (time > 30) {
      this.setDurations({
        start_time: this.getCurrentDateTime()
      })
    }
    this.startClock()
    if (typeof callback === 'function') {
      callback(this.durationRecord)
    }
  }

  public isResetTime = () => {
    const time = this.getClock()
    if (time && this.clocker) {
      this.isTimeout()
    }
    return
  }

  public sendDuration = (body) => {
    const url = `${api.buriedPoints}/duration`
    return request(url, {
      method: 'post',
      data: body
    })
  }

  public sendTerminal = (body) => {
    const url = `${api.buriedPoints}/terminal`
    return request(url, {
      method: 'post',
      data: [body]
    })
  }

  public sendOperation = (body) => {
    const url = `${api.buriedPoints}/visitoroperation`
    return request(url, {
      method: 'post',
      data: Array.isArray(body) ? body : [body]
    })
  }

  public getClock = () => this.clock['time']

  private setTerminal = (options?: ITerminal) => {
    const {
      browser_name,
      browser_version,
      engine_name,
      engine_version,
      os_name,
      os_version,
      device_model,
      device_type,
      device_vendor,
      cpu_architecture,
      create_time
    } = options as ITerminal
    this.terminalRecord = {
      browser_name: browser_name || '',
      browser_version: browser_version || '',
      engine_name: engine_name || '',
      engine_version: engine_version || '',
      os_name: os_name || '',
      os_version: os_version || '',
      device_model: device_model || '',
      device_type: device_type || '',
      device_vendor: device_vendor || '',
      cpu_architecture: cpu_architecture || '',
      create_time: create_time || '',
      ...this.userData
    }
  }

  public updateSingleFleld = <T>(
    flag: 'terminal' | 'duration' | 'operation',
    fleld: keyof T,
    value,
    callback?: (data: T) => any
  ) => {
    this[`${flag}Record`] = {
      ...this[`${flag}Record`],
      [fleld]: value
    }
    if (typeof callback === 'function') {
      callback(this[`${flag}Record`])
    }
  }

  public getPrevDurationRecord = () => {
    const pr = this.parse(localStorage.getItem(this.prevDurationRecord))
    if (pr && pr.length) {
      return pr
    }
    return []
  }

  public setPrevDurationRecord = (
    record: IDuration,
    callback?: (data: IDuration) => any
  ) => {
    record = {
      ...record,
      ...this.userData
    }
    let prevDRecord = this.parse(localStorage.getItem(this.prevDurationRecord))
    prevDRecord =
      prevDRecord && Array.isArray(prevDRecord)
        ? prevDRecord.concat(record)
        : [record]
    localStorage.setItem(this.prevDurationRecord, this.stringify(prevDRecord))
    if (typeof callback === 'function') {
      callback(this.durationRecord)
    }
  }

  public clearPrevDurationRecord = () => {
    localStorage.setItem(this.prevDurationRecord, this.stringify([]))
  }

  public getRecord = (flag: 'terminal' | 'duration' | 'operation') => {
    return this[`${flag}Record`]
  }

  private setDuration = (options?: IDuration) => {
    const {
      org_id,
      viz_id,
      viz_type,
      viz_name,
      sub_viz_id,
      project_id,
      project_name,
      sub_viz_name,
      start_time,
      end_time
    } = options as IDuration
    this.durationRecord = {
      start_time: start_time || '',
      end_time: end_time || '',
      org_id: org_id || void 0,
      project_id: project_id || void 0,
      project_name: project_name || '',
      viz_type: viz_type || 'dashboard',
      viz_id: viz_id || void 0,
      viz_name: viz_name || '',
      sub_viz_id: sub_viz_id || void 0,
      sub_viz_name: sub_viz_name || ''
    }
  }

  public getCurrentDateTime = () => moment().format('YYYY-MM-DD HH:mm:ss')

  private setOperation = (options?: IOperation) => {
    const {
      action,
      org_id,
      viz_id,
      viz_type,
      viz_name,
      sub_viz_id,
      project_id,
      project_name,
      sub_viz_name,
      create_time
    } = options as IOperation
    this.operationRecord = {
      action: action || 'initial',
      org_id: org_id || void 0,
      project_id: project_id || void 0,
      project_name: project_name || '',
      viz_type: viz_type || 'dashboard',
      viz_id: viz_id || void 0,
      viz_name: viz_name || '',
      sub_viz_id: sub_viz_id || void 0,
      sub_viz_name: sub_viz_name || '',
      create_time: create_time || ''
    }
  }

  public setOperations = (
    options?: Partial<IOperation>,
    callback?: (data: IOperation) => any
  ) => {
    this.operationRecord = {
      ...this.operationRecord,
      ...options,
      ...this.userData
    }
    if (typeof callback === 'function') {
      callback(this.operationRecord)
    }
  }

  public setTerminals = (
    options?: Partial<ITerminal>,
    callback?: (data: ITerminal) => any
  ) => {
    this.terminalRecord = {
      ...this.terminalRecord,
      ...options,
      ...this.userData
    }
    if (typeof callback === 'function') {
      callback(this.terminalRecord)
    }
  }

  public setDurations = (
    options?: Partial<IDuration>,
    callback?: (data: IDuration) => any
  ) => {
    this.durationRecord = {
      ...this.durationRecord,
      ...options,
      ...this.userData
    }
    if (typeof callback === 'function') {
      callback(this.durationRecord)
    }
  }

  private obj2url = (obj) => {
    return Object.keys(obj).reduce((a, b, currentIndex, array) => {
      a = a + `${b}=${obj[b]}` + (currentIndex + 1 === array.length ? '' : '&')
      return a
    }, '?')
  }

  private getItemByLocalStorage = (item: string) => {
    try {
      if (item) {
        return localStorage.getItem(item)
      }
    } catch (err) {
      throw new Error(err)
    }
  }

  private parse(str: string) {
    try {
      if (str) {
        return JSON.parse(str)
      }
    } catch (err) {
      throw new Error(err)
    }
  }

  private stringify(data) {
    try {
      if (data) {
        return JSON.stringify(data)
      }
    } catch (err) {
      throw new Error(err)
    }
  }
}

export const statistic = new Statistic()
