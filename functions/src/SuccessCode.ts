export class SuccessCode {
    public static readonly ACCOUNT = {
        CREATE: {
            code: 'account/creation-success',
            message: 'The account was created successfully'
        },
        UPDATE: {
            code: 'account/update-success',
            message: 'The account was updated successfully'
        },
        DELETE: {
            code: 'account/delete-success',
            message: 'The account was deleted successfully'
        },
        LOGIN: {
            code: 'account/login-success',
            message: 'The account was successfully logged into the system'
        },
        ACCESS: {
            code: 'account/access-allowed',
            message: 'Account details have been verified by user'
        }
    };

    public static readonly RULE = {
        CREATE: {
            code: 'rule/creation-success',
            message: 'The rule was created successfully'
        },
        UPDATE: {
            code: 'rule/update-success',
            message: 'The update operation was completed successfully'
        },
        DELETE: {
            code: 'rule/delete-success',
            message: 'The delete operation was completed successfully'
        }
    };

    public static readonly FILTER = {
        CREATE: {
            code: 'filter/creation-success',
            message: 'The filter was created successfully'
        },
        UPDATE: {
            code: 'filter/update-success',
            message: 'The update operation was completed successfully'
        },
        DELETE: {
            code: 'filter/delete-success',
            message: 'The delete operation was completed successfully'
        }
    };

    public static readonly GLOBAL_OPTIONS = {
        UPDATE: {
            code: 'options/update-success',
            message: 'Success!'
        }
    };
}