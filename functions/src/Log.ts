/**
 * A class defining a typical Log format
 * @author Harish S/O Balamurugan
 */
export class Log {
    public static readonly ACTION = {
        CREATE: 'create',
        RETRIEVE: 'retrieve',
        UPDATE: 'update',
        DELETE: 'delete'
    };

    public static readonly TYPE = {
        RULE: 'rule',
        FILTER: 'filter',
        OPTIONS: 'options',
        GET_REQUEST: 'GET_request',
        ACCOUNT: 'account'
    };

    public static readonly METHOD = {
        GET: 'GET',
        POST: 'POST'
    };

    public static readonly NOT_APPLICABLE: string = 'N.A.';
    
    public action: string;
    public type: string;
    public url: string;
    public ip: string;
    public uid: string;
    public outcome: string;
    public remarks: any;
    public timestamp: any;
    public method: string;
    public input: any;

    private parseBool(input: string): boolean {
        const input_lower = input.toLowerCase();
        return (input_lower === 'true' || input_lower === 't') ? true : false;
    }

    public constructor(action: string, type: string, url: string, ip: string, uid: string, outcome: boolean, remarks: any, timestamp: any, method: string, input: any) {
        this.action = action;
        this.type = type;
        this.url = url;
        this.ip = ip;
        this.uid = uid ? uid : Log.NOT_APPLICABLE;
        this.outcome = outcome ? 'success' : 'failure';
        this.remarks = remarks;
        this.timestamp = timestamp;
        this.method = method;
        this.input = input;
    }

    public log(): object {
        return JSON.parse(this.toString());
    }

    public toString(): string {
        return JSON.stringify({
            action: this.action,
            type: this.type,
            url: this.url,
            ip: this.ip,
            uid: this.uid,
            outcome: this.outcome,
            remarks: this.remarks,
            timestamp: this.timestamp,
            method: this.method,
            input: this.input
        });
    }
}