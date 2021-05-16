export const isAsciiLetter = (str: string):boolean => {
    return str.length === 1 && Boolean(/[a-zA-Z]/i.exec(str));
} 

export const fromCharSet = (charCodes: number[]): Set<string> => {
    const numberSet = new Set(charCodes);
    const charSet = new Set([...numberSet].map(code => String.fromCharCode(code)))
    
    return charSet;
}
