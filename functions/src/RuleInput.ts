/**
 * Interface to store user input (rules) for processing
 * @author Harish S/O Balamurugan
 */
export class RuleInput {
    public name: string;
    public access: boolean;
    public priority: number;
    public proto: string;
    public sip: string;
    public sport: string;
    public dip: string;
    public dport: string;
    public readonly state: string = 'NEW,ESTABLISHED,RELATED';

    private parseBool(input: string): boolean {
        try {
            const binary = parseInt(input);
            return binary === 1 ? true: false;
        } catch (error) {
            const input_lower = input.toLowerCase();
            return (input_lower === 'true' || input_lower === 't') ? true : false;
        }
    }

    public constructor(name: string, access: string, priority: string, proto: string, sip: string, sport: string, dip: string, dport: string) {
        this.name = name;
        this.access = this.parseBool(access);
        this.priority = parseInt(priority);
        this.proto = proto;
        this.sip = sip;
        this.sport = sport;
        this.dip = dip;
        this.dport = dport;
    }

    public toString(): string {
        return JSON.stringify({
            name: this.name,
            access: this.access,
            priority: this.priority,
            proto: this.proto,
            sip: this.sip,
            sport: this.sport,
            dip: this.dip,
            dport: this.dport,
            state: this.state
        });
    }
}