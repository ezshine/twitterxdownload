// app/providers.js
'use client'

import {HeroUIProvider,ToastProvider} from '@heroui/react'
import {ThemeProvider as NextThemesProvider} from "next-themes";

export function Providers({children}) {
  return (
    <HeroUIProvider>
      <NextThemesProvider 
        attribute="class" 
        defaultTheme="light"  // 浅色模式作为默认，展示紫色效果
        enableSystem={true}   // 启用系统主题检测
        disableTransitionOnChange={false} // 启用主题切换动画
      >
      <ToastProvider placement="top-center" toastOffset={230} />
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  )
}