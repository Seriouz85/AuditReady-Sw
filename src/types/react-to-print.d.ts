declare module 'react-to-print' {
  import { ReactInstance } from 'react';

  export interface UseReactToPrintOptions {
    /** 
     * Function that returns a reference to the component to be printed 
     */
    content: () => ReactInstance | null;
    
    /** 
     * Optional callback function that triggers when printing is completed 
     */
    onAfterPrint?: () => void;
    
    /** 
     * Optional callback function that triggers before printing 
     */
    onBeforeGetContent?: () => Promise<void> | void;
    
    /** 
     * Optional callback function that triggers before printing 
     */
    onBeforePrint?: () => Promise<void> | void;
    
    /** 
     * Optional callback function that will be called if printing failed 
     */
    onPrintError?: (errorLocation: string, error: Error) => void;
    
    /** 
     * Optional override for the print window 
     */
    documentTitle?: string;
    
    /** 
     * Override the default print window styling 
     */
    pageStyle?: string;
    
    /** 
     * Remove the iframe after printing 
     */
    removeAfterPrint?: boolean;

    /**
     * Suppress the default print dialog
     */
    suppressErrors?: boolean;
  }

  export type UseReactToPrintFn = () => void;

  export const useReactToPrint: (options: UseReactToPrintOptions) => UseReactToPrintFn;
} 