declare global {
  interface Window {
    Vue: any
  }
}

export interface InterfaceLayout {
  width: string
  height: string
}

export interface InterfaceImgload {
  type: string
  message: string
}
