/**
 * Input validation library to validate input
 * @author Harish S/O Balamurugan
 */
export class InputValidator {
    /**
     * Check whether the input is empty
     * @param input the string input to be validated
     */
    public isEmpty(input: string): boolean {
        return input === '' || input === null || typeof input === 'undefined';
    }

    /**
     * Check whether the input is within a given range
     * @param input the number input to be validated
     * @param min the range minimum
     * @param max the range maximum
     * @param inclusive whether to include the minimum and maximum when performing validation (i.e. > vs >=)
     */
    public isInValidRange(input: number, min: number, max: number, inclusive: boolean): boolean {
        return inclusive ? (input >= min && input <= max) : (input > min && input < max);
    }

    /**
     * Check whether the input is of an expected length
     * @param input the string input to be validated
     * @param min the minimum length expected
     * @param max the maximum length expected
     * @param inclusive whether to include the minimum and maximum when performing validation (i.e. > vs >=)
     */
    public isOfValidLength(input: string, min: number, max: number, inclusive: boolean): boolean {
        return this.isInValidRange(input.length, min, max, inclusive);
    }

    /**
     * Check whether the organisation name can be accepted as a valid value
     * @param input the string input to be validated
     */
    public isValidOrgName(input: string): boolean {
        const re = /^[A-Za-z0-9 .,()]{3,30}$/;
        return re.test(input);
    }

    /**
     * Check whether the email can be accepted as a valid value
     * @param input the string input to be validated
     */
    public isValidEmail(input: string): boolean {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(input);
    }

    /**
     * Check whether the phone number can be accepted as a valid value
     * @param input the string input to be validated
     */
    public isValidPhoneNum(input: string): boolean {
        const re = /^[89]+\d{7}$/;
        return re.test(input);
    }

    /**
     * Checks whether the password has 
     * at least 2 uppercase letters, 
     * 2 lowercase letters, 2 digits, 
     * 1 special character(.!@#$%^&*()_=+?/\), 
     * and is at least 8 characters long
     * @param password the password string to be validated
     */
    public isAReasonablyStrongPassword(password: string): boolean {
        const re = new RegExp('^(?=.{2,}[a-z])(?=.{2,}[A-Z])(?=.{2,}[0-9])(?=.+[!@#$%^&*])(?=.{8,})', 'u');
        return re.test(password);
    }

    /**
     * Check whether the rule name can be accepted as a valid value
     * @param input the string input tp be validated
     */
    public isValidRuleName(input: string): boolean {
        const re = /^[A-Za-z0-9]{3,10}$/;
        return re.test(input);
    }

    /**
     * Check whether the port number can be accepted as a valid value
     * @param input the string input to be validated
     */
    public isValidPortNum(input: string): boolean {
        if (this.isNum(input)) {
            const port = parseInt(input, 10);
            return (port >= 0 && port <= 65535) ? true : false;
        }
        return input === "*";
    }

    /**
     * Check whether the input is a valid boolean value
     * @param input the value to be validated
     */
    public isBoolean(input: any): boolean {
        if (this.isEmpty(input)) return false;
        switch((typeof input)) {
            case 'string':
                const input_lower = input.toLowerCase();
                return input_lower === 'true' || input_lower === 'false' || input_lower === 'f' || input_lower === 't' || input_lower === '1' || input === '0';
            case 'boolean':
                return true;
            case 'number':
                return input === 1 || input === 0;
            default:
                return false;
        }
    }

    /**
     * Check whether the input is a valid numerical value
     * @param input the string input to be validated
     */
    public isNum(input: string): boolean {
        try {
            const int = parseInt(input);
            return !isNaN(int);
        } catch (error) {
            return false;
        }
    }

    /**
     * TODO: Validate protocol against a list of whitelist values
     * @param input the string input to be validated
     */
    public isValidProto(input: string): boolean {
        // const re = /^[A-Z]{3,6}$/;
        // return re.test(input);
        const input_lower = input.toLowerCase();
        return input_lower === 'tcp' || input_lower === 'udp';
    }

    /**
     * Check whether the IP address can be accepted as a valid value
     * @param input the string input to be validated
     */
    public isValidIp(input: string): boolean {
        const re = /^(?=[\d\*]+\.[\d\*]\.[\d\*]\.[\d\*]$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9]|\*)\.?){4}$/;
        return re.test(input);
    }
}