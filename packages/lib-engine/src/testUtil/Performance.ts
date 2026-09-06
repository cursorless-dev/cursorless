export class PerformanceInterval {
  private start = performance.now();

  constructor(private name: string) {}

  end() {
    const end = performance.now();
    print(this.name, end - this.start);
  }
}

export class PerformanceTick {
  private duration = 0;
  private ts = 0;

  constructor(private name: string) {}

  start() {
    this.ts = performance.now();
  }

  stop() {
    this.duration += performance.now() - this.ts;
  }

  end() {
    print(this.name, this.duration);
  }
}

function print(name: string, duration: number) {
  console.log(`${name}: ${Math.round(duration)}ms`);
}
