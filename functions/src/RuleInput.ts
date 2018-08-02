/**
 * Interface to store user input (rules) for processing
 * @author Harish S/O Balamurugan
 */
export class RuleInput {
    public name: string;
    public access: boolean;
    public priority: number;
    public protocol: string;
    public sourceip: string;
    public sourceport: string;
    public destip: string;
    public destport: string;
    public direction: boolean;
    public readonly state: string = 'NEW,ESTABLISHED,RELATED';

    private parseBool(input: string): boolean {
        const input_lower = input.toLowerCase();
        return (input_lower === 'true' || input_lower === 't') ? true : false;
    }

    private parseIp(input: string): string {
        return (input === "*" || input === "*.*.*.*" || input === "0.0.0.0") ? "0.0.0.0" : input;
    }

    public constructor(name: string, access: string, priority: string, proto: string, sip: string, sport: string, dip: string, dport: string, direction: string) {
        this.name = name;
        this.access = this.parseBool(access);
        this.priority = parseInt(priority, 10);
        this.protocol = proto.toUpperCase();
        this.sourceip = this.parseIp(sip);
        this.sourceport = sport;
        this.destip = this.parseIp(dip);
        this.destport = dport;
        this.direction = this.parseBool(direction);
    }

    public toString(): string {
        return JSON.stringify({
            name: this.name,
            access: this.access,
            priority: this.priority,
            proto: this.protocol,
            sip: this.sourceip,
            sport: this.sourceport,
            dip: this.destip,
            dport: this.destport,
            state: this.state,
            incoming: this.direction
        });
    }
}