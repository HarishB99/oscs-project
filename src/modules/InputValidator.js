var InputValidator = function() {};
InputValidator.isEmpty = function(input) {
    return input === "" || typeof input === "undefined" || input === null;
};
InputValidator.isValidPriorityNum = function(input) {
    if (this.isEmpty(input)) return false;
    const re = /^[0-9]{1,5}$/;
    return re.test(input);
}
InputValidator.isAReasonablyStrongPassword = function(input) {
    if (this.isEmpty(input)) return false;
    const has2Caps = input.match(/[A-Z]/g) ? input.match(/[A-Z]/g).length >= 2 : false;
    const has2Smalls = input.match(/[a-z]/g) ? input.match(/[a-z]/g).length >= 2 : false;
    const has2Digits = input.match(/[0-9]/g) ? input.match(/[0-9]/g).length >= 2 : false;
    const has1Symbol = input.match(/[!@#$%^&*]/g) ? input.match(/[!@#$%^&*]/g).length >= 1 : false;
    const is8CharsLong = input ? input.length >= 8 : false;
    return has2Caps && 
            has2Smalls && 
            has2Digits && 
            has1Symbol && 
            is8CharsLong;
};
InputValidator.isValidOrgName = function(input) {
    if (this.isEmpty(input)) return false;
    const re = /^[A-Za-z0-9 .,()]{3,30}$/;
    return re.test(input);
};
InputValidator.isValidEmail = function(input) {
    if (this.isEmpty(input)) return false;
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(input);
};
InputValidator.isValidPhoneNum = function(input) {
    if (this.isEmpty(input)) return false;
    const re = /^[89]+\d{7}$/;
    return re.test(input);
};
InputValidator.isValidPortNum = function(input) {
    if (this.isEmpty(input)) return false;
    if (/^[0-9]{1,5}$/.test(input)) {
        var port = parseInt(input, 10);
        return (port >= 0 && port <= 65535);
    }
    return input === "*";
};
InputValidator.isValidRuleName = function(input) {
    if (this.isEmpty(input)) return false;
    const re = /^[A-Za-z0-9]{3,10}$/;
    return re.test(input);
};
InputValidator.isNum = function(input) {
    if (this.isEmpty(input)) return false;
    const re = /^[0-9]$/;
    return re.test(input);
};
InputValidator.isValidIp = function(input) {
    if (this.isEmpty(input)) return false;
    const re = /^(?=[\d\*]+\.[\d\*]\.[\d\*]\.[\d\*]$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9]|\*)\.?){4}$/;
    return input === "*" ? true : re.test(input);
};
InputValidator.isValidOTP = function(input) {
    if (this.isEmpty(input)) return false;
    const re = /^\d{6}$/;
    return re.test(input);
};
InputValidator.isValidUrl = function(input) {
    if (this.isEmpty(input)) return false;
    const re = /^(?:(?:(?:https?):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/;
    // /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/
    return re.test(input);
};

InputValidator.isValidDomain = function(input) {
    const toBeValidated = input.toLowerCase();

    const domainStartWithDot = /^(?:\.[a-zA-Z]{2,})+$/;
    const domain = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    return toBeValidated.startsWith('.') ? domainStartWithDot.test(toBeValidated) : domain.test(toBeValidated);
};

export default InputValidator;