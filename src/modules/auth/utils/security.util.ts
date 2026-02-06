import * as bcrypt from 'bcrypt';

export class SecurityUtil {
  private static readonly DEFAULT_SALT_ROUNDS = 12;

  static async hashData(data: string, saltRounds?: number): Promise<string> {
    return bcrypt.hash(data, saltRounds || this.DEFAULT_SALT_ROUNDS);
  }

  static async compareData(data: string, hash: string): Promise<boolean> {
    if (!data || !hash) return false;
    return bcrypt.compare(data, hash);
  }


  static euclideanDistance(source: number[], target: number[]): number {
    if (source.length !== target.length) {
      throw new Error('Vector dimensions must match');
    }
    
    let sum = 0;
    for (let i = 0; i < source.length; i++) {
      const diff = source[i] - target[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }
}