import * as _ from 'lodash';

/**
 * Interface to store user input (filters) for processing
 * @author Harish S/O Balamurugan
 */
export class FilterInput {
    public whitelist: string[];
    public blacklist: string[];

    public constructor(blacklist: string[], whitelist: string[]) {
        const receivedDomainsBlack = [];
        blacklist.forEach(domain => {
            receivedDomainsBlack.push(domain.toLowerCase());
        });

        const receivedDomainsWhite = [];
        whitelist.forEach(domain => {
            receivedDomainsWhite.push(domain.toLowerCase());
        });
        this.blacklist = _.uniq(receivedDomainsBlack);
        this.whitelist = _.uniq(receivedDomainsWhite);
    }

    public toString(): string {
        return JSON.stringify({
            whitelist: this.whitelist,
            blacklist: this.blacklist
        });
    }
}