import * as _ from 'lodash';

/**
 * Interface to store user input (filters) for processing
 * @author Harish S/O Balamurugan
 */
export class FilterInput {
    public domains: string[];
    public mode: boolean;

    private parseBool(input: string): boolean {
        const input_lower = input.toLowerCase();
        return (input_lower === 'true' || input_lower === 't') ? true : false;
    }

    public constructor(domains: string[], mode: string) {
        this.domains = _.uniq(domains);
        this.mode = this.parseBool(mode);
    }

    public toString(): string {
        return JSON.stringify({
            domains: this.domains,
            mode: this.mode
        });
    }
}