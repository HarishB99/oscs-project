import { InputValidator } from './InputValidator';
import { auth } from 'firebase-admin';
import { UserInput } from './types/UserInput';
import { UserClaim } from './types/UserClaim';
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
    private getAccessToken(header: string): string {
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

    public async userAlreadyExists(user_details: UserInput) {
        let userExists = false;

        const userWithSameEmail = await auth().getUserByEmail(user_details.email);
        const userWithSamePhoneNumber = await auth().getUserByPhoneNumber(user_details.phoneNumber);

        if (userWithSameEmail || userWithSamePhoneNumber) {
            userExists = true;
        } else {
            const usersWithSameOrganisation = await this.getUserWithSameDetails(user_details);
            if (usersWithSameOrganisation) {
                userExists = true;
            }
        }

        return userExists;
    }

    private async getUserWithSameDetails(user_details: UserInput) {
        const usersWithSameOrganisation: auth.UserRecord[] = [];
    
        let result = await auth().listUsers(1000);
        while (new InputValidator().isEmpty(result.pageToken)) {
            const users = result.users;
            for (const user of users) {
                const claims: UserClaim = user.customClaims as UserClaim;
                if (claims.organisation === user_details.organisation) {
                    usersWithSameOrganisation.push(user);
                }
            }
            result = await auth().listUsers(1000, result.pageToken)
        }

        if (usersWithSameOrganisation.length === 0) {
            return null;
        } else {
            let finalUser: auth.UserRecord = null;
            for (const user of usersWithSameOrganisation) {
                if (user.email === user_details.email && user.phoneNumber === user_details.phoneNumber) {
                    finalUser = user;
                }
            }

            return finalUser;
        }
    }
}