export class ErrorCode {
    public static readonly ACCOUNT = {
        BAD_DATA: {
            code: 'account/bad-data',
            message: 'Data received were not valid'
        },
        CREATE: {
            code: 'account/creation-failure',
            message: 'The account creation was unsuccessful'
        },
        ALREADY_EXIST: {
            code: 'account/creation-failure',
            message: 'Account already exists'
        },
        UPDATE: {
            code: 'account/update-failure',
            message: 'The account update operation was unsuccessful'
        },
        DELETE: {
            code: 'account/delete-failure',
            message: 'The account deletion was unsuccessful'
        },
        LOGIN: {
            code: 'account/login-failure',
            message: 'Credentials received were invalid'
        },
        ACCESS: {
            code: 'account/access-denied',
            message: 'Account details have not been verified by user'
        }
    };

    public static readonly RULE = {
        BAD_DATA: {
            code: 'rule/bad-data',
            message: 'Data received were not valid'
        },
        CREATE: {
            code: 'rule/creation-failure',
            message: 'The rule creation was unsuccessful'
        },
        ALREADY_EXIST: {
            code: 'rule/creation-failure',
            message: 'Another rule with the same name has been created before'
        },
        UPDATE: {
            code: 'rule/update-failure',
            message: 'The update operation was unsuccessful'
        },
        NOT_FOUND: {
            code: 'rule/delete-failure',
            message: 'The rule does not exist'
        },
        DELETE: {
            code: 'rule/delete-failure',
            message: 'The delete operation was unsuccessful'
        },
        ACCESS_DENIED: {
            code: 'rule/access-denied',
            message: 'Credentials received were invalid'
        }
    };

    public static readonly FILTER = {
        BAD_DATA: {
            code: 'filter/bad-data',
            message: 'Data received were not valid'
        },
        CREATE: {
            code: 'filter/creation-failure',
            message: 'The filter creation was unsuccessful'
        },
        UPDATE: {
            code: 'filter/update-failure',
            message: 'The update operation was unsuccessful'
        },
        DELETE: {
            code: 'filter/delete-failure',
            message: 'The delete operation was unsuccessful'
        },
        ACCESS_DENIED: {
            code: 'filter/access-denied',
            message: 'Credentials received were invalid'
        }
    };

    public static readonly GLOBAL_OPTIONS = {
        BAD_DATA: {
            code: 'options/bad-data',
            message: 'Data received were not valid'
        },
        UPDATE: {
            code: 'options/update-failure',
            message: 'The update operation was unsuccessful'
        }
    };
}