import { Configuration, DefaultApi, ImageApi, StyleApi, UserApi } from "./api"

export type RecraftApi = {
  defaultApi: DefaultApi,
  imageApi: ImageApi,
  styleApi: StyleApi,
  userApi: UserApi,
}

export const createRecraftApi = (config: Configuration): RecraftApi => {
  return {
    defaultApi: new DefaultApi(config),
    imageApi: new ImageApi(config),
    styleApi: new StyleApi(config),
    userApi: new UserApi(config),
  }
}
