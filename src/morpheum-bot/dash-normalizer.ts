/**
 * Utility functions for normalizing Unicode dashes in command line arguments.
 * 
 * When users type "--" in chat applications, it often gets auto-converted to 
 * Unicode em dash (—) or en dash (–). This utility helps normalize these back
 * to regular ASCII double dashes for proper argument parsing.
 */

/**
 * Normalize Unicode dashes to ASCII dashes in a single argument.
 * Converts em dash (—) and en dash (–) to appropriate ASCII dashes.
 * 
 * @param arg The argument string to normalize
 * @returns The argument with Unicode dashes converted to ASCII dashes
 */
export function normalizeDashes(arg: string): string {
  // Handle single Unicode dash followed by a single letter (short flag like —m, —v)
  if (/^[—–][a-zA-Z]$/.test(arg)) {
    return arg.replace(/^[—–]/, '-');
  }
  
  // Handle Unicode dashes for long flags (like —model, —verbose)
  return arg
    .replace(/—/g, '--')  // em dash (U+2014) to double dash
    .replace(/–/g, '--'); // en dash (U+2013) to double dash
}

/**
 * Normalize Unicode dashes in an array of arguments.
 * 
 * @param args Array of argument strings
 * @returns Array with all Unicode dashes normalized to ASCII dashes
 */
export function normalizeArgsArray(args: string[]): string[] {
  return args.map(normalizeDashes);
}