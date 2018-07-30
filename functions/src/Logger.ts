import { Log } from "./Log";
import { Request } from 'express';

/**
 * A library containing utilities 
 * to facilitate logging application 
 * events. (Exclude authentication)
 * @author Harish S/O Balamurugan
 */
export class Logger {
    private readonly CREATE = Log.ACTION.CREATE;
    private readonly RETRIEVE = Log.ACTION.RETRIEVE;
    private readonly UPDATE = Log.ACTION.UPDATE;
    private readonly DELETE = Log.ACTION.DELETE;

    private readonly RULE = Log.TYPE.RULE;
    private readonly FILTER = Log.TYPE.FILTER;
    private readonly OPTIONS = Log.TYPE.OPTIONS;
    private readonly ACCOUNT = Log.TYPE.ACCOUNT;

    private readonly GET = Log.METHOD.GET;
    private readonly POST = Log.METHOD.POST;

    public userCreate(uid: string, timestamp: FirebaseFirestore.Timestamp): Log {
        return new Log(this.CREATE, this.ACCOUNT, null, null, uid, true, Log.NOT_APPLICABLE, timestamp, null);
    }

    public userDelete(uid: string, timestamp: FirebaseFirestore.Timestamp): Log {
        return new Log(this.DELETE, this.ACCOUNT, null, null, uid, true, Log.NOT_APPLICABLE, timestamp, null);
    }

    public getRuleRequestSuccess(request: Request, uid: string, timestamp: FirebaseFirestore.Timestamp) {
        const url = request.originalUrl;
        const ip = request.ip;
        return new Log(this.RETRIEVE, this.RULE, url, ip, uid, true, Log.NOT_APPLICABLE, timestamp, this.GET);
    }

    public getRuleRequestFailure(request: Request, uid: string, error: any, timestamp: FirebaseFirestore.Timestamp) {
        const url = request.originalUrl;
        const ip = request.ip;
        return new Log(this.RETRIEVE, this.RULE, url, ip, uid, true, error, timestamp, this.GET);
    }

    public ruleCreateSuccess(request: Request, uid: string, timestamp: FirebaseFirestore.Timestamp): Log {
        const url = request.originalUrl;
        const ip = request.ip;
        return new Log(this.CREATE, this.RULE, url, ip, uid, true, Log.NOT_APPLICABLE, timestamp, this.POST);
    }

    public ruleCreateFailure(request: Request, uid: string, error: any, timestamp: FirebaseFirestore.Timestamp): Log {
        const url = request.originalUrl;
        const ip = request.ip;
        return new Log(this.CREATE, this.RULE, url, ip, uid, false, error, timestamp, this.POST);
    }

    public ruleUpdateSuccess(request: Request, uid: string, timestamp: FirebaseFirestore.Timestamp): Log {
        const url = request.originalUrl;
        const ip = request.ip;
        return new Log(this.UPDATE, this.RULE, url, ip, uid, true, Log.NOT_APPLICABLE, timestamp, this.POST);
    }

    public ruleUpdateFailure(request: Request, uid: string, error: any, timestamp: FirebaseFirestore.Timestamp): Log {
        const url = request.originalUrl;
        const ip = request.ip;
        const remarks = error.message;
        return new Log(this.UPDATE, this.RULE, url, ip, uid, false, remarks, timestamp, this.POST);
    }

    public ruleDeleteSuccess(request: Request, uid: string, timestamp: FirebaseFirestore.Timestamp): Log {
        const url = request.originalUrl;
        const ip = request.ip;
        return new Log(this.DELETE, this.RULE, url, ip, uid, true, Log.NOT_APPLICABLE, timestamp, this.POST);
    }

    public ruleDeleteFailure(request: Request, uid: string, error: any, timestamp: FirebaseFirestore.Timestamp): Log {
        const url = request.originalUrl;
        const ip = request.ip;
        const remarks = error.message;
        return new Log(this.DELETE, this.RULE, url, ip, uid, false, remarks, timestamp, this.POST);
    }

    public filterUpdateSuccess(request: Request, uid: string, timestamp: FirebaseFirestore.Timestamp): Log {
        const url = request.originalUrl;
        const ip = request.ip;
        return new Log(this.UPDATE, this.FILTER, url, ip, uid, true, Log.NOT_APPLICABLE, timestamp, this.POST);
    }

    public filterUpdateFailure(request: Request, uid: string, error: any, timestamp: FirebaseFirestore.Timestamp): Log {
        const url = request.originalUrl;
        const ip = request.ip;
        const remarks = error.message;
        return new Log(this.UPDATE, this.FILTER, url, ip, uid, false, remarks, timestamp, this.POST);
    }

    public globalOptionsUpdateSuccess(request: Request, uid: string, timestamp: FirebaseFirestore.Timestamp): Log {
        const url = request.originalUrl;
        const ip = request.ip;
        return new Log(this.UPDATE, this.OPTIONS, url, ip, uid, true, Log.NOT_APPLICABLE, timestamp, this.POST);
    }

    public globalOptionsUpdateFailure(request: Request, uid: string, error: any, timestamp: FirebaseFirestore.Timestamp): Log {
        const url = request.originalUrl;
        const ip = request.ip;
        const remarks = error.message;
        return new Log(this.UPDATE, this.OPTIONS, url, ip, uid, false, remarks, timestamp, this.POST);
    }
}