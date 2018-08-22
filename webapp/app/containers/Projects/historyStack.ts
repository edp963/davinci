interface IHistory {
  name?: string
  pic?: number
  id?: number
}
class HistoryStack  {
  private item: IHistory[]
  private wrap: {}
  constructor () {
    this.item = []
    this.wrap = {}
    this.init()
  }
  private init () {
    const store = localStorage.getItem('historyBrowser')
    const user = this.getUser()
    if (store) {
      const result = this.parse(store)
      this.wrap = result
      const items = this.wrap[user]
      if (items && items.length) {
        this.item = this.wrap[user]
        this.wrap[user] = this.item
      } else {
        this.item = []
        this.wrap[user] = this.item
      }
    } else {
      this.item = []
      this.wrap[user] = this.item
    }
  }
  public pushNode (d?: IHistory) {
    const user = this.getUser()
    const store = localStorage.getItem('historyBrowser')
    if (store) {
      const result = this.parse(store)
      this.wrap = result
      if (result && result[user]) {
        const userArr = result[user]
        if (userArr && Array.isArray(userArr)) {
          this.item = userArr
        } else {
          this.item = []
        }
        this.wrap[user] = this.item
      } else {
        this.item = []
        this.wrap[user] = this.item
      }
    } else {
      this.item = []
      this.wrap[user] = this.item
    }
    if (d) {
      this.item = this.item.filter((t) => t.id !== d.id)
      this.item.unshift(d)
      this.save()
    }
  }
  private getUser () {
    const user = localStorage.getItem('loginUser')
    const userObj = this.parse(user)
    if (userObj && userObj.id) {
      return userObj.id
    }
  }
  private save () {
    const user = this.getUser()
    this.wrap[user] = this.item
    localStorage.setItem('historyBrowser', this.stringify(this.wrap))
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
  public clear () {
    this.item.length = 0
  }
  public getAll () {
    const user = this.getUser()
    return this.wrap[user]
  }
}

export default HistoryStack
