import * as _ from 'lodash';

/**
 * Interface to store user input (filters) for processing
 * @author Harish S/O Balamurugan
 */
export class FilterInput {
    public whitelist: string[];
    public blacklist: string[];
    public fakeNews: boolean;
    public socialMedia: boolean;
    public gambling: boolean;
    public pornography: boolean;

    private parseBool(input: string): boolean {
        const input_lower = input.toLowerCase();
        return (input_lower === 'true' || input_lower === 't') ? true : false;
    }

    public constructor(blacklist: string[], whitelist: string[], fakeNews: string, socialMedia: string, gambling: string, pornography: string) {
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
        this.fakeNews = this.parseBool(fakeNews);
        this.socialMedia = this.parseBool(socialMedia);
        this.gambling = this.parseBool(gambling);
        this.pornography = this.parseBool(pornography);
    }

    public toString(): string {
        return JSON.stringify({
            whitelist: this.whitelist,
            blacklist: this.blacklist,
            fakeNews: this.fakeNews,
            socialMedia: this.socialMedia,
            gambling: this.gambling,
            pornography: this.pornography
        });
    }
}