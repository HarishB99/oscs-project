import { InputValidator } from './InputValidator';
import { auth } from 'firebase-admin';
/**
 * Authentication library containing utilities 
 * to facilitate authentication.
 * @author Harish S/O Balamurugan
 */
export class Authenticator {
    public static readonly TOKEN_HEADER = 'Authorisation';

    /**
     * Function to retrieve the id token sent by client 
     * in the custom request header 'Authorisation'.
     * The value of the header is formatted as 'Bearer <token>'
     */
    public getAccessToken(header: string): string {
        if (!(new InputValidator().isEmpty(header))) {
            const match = header.match(/^Bearer\s+([^\s]+)$/);
            if (match) {
                return match[1];
            }
        }
        return null;
    }

    /**
     * Function to check whether the received token is 
     * valid and, if yes, return the user's uid for 
     * other processes (e.g. Read user data from database)
     * @param header The request header, 'Authorisation'
     */
    public async checkAccess(header: string): Promise<auth.UserRecord> {
        const { uid } = await auth().verifyIdToken(this.getAccessToken(header));
        const userRecord = await auth().getUser(uid);
        return userRecord;
    }
}