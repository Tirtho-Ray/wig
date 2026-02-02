import * as bcrypt from 'bcrypt';

export class SecurityUtil {

  static async hashData(data: string, saltRounds: number): Promise<string> {
    return bcrypt.hash(data, saltRounds);
  }


  static async compareData(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }


  static euclideanDistance(source: number[], target: number[]): number {
    return Math.sqrt(
      source.reduce((acc, val, i) => acc + Math.pow(val - target[i], 2), 0),
    );
  }
}