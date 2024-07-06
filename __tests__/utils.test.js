const isValidEmail = require("../api/utils")

describe('isValidEmail', ()=>{
    test("valid addresses", ()=>{
        expect(isValidEmail('test@example.com')).toBe(true)
        expect(isValidEmail('test@example.co.uk')).toBe(true)
    })
    test('invalid addresses',()=>{
        expect(isValidEmail('test@example')).toBe(false)
        expect(isValidEmail('test.com')).toBe(false)
        
    })
})