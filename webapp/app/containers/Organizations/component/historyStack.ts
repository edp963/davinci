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
    this.init([])
  }
  public init (projects) {
    const store = localStorage.getItem('historyBrowser')
    const user = this.getUser()
    if (store && store.length) {
      const result = this.parse(store)
      this.wrap = result
      if (user) {
        const items = this.wrap[user]
        if (items && items.length) {
          this.item = items
          this.wrap[user] = this.item
        } else {
          this.item = []
          this.wrap[user] = this.item
        }
      }
    } else {
      if (user) {
        this.item = []
        this.wrap[user] = this.item
      }
    }

    const historyArr = []
    if (this.wrap && this.wrap[user] && this.wrap[user].length) {
      this.wrap[user].forEach((historyItem) => {
        projects.forEach((projectItem) => {
          if (historyItem.id === projectItem.id) {
            historyArr.push(projectItem)
          }
        })
      })
    }
    this.wrap[user] = historyArr
  }
  public pushNode (d?: IHistory) {
    const user = this.getUser()
    const store = localStorage.getItem('historyBrowser')
    if (store) {
      const result = this.parse(store)
      this.wrap = result
      if (user && user.length) {
        if (result && result[user]) {
          const userArr = result[user]
          this.item = (userArr && Array.isArray(userArr)) ? userArr : []
          this.wrap[user] = this.item
        } else {
          this.item = []
          this.wrap[user] = this.item
        }
      }
    } else {
      if (user) {
        this.item = []
        this.wrap[user] = this.item
      }
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
    return false
  }
  private save () {
    const user = this.getUser()
    if (user) {
      this.wrap[user] = this.item
    }
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
    if (user) {
      const items = this.wrap[user]
      if (items && items.length) {
        this.item = items
        this.wrap[user] = this.item
      } else {
        this.item = []
        this.wrap[user] = this.item
      }
      const projectList = this.wrap[user]
      return {
        projectList,
        proIdList: projectList.map((pro) => pro.id)
      }
    } else {
      return {
        projectList: [],
        proIdList: []
      }
    }
  }
}

export default HistoryStack
