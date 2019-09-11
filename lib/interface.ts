declare global {
  interface Window {
    Vue: any
  }
}

export interface InterfaceLayout {
  width: string
  height: string
  background: string
  backgroundImage: string
}

export interface InterfaceImgload {
  type: string
  message: string
}
