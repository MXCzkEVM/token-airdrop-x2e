// jsonParser.ts

// Convert hex to byte array
export function hexToBytes(hex: string): number[] {
    const bytes: number[] = [];
    for (let i = 2; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }
  
  // Convert byte array to UTF-8 string
  export function bytesToUtf8(byteArray: number[]): string {
    let utf8 = "";
    for (let i = 0; i < byteArray.length; i++) {
      utf8 += String.fromCharCode(byteArray[i]);
    }
    return utf8;
  }
  
  // Try to extract JSON from the string
  export function extractJSON(str: string): string | null {
    const leftBrace = str.indexOf('{');
    const rightBrace = str.lastIndexOf('}');
    if (leftBrace !== -1 && rightBrace !== -1) {
      return str.substring(leftBrace, rightBrace + 1);
    }
    return null;
  }
  