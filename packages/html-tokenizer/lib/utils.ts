export const isAsciiLetter = (str: string):boolean => {
    return str.length === 1 && Boolean(/[a-zA-Z]/i.exec(str));
} 