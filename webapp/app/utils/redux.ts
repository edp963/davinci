type ReturnTypes<EnumTypes> = {
  [key in keyof EnumTypes]: key
}

export function createTypes<EnumTypes> (enumTypes: EnumTypes): ReturnTypes<EnumTypes> {
  // @FIXME temporarily not use Proxy to avoid PhantomJS screenshot error for not support ES6 Proxy
  // return new Proxy(enumTypes as any, {
  //   get (_, property: any) {
  //     return enumTypes[property]
  //   }
  // })
  return Object.entries(enumTypes as any).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}) as ReturnTypes<EnumTypes>
}

type ActionCreatorMap<ActionMap> = {
  [key in keyof ActionMap]: (arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any) => ActionMap[key]
}

type ValueOf<ActionMap> = ActionMap[keyof ActionMap]

export function returnType<ActionMap> (actions: ActionCreatorMap<ActionMap>) {
  type Action = ValueOf<ActionMap>

  return {} as any as Action
}
