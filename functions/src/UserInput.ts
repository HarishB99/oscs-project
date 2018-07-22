/**
 * Interface to store user input for processing
 * @author Harish S/O Balamurugan
 */
export class UserInput {
    public email: string;
    public password: string;
    public phoneNumber: string;
    public organisation: string;
    public photoURL: string;
    public displayName: string;
    
    /**
     * To construct an Input object to process user input
     * @param {*} email email of user
     * @param {*} password password of user
     * @param {*} phoneNumber phoneNumber of user
     * @param {*} organisation organisation of user
     * @param {*} photoURL url of the display picture of the user
     */
    public constructor(email: string, password: string, phoneNumber: string, organisation: string, photoURL: string) {
        this.email = email;
        this.password = password;
        this.phoneNumber = '+65'.concat(phoneNumber);
        this.organisation = organisation;
        this.photoURL = photoURL || 'https://material.io/tools/icons/static/icons/baseline-permidentity-24px.svg';
        this.displayName = this.email.substr(0, this.email.lastIndexOf('@'));
    }

    /**
     * @return a string representation of the Input object
     */
    public toString(): string {
        return JSON.stringify({
            email: this.email,
            password: this.password,
            phoneNumber: this.phoneNumber,
            organisation: this.organisation,
            photoURL: this.photoURL,
            displayName: this.displayName
        });
    }
}