import UAParser from 'ua-parser-js'

export interface IUserData {
    user_id?: number
    email?: string
}

export interface IOperation extends IUserData {
    id?: number
    action: 'login' | 'visit' | 'initial' | 'sync' | 'search' | 'linkage' | 'drill' | 'download' | 'print'
    org_id: number
    project_id: number
    project_name: string
    viz_type: 'dashboard' | 'display'
    viz_id: number
    viz_name: string
    sub_viz_id: number
    sub_viz_name: string
    create_time: string
}

export interface IDuration extends IUserData {
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
}


6
class Statistic {
    public constructor () {
       const uaParser = new UAParser().getResult()
       const {browser, cpu, device, engine, os, ua} = uaParser
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
        cpu_architecture: cpu.architecture
       })
       this.setDuration({
        start_time: '',
        end_time: ''
       })
       this.setOperation({
        action:  'initial',
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
    }
    private startTime: Date
    private endTimd: Date
    private userData: IUserData
    private terminalRecord: ITerminal
    private durationRecord: IDuration
    private operationRecord: IOperation

    private setUserDate = (options?: IUserData) => {
        const {user_id, email} = options
        this.userData = {
            user_id: user_id || void 0,
            email: email || ''
        }
    }

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
            cpu_architecture
        } = options as ITerminal
        this.terminalRecord = {
            browser_name:  browser_name || '' ,
            browser_version:  browser_version || '',
            engine_name:  engine_name || '',
            engine_version:  engine_version || '',
            os_name:  os_name || '',
            os_version:  os_version || '',
            device_model:  device_model || '',
            device_type:  device_type || '',
            device_vendor:  device_vendor || '',
            cpu_architecture:  cpu_architecture || ''
        }
    }

    public updateSingleFleld = <T>(flag: 'terminal' | 'duration' | 'operation', fleld: keyof T, value, callback?: (data: T) => any) => {
        this[`${flag}Record`] = {
            ...this[`${flag}Record`],
            [fleld]: value
        }
        if (typeof callback === 'function') {
            callback(this[`${flag}Record`])
        }
    }

    public getRecord = (flag: 'terminal' | 'duration' | 'operation') => {
        return this[`${flag}Record`]
    }

    private setDuration = (options?: IDuration) => {
        const {start_time, end_time} = options as IDuration
        this.durationRecord = {
            start_time: start_time || '',
            end_time: end_time || ''
        }
    }

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
            create_time } = options as IOperation
        this.operationRecord = {
            action: action || 'initial',
            org_id: org_id || void 0 ,
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

    // options?: { [P in keyof IOperation] ?: IOperation[P]}
    public setOperations = (options?: Partial<IOperation>, callback?: (data: IOperation) => any) => {
        this.operationRecord = {
            ...this.operationRecord,
            ...options
        }
        if (typeof callback === 'function') {
            callback(this.operationRecord)
        }
    }

    private makeRequest = (src) => new Promise((resolve, reject) => {
        const img = new Image()
        img.src = src
        img.onload =  (res) => resolve(res)
        img.onerror = (err) => reject(err)
    })

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

    private parse (str: string) {
        try {
          if (str) {
            return JSON.parse(str)
          }
        } catch (err) {
          throw new Error(err)
        }
    }

    private stringify (data) {
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


