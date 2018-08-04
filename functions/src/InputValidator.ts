import { RuleInput } from "./RuleInput";
import { GlobalOptionsInput } from "./GlobalOptionsInput";
import { UserInput } from "./UserInput";
import { FilterInput } from "./FilterInput";

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
     * Check whether the organisation name can be accepted as a valid value
     * @param input the string input to be validated
     */
    private isValidOrgName(input: string): boolean {
        if (this.isEmpty(input)) return false;
        const re = /^[A-Za-z0-9 .,()]{3,30}$/;
        return re.test(input);
    }

    /**
     * Check whether the email can be accepted as a valid value
     * @param input the string input to be validated
     */
    public isValidEmail(input: string): boolean {
        if (this.isEmpty(input)) return false;
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(input);
    }

    /**
     * Check whether the priority number can be accepted as a valid value
     * @param input the string input to be validated
     */
    private isValidPriorityNum(input: string): boolean {
        if (this.isEmpty(input)) return false;
        const re = /^[0-9]{1,5}$/;
        return re.test(input);
    }

    /**
     * Check whether the phone number can be accepted as a valid value
     * @param input the string input to be validated
     */
    public isValidPhoneNum(input: string): boolean {
        if (this.isEmpty(input)) return false;
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
    private isAReasonablyStrongPassword(password: string): boolean {
        if (this.isEmpty(password)) return false;
        const has2Caps = password.match(/[A-Z]/g) ? password.match(/[A-Z]/g).length >= 2 : false;
        const has2Smalls = password.match(/[a-z]/g) ? password.match(/[a-z]/g).length >= 2 : false;
        const has2Digits = password.match(/[0-9]/g) ? password.match(/[0-9]/g).length >= 2 : false;
        const has1Symbol = password.match(/[!@#$%^&*]/g) ? password.match(/[!@#$%^&*]/g).length >= 1 : false;
        const is8CharsLong = password ? password.length >= 8 : false;
        return has2Caps && 
                has2Smalls && 
                has2Digits && 
                has1Symbol && 
                is8CharsLong;
        // const re = new RegExp('^(?=.{2,}[a-z])(?=.{2,}[A-Z])(?=.{2,}[0-9])(?=.+[!@#$%^&*])(?=.{8,})', 'u');
        // return re.test(password);
    }

    /**
     * Check whether the rule name can be accepted as a valid value
     * @param input the string input tp be validated
     */
    private isValidRuleName(input: string): boolean {
        if (this.isEmpty(input)) return false;
        const re = /^[A-Za-z0-9]{3,10}$/;
        return re.test(input);
    }

    /**
     * Check whether the port number can be accepted as a valid value
     * @param input the string input to be validated
     */
    private isValidPortNum(input: string): boolean {
        if (this.isEmpty(input)) return false;
        if (/^[0-9]{1,5}$/.test(input)) {
            const port = parseInt(input, 10);
            return (port >= 0 && port <= 65535) ? true : false;
        }
        return input === "*";
    }

    /**
     * Check whether the input is a valid boolean value
     * @param input the value to be validated
     */
    private isBoolean(input: any): boolean {
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
     * TODO: Validate protocol against a list of whitelist values
     * @param input the string input to be validated
     */
    private isValidProto(input: string): boolean {
        if (this.isEmpty(input)) return false;
        // const re = /^[A-Z]{3,6}$/;
        // return re.test(input);
        const input_lower = input.toLowerCase();
        return input_lower === 'tcp' || input_lower === 'udp';
    }

    /**
     * Check whether the IP address can be accepted as a valid value
     * @param input the string input to be validated
     */
    private isValidIp(input: string): boolean {
        if (this.isEmpty(input)) return false;
        const re = /^(?=[\d\*]+\.[\d\*]\.[\d\*]\.[\d\*]$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9]|\*)\.?){4}$/;
        return input === "*" ? true : re.test(input);
    }

    /**
     * Check whether the domain can be accepted as a valid value
     * @param input the string input to be validated
     */
    private isValidDomain(input: string): boolean {
        const toBeValidated = input.toLowerCase();

        return toBeValidated.startsWith('.') ? /^(?:\.[a-zA-Z]{2,})+$/.test(toBeValidated) : /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(toBeValidated);
    };

    /**
     * Checks whether the inputs given to 
     * create/update a rule are valid.
     * 
     * @param name the name of the rule
     * @param access a boolean value, received as a string
     * @param priority a numerical value, received as a string, must be between 1 and 5 digits long (Hence, 00000 will also work, though will be converted to 0)
     * @param proto tcp or udp
     * @param sip Source IP Address
     * @param sport Source port, in string, must be between 0 and 65535
     * @param dip Destination IP Address
     * @param dport Destination port, same requirements as source port
     * @param direction a boolean value, received as a string
     */
    public isValidRule(name: string, access: string, priority: string, proto: string, sip: string, sport: string, dip: string, dport: string, direction: string): RuleInput {
        if (this.isValidRuleName(name) && this.isBoolean(access)
            && this.isValidPriorityNum(priority) && this.isValidProto(proto)
            && this.isValidIp(sip) && this.isValidPortNum(sport)
            && this.isValidIp(dip) && this.isValidPortNum(dport)
            && this.isBoolean(direction)) {
            return new RuleInput(name, access, priority, proto, sip, sport, dip, dport, direction);
        } else {
            console.error(`Received rule: Name: ${name}, Access: ${access}, Priority: ${priority}, Protocol: ${proto}, Source IP: ${sip}, Source Port: ${sport}, Dest IP: ${dip}, Dest Port: ${dport}, Direction: ${direction}`);
            return null;
        }
    }

    /**
     * Checks whether the inputs given to 
     * create/update a filter are valid.
     * 
     * @param blacklist a string array of URLs
     * @param whitelist a string array of URLs
     * @param fakeNews a boolean value received as a string
     * @param socialMedia a boolean value received as a string
     * @param gambling a boolean value received as a string
     * @param pornography a boolean value received as a string
     */
    public isValidFilter(blacklist: string[], whitelist: string[], fakeNews: string, socialMedia: string, gambling: string, pornography: string) {
        if (blacklist.length !== 0) {
            for (const filter of blacklist) {
                if (!this.isValidDomain(filter)) {
                    console.error(`Received filter: Blacklist: ${blacklist}, Whitelist: ${whitelist}, fakeNews: ${fakeNews}, socialMedia: ${socialMedia}, gambling: ${gambling}, pornography: ${pornography}`);
                    return null;
                }
            }
        }

        if (whitelist.length !== 0) {
            for (const filter of whitelist) {
                if (!this.isValidDomain(filter)) {
                    console.error(`Received filter: Blacklist: ${blacklist}, Whitelist: ${whitelist}, fakeNews: ${fakeNews}, socialMedia: ${socialMedia}, gambling: ${gambling}, pornography: ${pornography}`);
                    return null;
                }
            }
        }

        if (this.isBoolean(fakeNews) && this.isBoolean(socialMedia) && 
            this.isBoolean(gambling) && this.isBoolean(pornography)) {
            return new FilterInput(blacklist, whitelist, fakeNews, socialMedia, gambling, pornography);
        } else {
            console.error(`Received filter: Blacklist: ${blacklist}, Whitelist: ${whitelist}, fakeNews: ${fakeNews}, socialMedia: ${socialMedia}, gambling: ${gambling}, pornography: ${pornography}`);
            return null;
        }
    }

    /**
     * Checks whether the inputs given to update 
     * global firewall/web filter options are valid.
     * 
     * @param childSafety a boolean value represented in string
     * @param virusScan a boolean value represented in string
     * @param blockAds a boolean value represented in string
     * @param blockMalicious a boolean value represented in string
     */
    public isValidOptions(childSafety: string, virusScan: string, blockAds: string, blockMalicious: string): GlobalOptionsInput {
        if (this.isBoolean(childSafety) && this.isBoolean(virusScan)
            && this.isBoolean(blockAds) && this.isBoolean(blockMalicious)) {
            return new GlobalOptionsInput(childSafety, virusScan, blockAds, blockMalicious);
        } else {
            console.error(`Received rule: Child Safety: ${childSafety}, VirusScan: ${virusScan}, blockAds: ${blockAds}, blockMalicious: ${blockMalicious}`);
            return null;
        }
    }

    /**
     * Checks whether the inputs given to 
     * create a user account is valid.
     * 
     * @param email email
     * @param password password - With 2 Uppercase, 2 lowercase, 2 numerics and 1 digit - A very simple requirement
     * @param phoneNumber phone number - must comply with Singapore 'standards' (Start with '8' or '9', must be 8 digits long, etc.)
     * @param organisation organisation - Can contain uppercase, lowercase, digits, space, fullstop and parenthesis
     * @param photoURL A valid nullable photo url
     */
    public isValidUserDetails(email: string, password: string, phoneNumber: string, organisation: string, photoURL: string): UserInput {
        if (this.isValidEmail(email) && 
            this.isValidOrgName(organisation) && 
            this.isValidPhoneNum(phoneNumber) && 
            this.isAReasonablyStrongPassword(password)) {
            return new UserInput(email, password, phoneNumber, organisation, photoURL);
        } else {
            return null;
        }
    }
}