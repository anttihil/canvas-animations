// setup canvas
let canvas: HTMLCanvasElement | null;
let ctx: CanvasRenderingContext2D | null;
let flowField: FlowFieldEffect | null;
let flowFieldAnimation: number | null;

window.onload = () => {
  canvas = document.getElementById("canvas1") as HTMLCanvasElement;
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height);
  flowField.animate(0);
};

window.onresize = () => {
  if (!canvas) return;
  if (!ctx) return;
  if (!flowFieldAnimation) return;
  cancelAnimationFrame(flowFieldAnimation);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height);
  flowField.animate(0);
};

const mouse = {
  x: 0,
  y: 0,
};

window.onmousemove = (event: MouseEvent) => {
  mouse.x = event.x;
  mouse.y = event.y;
};

class FlowFieldEffect {
  #ctx: CanvasRenderingContext2D;
  #width: number;
  #height: number;
  #lastTime = 0;
  #interval = 1000 / 60;
  #timer = 0;
  #cellSize = 7;
  #gradient: CanvasGradient | null = null;
  #radius: number = 5;
  #vr: number = 0.03;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.#ctx = ctx;
    this.#width = width;
    this.#height = height;
    this.#createGradient();
    this.#ctx.lineWidth = 1;
    this.#ctx.strokeStyle = this.#gradient ?? "white";
  }

  #drawLine(angle: number, x: number, y: number) {
    let positionX = x;
    let positionY = y;
    let dx = mouse.x - positionX;
    let dy = mouse.y - positionY;
    const distance = (dx * dx + dy * dy) / 1000;
    const length = Math.min(Math.max(distance, 10), 60);

    this.#ctx.beginPath();
    this.#ctx.moveTo(x, y);
    this.#ctx.lineTo(
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length
    );
    this.#ctx.stroke();
  }

  #createGradient() {
    this.#gradient = this.#ctx.createLinearGradient(
      0,
      0,
      this.#width,
      this.#height
    );
    this.#gradient.addColorStop(0.1, "crimson");
    this.#gradient.addColorStop(0.9, "blue");
  }

  animate(timeStamp: number) {
    const deltaTime = timeStamp - this.#lastTime;
    this.#lastTime = timeStamp;
    if (this.#timer > this.#interval) {
      this.#ctx.clearRect(0, 0, this.#width, this.#height);
      this.#radius += this.#vr;

      if (this.#radius > 5 || this.#radius < -5) {
        this.#vr *= -1;
      }
      for (let y = 0; y < this.#height; y += this.#cellSize) {
        for (let x = 0; x < this.#width; x += this.#cellSize) {
          const angle =
            (Math.cos(mouse.x * x * 0.0001) + Math.sin(mouse.y * y * 0.0001)) *
            this.#radius;
          this.#drawLine(angle, x, y);
        }
      }
      this.#timer = 0;
    } else {
      this.#timer += deltaTime;
    }
    flowFieldAnimation = requestAnimationFrame(this.animate.bind(this));
  }
}
