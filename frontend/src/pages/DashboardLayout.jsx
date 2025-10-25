
import { useRef, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect.jsx';
import MouseFollower from '../components/MouseFollower.jsx';
import './Dashboard.css';

// Import AnimatedCanvas from LandingPage
const AnimatedCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const PARTICLE_COUNT = Math.floor((canvas.width * canvas.height) / 20000);
        const MAX_LINK_DISTANCE = 150;
        const PARTICLE_COLOR = 'rgba(56, 116, 255, 0.7)';

        let particles = [];
        let ripples = [];

        let mouse = {
            x: null,
            y: null,
            radius: 150
        };

        class Ripple {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.radius = 0;
                this.maxRadius = 60;
                this.speed = 1.5;
                this.opacity = 1;
            }

            update() {
                this.radius += this.speed;
                if (this.radius > this.maxRadius) {
                    this.opacity = 1 - (this.radius - this.maxRadius) / 40;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(56, 116, 255, ${this.opacity})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 1.5 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                if (mouse.x !== null) {
                    let dx = this.x - mouse.x;
                    let dy = this.y - mouse.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x += (dx / distance) * force * 0.5;
                        this.y += (dy / distance) * force * 0.5;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = PARTICLE_COLOR;
                ctx.fill();
            }
        }

        function init() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
        }

        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < MAX_LINK_DISTANCE) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);

                        const opacity = 1 - distance / MAX_LINK_DISTANCE;
                        ctx.strokeStyle = `rgba(0, 234, 211, ${opacity * 0.2})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
        }

        let animationFrameId;
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = ripples.length - 1; i >= 0; i--) {
                ripples[i].update();
                ripples[i].draw();
                if (ripples[i].opacity <= 0) {
                    ripples.splice(i, 1);
                }
            }

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            connectParticles();

            if (mouse.x !== null) {
                for (let i = 0; i < particles.length; i++) {
                    let dx = particles[i].x - mouse.x;
                    let dy = particles[i].y - mouse.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        ctx.beginPath();
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(particles[i].x, particles[i].y);
                        const opacity = 1 - distance / mouse.radius;
                        ctx.strokeStyle = `rgba(240, 242, 245, ${opacity * 0.2})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        const handleMouseMove = (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        };

        const handleMouseOut = () => {
            mouse.x = null;
            mouse.y = null;
        };

        const handleMouseDown = (event) => {
            ripples.push(new Ripple(event.x, event.y));
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);
        window.addEventListener('mousedown', handleMouseDown);

        init();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('mousedown', handleMouseDown);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="canvas-background"></canvas>;
};

const DashboardLayout = () => {
  return (
    <>
      <MouseFollower />
      <AnimatedCanvas />
      <div className="content-wrapper">
        <div className="dashboard-layout">
          <header className="header">
            <nav className="container nav-bar">
              <Link to="/dashboard" className="logo">Dot<span>Nation</span></Link>
               <div className="nav-links">
                 <Link to="/dashboard">Campaigns</Link>
                 <Link to="/dashboard/browse">Browse</Link>
                 <Link to="/dashboard/create-campaign">Create</Link>
                 <Link to="/dashboard/my-campaigns">My Campaigns</Link>
                 <Link to="/dashboard/my-donations">My Donations</Link>
                 <Link to="/dashboard/profile">Profile</Link>
                 <Link to="/dashboard/settings">Settings</Link>
               </div>
              <WalletConnect />
            </nav>
          </header>
          <main className="dashboard-main">
            <div className="container">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;