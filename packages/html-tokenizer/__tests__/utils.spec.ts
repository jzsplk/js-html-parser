import {isAsciiLetter} from '../lib/utils'

describe('html-tokenizer -> utils', () => {
    it('should return ture when input is ascii char', () => {
        const result = isAsciiLetter('z');
        
        expect(result).toBe(true);
    })
    
    it('should return false when input is not ascii char', () => {
        const result = isAsciiLetter('尼');
        
        expect(result).toBe(false);
    })
})