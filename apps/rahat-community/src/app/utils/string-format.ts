export function replaceWith(str: string | any, replaceWith: string): any {
  return str
    .trim()
    .toUpperCase()
    .replace(/[-\s]+/g, replaceWith);
}

export function bufferToWalletAddress(buffer: Buffer): string {
  if (buffer) return `0x${Buffer.from(buffer).toString('hex')}`;
}
