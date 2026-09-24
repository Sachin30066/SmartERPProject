import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cone' | 'barrel' | 'crate';
}

interface GoldenBox {
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  floatOffset: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  alpha: number;
}

@Component({
  selector: 'app-dino-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dino-game.component.html',
  styleUrls: ['./dino-game.component.scss']
})
export class DinoGameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() message: string = 'Stock Data Sync Offline';
  @Input() subMessage: string = 'Unable to fetch inventory records. Keep warehouse operations moving while we reconnect!';
  @Output() retry = new EventEmitter<void>();

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number = 0;

  score = 0;
  highScore = 0;
  packagesCollected = 0;
  gameState: 'idle' | 'running' | 'gameover' = 'idle';

  // Canvas dimensions
  private canvasWidth = 680;
  private canvasHeight = 200;
  private groundY = 162;

  // Forklift Player
  private player = {
    x: 55,
    y: 114,
    width: 48,
    height: 48,
    velocityY: 0,
    gravity: 0.72,
    jumpStrength: -12.5,
    isGrounded: true,
    wheelAngle: 0
  };

  private obstacles: Obstacle[] = [];
  private goldenBoxes: GoldenBox[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  private groundOffset = 0;
  private backgroundOffset = 0;
  private gameSpeed = 5.2;
  private spawnTimer = 0;
  private spawnInterval = 85;
  private goldenBoxTimer = 0;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    this.ctx = canvas.getContext('2d')!;

    const saved = localStorage.getItem('smarterp_warehouse_highscore');
    if (saved) {
      this.highScore = parseInt(saved, 10) || 0;
    }

    this.resetGame();
    this.draw();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      this.handleAction();
    }
  }

  handleCanvasClick(): void {
    this.handleAction();
  }

  handleAction(): void {
    if (this.gameState === 'idle') {
      this.startGame();
      this.jump();
    } else if (this.gameState === 'running') {
      this.jump();
    } else if (this.gameState === 'gameover') {
      this.restartGame();
    }
  }

  private jump(): void {
    if (this.player.isGrounded) {
      this.player.velocityY = this.player.jumpStrength;
      this.player.isGrounded = false;

      // Dust particles on jump
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: this.player.x + 10 + Math.random() * 20,
          y: this.groundY - 2,
          vx: (Math.random() - 0.7) * 3,
          vy: -Math.random() * 2.5,
          alpha: 0.8,
          color: '#cbd5e1',
          size: 3 + Math.random() * 3
        });
      }
    }
  }

  private startGame(): void {
    this.gameState = 'running';
    this.gameLoop();
  }

  private restartGame(): void {
    this.resetGame();
    this.startGame();
    this.jump();
  }

  private resetGame(): void {
    this.score = 0;
    this.packagesCollected = 0;
    this.gameSpeed = 5.2;
    this.obstacles = [];
    this.goldenBoxes = [];
    this.particles = [];
    this.floatingTexts = [];
    this.spawnTimer = 0;
    this.spawnInterval = 85;
    this.player.y = this.groundY - this.player.height;
    this.player.velocityY = 0;
    this.player.isGrounded = true;
  }

  private gameLoop = (): void => {
    if (this.gameState !== 'running') return;

    this.update();
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(): void {
    // 1. Forklift physics
    this.player.velocityY += this.player.gravity;
    this.player.y += this.player.velocityY;

    const floor = this.groundY - this.player.height;
    if (this.player.y >= floor) {
      this.player.y = floor;
      this.player.velocityY = 0;
      this.player.isGrounded = true;
    } else {
      this.player.isGrounded = false;
    }

    this.player.wheelAngle += this.gameSpeed * 0.1;

    // 2. Score & Speed Progression
    this.score += 1;
    if (this.score % 180 === 0 && this.gameSpeed < 11.5) {
      this.gameSpeed += 0.35;
      this.spawnInterval = Math.max(50, this.spawnInterval - 3);
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('smarterp_warehouse_highscore', this.highScore.toString());
    }

    // 3. Ground & Background offsets
    this.groundOffset = (this.groundOffset + this.gameSpeed) % 40;
    this.backgroundOffset = (this.backgroundOffset + this.gameSpeed * 0.3) % 120;

    // 4. Exhaust Particles when running
    if (Math.random() < 0.35 && this.player.isGrounded) {
      this.particles.push({
        x: this.player.x + 2,
        y: this.player.y + 36,
        vx: -2 - Math.random() * 2,
        vy: -0.5 - Math.random(),
        alpha: 0.6,
        color: '#94a3b8',
        size: 3 + Math.random() * 2
      });
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 1;
      ft.alpha -= 0.025;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 5. Spawn Warehouse Obstacles
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnInterval = Math.floor(65 + Math.random() * 55);

      const r = Math.random();
      let type: 'cone' | 'barrel' | 'crate' = 'cone';
      let width = 22;
      let height = 34;

      if (r < 0.4) {
        type = 'cone';
        width = 22;
        height = 32;
      } else if (r < 0.75) {
        type = 'barrel';
        width = 26;
        height = 38;
      } else {
        type = 'crate';
        width = 32;
        height = 32;
      }

      this.obstacles.push({
        x: this.canvasWidth + 20,
        y: this.groundY - height,
        width,
        height,
        type
      });
    }

    // 6. Spawn Golden Inventory Boxes
    this.goldenBoxTimer++;
    if (this.goldenBoxTimer > 160 && Math.random() < 0.3) {
      this.goldenBoxTimer = 0;
      this.goldenBoxes.push({
        x: this.canvasWidth + 30,
        y: this.groundY - 60 - Math.random() * 25,
        width: 22,
        height: 22,
        collected: false,
        floatOffset: 0
      });
    }

    // Update Golden Boxes
    for (let i = this.goldenBoxes.length - 1; i >= 0; i--) {
      const box = this.goldenBoxes[i];
      box.x -= this.gameSpeed;
      box.floatOffset += 0.08;

      // Check collision with player
      if (
        !box.collected &&
        this.player.x < box.x + box.width &&
        this.player.x + this.player.width > box.x &&
        this.player.y < box.y + box.height &&
        this.player.y + this.player.height > box.y
      ) {
        box.collected = true;
        this.score += 50;
        this.packagesCollected++;
        this.floatingTexts.push({
          x: box.x,
          y: box.y,
          text: '+50 📦',
          alpha: 1
        });
      }

      if (box.x + box.width < -20 || box.collected) {
        this.goldenBoxes.splice(i, 1);
      }
    }

    // 7. Move obstacles & detect collision
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.gameSpeed;

      // Forgiving bounding box collision
      const padX = 8;
      const padY = 6;
      if (
        this.player.x + padX < obs.x + obs.width &&
        this.player.x + this.player.width - padX > obs.x &&
        this.player.y + padY < obs.y + obs.height &&
        this.player.y + this.player.height - padY > obs.y
      ) {
        this.gameOver();
        return;
      }

      if (obs.x + obs.width < -20) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  private gameOver(): void {
    this.gameState = 'gameover';
    this.draw();
  }

  private draw(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // 1. Warehouse Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.7, '#1e293b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 2. Distant Warehouse Shelves (Parallax)
    this.drawWarehouseShelves(ctx);

    // 3. Ground & Hazard Stripe Conveyor
    this.drawConveyorGround(ctx);

    // 4. Headlight cone beam
    this.drawHeadlight(ctx);

    // 5. Draw Particles
    this.drawParticles(ctx);

    // 6. Draw Golden Boxes
    this.drawGoldenBoxes(ctx);

    // 7. Draw Obstacles
    this.drawObstacles(ctx);

    // 8. Draw Player (Forklift)
    this.drawForklift(ctx);

    // 9. Floating texts
    this.drawFloatingTexts(ctx);

    // 10. Overlay state prompts
    if (this.gameState === 'idle') {
      this.drawPrompt(ctx, '▶ PRESS SPACE OR TAP TO DISPATCH FORKLIFT');
    } else if (this.gameState === 'gameover') {
      this.drawGameOver(ctx);
    }
  }

  private drawWarehouseShelves(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
    ctx.lineWidth = 1.5;

    // Shelf frames
    for (let x = -this.backgroundOffset; x < this.canvasWidth + 80; x += 90) {
      // Upright columns
      ctx.beginPath();
      ctx.moveTo(x, 30);
      ctx.lineTo(x, this.groundY);
      ctx.stroke();

      // Horizontal racks
      ctx.beginPath();
      ctx.moveTo(x, 60);
      ctx.lineTo(x + 90, 60);
      ctx.moveTo(x, 105);
      ctx.lineTo(x + 90, 105);
      ctx.stroke();

      // Crates on shelf (silhouette)
      ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.fillRect(x + 10, 42, 30, 18);
      ctx.fillRect(x + 48, 38, 32, 22);

      ctx.fillStyle = 'rgba(14, 165, 233, 0.1)';
      ctx.fillRect(x + 15, 84, 25, 21);
      ctx.fillRect(x + 48, 88, 30, 17);
    }
  }

  private drawConveyorGround(ctx: CanvasRenderingContext2D): void {
    // Ground base platform
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, this.groundY, this.canvasWidth, this.canvasHeight - this.groundY);

    // Glowing guide rail
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    ctx.lineTo(this.canvasWidth, this.groundY);
    ctx.stroke();

    // Yellow / Dark Industrial Hazard Stripes
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, this.groundY + 3, this.canvasWidth, 9);
    ctx.clip();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, this.groundY + 3, this.canvasWidth, 9);

    ctx.fillStyle = '#f59e0b'; // Amber yellow safety hazard
    for (let x = -this.groundOffset; x < this.canvasWidth + 40; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, this.groundY + 12);
      ctx.lineTo(x + 10, this.groundY + 3);
      ctx.lineTo(x + 18, this.groundY + 3);
      ctx.lineTo(x + 8, this.groundY + 12);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Lower floor tone
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, this.groundY + 13, this.canvasWidth, this.canvasHeight - this.groundY - 13);
  }

  private drawHeadlight(ctx: CanvasRenderingContext2D): void {
    const px = this.player.x + this.player.width;
    const py = this.player.y + 24;

    const beam = ctx.createRadialGradient(px, py, 5, px + 120, py + 10, 130);
    beam.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    beam.addColorStop(1, 'rgba(56, 189, 248, 0)');

    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + 140, py - 18);
    ctx.lineTo(px + 150, py + 28);
    ctx.closePath();
    ctx.fill();
  }

  private drawForklift(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.player;

    ctx.save();

    // 1. Forklift Body (Sleek SmartERP Indigo / Blue)
    // Main Chassis
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x + 4, y + 16, 32, 22, 5) : ctx.fillRect(x + 4, y + 16, 32, 22);
    ctx.fill();

    // Cab glass
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 16, y + 4, 16, 14);
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 16, y + 4, 16, 14);

    // Roll cage bar
    ctx.fillStyle = '#312e81';
    ctx.fillRect(x + 14, y + 2, 3, 16);
    ctx.fillRect(x + 30, y + 2, 3, 16);
    ctx.fillRect(x + 14, y + 2, 19, 3);

    // Warning Beacon on roof (Orange flashing)
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(x + 23, y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Front Mast / Lift Rails
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 36, y - 2, 4, 38);

    // Fork Blades
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 36, y + 32, 16, 4);

    // Loaded SmartERP Inventory Box on the fork!
    ctx.fillStyle = '#d97706'; // Cardboard Amber
    ctx.fillRect(x + 38, y + 14, 18, 18);
    // Box tape
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 38, y + 22, 18, 2);
    // ERP mark
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7px Inter, sans-serif';
    ctx.fillText('ERP', x + 40, y + 21);

    // Wheels (Rotating)
    const drawWheel = (wx: number, wy: number) => {
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(this.player.wheelAngle);
      // Outer tire
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      // Rim
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Spokes
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(7, 0);
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 7);
      ctx.stroke();
      ctx.restore();
    };

    drawWheel(x + 12, y + 38);
    drawWheel(x + 32, y + 38);

    ctx.restore();
  }

  private drawObstacles(ctx: CanvasRenderingContext2D): void {
    for (const obs of this.obstacles) {
      if (obs.type === 'cone') {
        // Traffic Safety Cone
        ctx.fillStyle = '#ea580c'; // Vibrant orange
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height - 4);
        ctx.lineTo(obs.x, obs.y + obs.height - 4);
        ctx.closePath();
        ctx.fill();

        // White reflective strips
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(obs.x + 5, obs.y + 11, obs.width - 10, 4);
        ctx.fillRect(obs.x + 3, obs.y + 20, obs.width - 6, 5);

        // Cone Base
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(obs.x - 2, obs.y + obs.height - 4, obs.width + 4, 4);

      } else if (obs.type === 'barrel') {
        // Industrial Oil Drum
        ctx.fillStyle = '#dc2626'; // Alert Red
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 4) : ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fill();

        // Barrel Ribs
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(obs.x, obs.y + 10, obs.width, 3);
        ctx.fillRect(obs.x, obs.y + 24, obs.width, 3);

        // Hazard symbol (yellow triangle)
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y + 14);
        ctx.lineTo(obs.x + obs.width / 2 + 5, obs.y + 22);
        ctx.lineTo(obs.x + obs.width / 2 - 5, obs.y + 22);
        ctx.closePath();
        ctx.fill();

      } else {
        // Wooden Storage Crate
        ctx.fillStyle = '#b45309';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Planks
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.moveTo(obs.x + obs.width, obs.y);
        ctx.lineTo(obs.x, obs.y + obs.height);
        ctx.stroke();
      }
    }
  }

  private drawGoldenBoxes(ctx: CanvasRenderingContext2D): void {
    for (const box of this.goldenBoxes) {
      if (box.collected) continue;
      const hoverY = box.y + Math.sin(box.floatOffset) * 4;

      // Glow behind box
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.beginPath();
      ctx.arc(box.x + box.width / 2, hoverY + box.height / 2, 16, 0, Math.PI * 2);
      ctx.fill();

      // Golden package
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(box.x, hoverY, box.width, box.height);

      // Ribbon
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(box.x + box.width / 2 - 2, hoverY, 4, box.height);
      ctx.fillRect(box.x, hoverY + box.height / 2 - 2, box.width, 4);

      // Star / shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(box.x + 4, hoverY + 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawFloatingTexts(ctx: CanvasRenderingContext2D): void {
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillStyle = '#f59e0b';
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = ft.alpha;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;
  }

  private drawPrompt(ctx: CanvasRenderingContext2D, text: string): void {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(this.canvasWidth / 2 - 180, 70, 360, 36);

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.canvasWidth / 2 - 180, 70, 360, 36);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, this.canvasWidth / 2, 93);
  }

  private drawGameOver(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Alert Badge
    ctx.fillStyle = '#ef4444';
    ctx.font = '800 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ DISPATCH HALTED - CRASH DETECTED', this.canvasWidth / 2, 65);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillText(`Efficiency Score: ${this.score}  |  Packages Delivered: ${this.packagesCollected}`, this.canvasWidth / 2, 92);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 13px Inter, sans-serif';
    ctx.fillText('Tap or Press Space to Restart Forklift', this.canvasWidth / 2, 122);

    // Refresh circle
    ctx.beginPath();
    ctx.arc(this.canvasWidth / 2, 150, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#4f46e5';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText('↻', this.canvasWidth / 2, 155);
  }

  onRetryClick(): void {
    this.retry.emit();
  }
}
