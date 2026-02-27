// rngEngine.ts

class RNGEngine {
    private currentBet: number = 0;
    private lossStreakCount: number = 0;
    private companyProfit: number = 0;
    private bettingHistory: { betAmount: number, win: boolean }[] = [];

    constructor() {
        // Initialization can be done here if needed
    }

    // Generate a random number between min and max
    private getRandom(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    // Simulate a bet
    public placeBet(betAmount: number, winningProbability: number): boolean {
        this.currentBet = betAmount;
        const randomValue = this.getRandom(0, 1);
        const win = randomValue < winningProbability;

        if (win) {
            this.companyProfit -= betAmount;
            this.bettingHistory.push({ betAmount, win: true });
            this.lossStreakCount = 0; // Reset loss streak
            return true;
        } else {
            this.companyProfit += betAmount;
            this.bettingHistory.push({ betAmount, win: false });
            this.lossStreakCount++;
            return false;
        }
    }

    // Get total company profit
    public getCompanyProfit(): number {
        return this.companyProfit;
    }

    // Get current loss streak
    public getLossStreakCount(): number {
        return this.lossStreakCount;
    }

    // Get betting history
    public getBettingHistory(): { betAmount: number, win: boolean }[] {
        return this.bettingHistory;
    }
}

// Export the RNGEngine class to use in other parts of the application
export default RNGEngine;