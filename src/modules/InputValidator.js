var InputValidator = function() {};
InputValidator.isEmpty = function(input) {
    return input === "" || typeof input === "undefined" || input === null;
};
InputValidator.isAReasonablyStrongPassword = function(input) {
    const re = new RegExp('^(?=.{2,}[a-z])(?=.{2,}[A-Z])(?=.{2,}[0-9])(?=.+[!@#$%^&*])(?=.{8,})', 'u');
    return re.test(input);
};
InputValidator.isValidOrgName = function(input) {
    const re = /^[A-Za-z0-9 .,()]{3,30}$/;
    return re.test(input);
};
InputValidator.isValidEmail = function(input) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(input);
};
InputValidator.isValidPhoneNum = function(input) {
    const re = /^[89]+\d{7}$/;
    return re.test(input);
};
InputValidator.isValidPortNum = function(input) {
    if (InputValidator.isNum(input)) {
        var port = parseInt(input, 10);
        return (port >= 0 && port <= 65535) ? true : false;
    }
    return input === "*";
};
InputValidator.isValidRuleName = function(input) {
    const re = /^[A-Za-z0-9]{3,10}$/;
    return re.test(input);
};
InputValidator.isNum = function(input) {
    try {
        const int = parseInt(input);
        return !isNaN(int);
    } catch (error) {
        return false;
    }
};
InputValidator.isValidIp = function(input) {
    const re = /^(?=[\d\*]+\.[\d\*]\.[\d\*]\.[\d\*]$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9]|\*)\.?){4}$/;
    return re.test(input);
};
InputValidator.isValidOTP = function(input) {
    const re = /^\d{6}$/;
    return re.test(input);
};

export default InputValidator;