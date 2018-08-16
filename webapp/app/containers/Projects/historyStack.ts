interface IHistory {
  name?: string
  pic?: number
  id?: number
}
class HistoryStack  {
  private item: IHistory[]
  private key: string
  constructor (key) {
    this.item = []
    this.key = key
    this.init(key)
  }
  private init (key: string) {
    const store = localStorage.getItem(key)
    if (store) {
      const result = this.parse(store)
      if (result && Array.isArray(result)) {
         this.item = result
      }
    } else {
      this.item = []
    }
  }
  public pushNode (d: IHistory) {
    if (d) {
      this.item = this.item.filter((t) => t.id !== d.id)
      this.item.unshift(d)
      this.save(this.key)
    }
  }
  private save (key: string) {
    localStorage.setItem(key, this.stringify(this.item))
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
    return this.item
  }
}

export default HistoryStack
