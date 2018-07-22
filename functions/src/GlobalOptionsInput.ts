/**
 * Interface to store user input (options) for processing
 * @author Harish S/O Balamurugan
 */
export class GlobalOptionsInput {
    public dpi: boolean;
    public virusScan: boolean;
    public blockAds: boolean; 
    public blockMalicious: boolean;

    private parseBool(input: string): boolean {
        const input_lower = input.toLowerCase();
        return (input_lower === 'true' || input_lower === 't') ? true : false;
    }

    public constructor(dpi: string, virusScan: string, blockAds: string, blockMalicious: string) {
        this.dpi = this.parseBool(dpi);
        this.virusScan = this.parseBool(virusScan);
        this.blockAds = this.parseBool(blockAds);
        this.blockMalicious = this.parseBool(blockMalicious);
    }

    public toString(): string {
        return JSON.stringify({
            dpi: this.dpi,
            virusScan: this.virusScan,
            blockAds: this.blockAds,
            blockMalicious: this.blockMalicious
        });
    }
}