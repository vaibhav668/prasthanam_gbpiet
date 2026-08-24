import * as React from "react"
import { cn } from "../../lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main
      className={cn(
        "flex flex-1 flex-col overflow-hidden",
        className
      )}
    >
      {children}
    </main>
  )
}

interface PageHeaderProps {
  children: React.ReactNode
  className?: string
}

export function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 border-b px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  )
}

interface PageTitleProps {
  children: React.ReactNode
  className?: string
}

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1
      className={cn(
        "text-2xl font-semibold tracking-tight",
        className
      )}
    >
      {children}
    </h1>
  )
}

interface PageDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function PageDescription({ children, className }: PageDescriptionProps) {
  return (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  )
}

interface PageActionsProps {
  children: React.ReactNode
  className?: string
}

export function PageActions({ children, className }: PageActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        className
      )}
    >
      {children}
    </div>
  )
}

interface PageContentProps {
  children: React.ReactNode
  className?: string
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-auto p-6",
        className
      )}
    >
      {children}
    </div>
  )
}

PageContainer.Header = PageHeader
PageContainer.Title = PageTitle
PageContainer.Description = PageDescription
PageContainer.Actions = PageActions
PageContainer.Content = PageContent
