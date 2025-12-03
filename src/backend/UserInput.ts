import kvs from "@forge/kvs";
export class UserInput {
  billingMonth: string;
  sharedSecurityCost: number;
  constructor(billingMonth: string, sharedSecurityCost: number = 0) {
    this.billingMonth = billingMonth;
    this.sharedSecurityCost = sharedSecurityCost;
  }

  public static loadFromStore = async (): Promise<UserInput> => {
    try {
      const data = (await kvs.get(`userInput`)) as UserInput;
      return data || new UserInput("");
    } catch (error) {
      console.error("Error fetching settings:", error);
      return new UserInput("");
    }
  };

  public static saveToStore = async (userInput: UserInput): Promise<void> => {
    try {
      await kvs.set(`userInput`, userInput);
    } catch (error) {
      console.error("Error saving user input:", error);
    }
  };
}
