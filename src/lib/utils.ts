import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// This function can be used to check if a module exists
export function checkModuleExists(moduleName: string): boolean {
  try {
    require.resolve(moduleName)
    return true
  } catch (e) {
    return false
  }
}
