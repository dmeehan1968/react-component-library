import * as React from "react"

export const useLocale = () => {
  const [locale, setLocale] = React.useState<string>('en-US')
  React.useEffect(() => {
    setLocale(typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US')
  }, [])
  return locale
}