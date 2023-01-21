import { RandomGenerator } from '../random';
import { toMillis, toSlackTs } from './timestamp';

export type TimestampGeneratorOptions = {
  maxTimeDiffMillis?: number;
  minTimeDiffMillis?: number;
  startTime?: Date;
  generatedTimestamps?: string[];
  randomGenerator?: RandomGenerator;
};

export class TimestampGenerator {
  public readonly maxDiff: number;
  public readonly minDiff: number;
  private randomGenerator: RandomGenerator;
  private last: string;
  private generated;

  constructor(options: TimestampGeneratorOptions = {}) {
    this.maxDiff = options.maxTimeDiffMillis || 48 * 60 * 60 * 1000;
    this.minDiff = options.minTimeDiffMillis || 700;
    this.randomGenerator = options.randomGenerator || new RandomGenerator();
    this.last = toSlackTs((options.startTime || new Date()).getTime());
    this.generated = new Set(options.generatedTimestamps || []);
  }

  get generatedTimestamps() {
    return Array.from(this.generated);
  }

  newer() {
    return this.next('add');
  }

  older() {
    return this.next('subtract');
  }

  private next(op: 'add' | 'subtract') {
    let nextTs =
      op === 'add'
        ? this.addRandomTime(this.last)
        : this.subtractRandomTime(this.last);

    while (this.generated.has(nextTs)) {
      // prevent duplicate
      nextTs = this.increaseTimestampPart(nextTs);
    }

    this.generated.add(nextTs);
    this.last = nextTs;
    return nextTs;
  }

  private addRandomTime(ts: string) {
    return toSlackTs(
      toMillis(ts) + this.randomGenerator.number(this.minDiff, this.maxDiff),
    );
  }

  private subtractRandomTime(ts: string) {
    return toSlackTs(
      toMillis(ts) - this.randomGenerator.number(this.minDiff, this.maxDiff),
    );
  }

  private increaseTimestampPart(ts: string) {
    // eslint-disable-next-line prefer-const
    let [seconds, part] = ts.split('.').map((n) => parseInt(n));
    part = (part || 0) + 100;
    const padding = '0'.repeat(6 - part.toString().length);
    return (seconds || 0).toString() + '.' + padding + part.toString();
  }
}
