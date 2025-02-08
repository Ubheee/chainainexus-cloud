import { createContext, useContext } from 'use-context-selector'
import { hexToRGBA } from './utils'

export class Theme {
  public chatColorTheme: string | null
  public chatColorThemeInverted: boolean

  public primaryColor = 'var(--color-components-button-primary-bg)'
  public backgroundHeaderColorStyle = 'var(--color-background-gradient-bg-fill-chat-bg-1)'
  public headerBorderBottomStyle = ''
  public colorFontOnHeaderStyle = 'var(--color-text-primary-on-surface)'
  public colorPathOnHeader = 'var(--color-text-primary-on-surface)'
  public backgroundButtonDefaultColorStyle = 'var(--color-components-button-primary-bg)'
  public roundedBackgroundColorStyle = 'var(--color-background-gradient-bg-fill-chat-bubble-bg-1)'
  public chatBubbleColorStyle = 'var(--color-background-gradient-bg-fill-chat-bubble-bg-1)'
  public chatBubbleColor = 'var(--color-background-gradient-bg-fill-chat-bubble-bg-1)'

  constructor(chatColorTheme: string | null = null, chatColorThemeInverted = false) {
    this.chatColorTheme = chatColorTheme
    this.chatColorThemeInverted = chatColorThemeInverted
    this.configCustomColor()
    this.configInvertedColor()
  }

  private configCustomColor() {
    if (this.chatColorTheme !== null && this.chatColorTheme !== '') {
      this.primaryColor = this.chatColorTheme ?? 'var(--color-components-button-primary-bg)'
      this.backgroundHeaderColorStyle = `backgroundColor: ${this.primaryColor}`
      this.backgroundButtonDefaultColorStyle = `backgroundColor: ${this.primaryColor}; color: ${this.colorFontOnHeaderStyle};`
      this.roundedBackgroundColorStyle = `backgroundColor: ${hexToRGBA(this.primaryColor, 0.05)}`
      this.chatBubbleColorStyle = `backgroundColor: ${hexToRGBA(this.primaryColor, 0.15)}`
      this.chatBubbleColor = `${hexToRGBA(this.primaryColor, 0.15)}`
    }
  }

  private configInvertedColor() {
    if (this.chatColorThemeInverted) {
      this.backgroundHeaderColorStyle = 'var(--color-background-default)'
      this.colorFontOnHeaderStyle = `color: ${this.primaryColor}`
      this.headerBorderBottomStyle = 'var(--color-components-panel-border)'
      this.colorPathOnHeader = this.primaryColor
    }
  }
}

export class ThemeBuilder {
  private _theme?: Theme
  private buildChecker = false

  public get theme() {
    if (this._theme === undefined)
      throw new Error('The theme should be built first and then accessed')
    else
      return this._theme
  }

  public buildTheme(chatColorTheme: string | null = null, chatColorThemeInverted = false) {
    if (!this.buildChecker) {
      this._theme = new Theme(chatColorTheme, chatColorThemeInverted)
      this.buildChecker = true
    }
    else {
      if (this.theme?.chatColorTheme !== chatColorTheme || this.theme?.chatColorThemeInverted !== chatColorThemeInverted) {
        this._theme = new Theme(chatColorTheme, chatColorThemeInverted)
        this.buildChecker = true
      }
    }
  }
}

const ThemeContext = createContext<ThemeBuilder>(new ThemeBuilder())
export const useThemeContext = () => useContext(ThemeContext)
