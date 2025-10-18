import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const AnimatedCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const PARTICLE_COUNT = Math.floor((canvas.width * canvas.height) / 20000);
        const MAX_LINK_DISTANCE = 150;
        const PARTICLE_COLOR = 'rgba(230, 0, 122, 0.7)';

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
                ctx.strokeStyle = `rgba(230, 0, 122, ${this.opacity})`;
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

const LandingPage = () => {

    useEffect(() => {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15
        });

        const elementsToAnimate = document.querySelectorAll('.scroll-animate');
        elementsToAnimate.forEach((el) => {
            scrollObserver.observe(el);
        });

        return () => {
            elementsToAnimate.forEach((el) => {
                scrollObserver.unobserve(el);
            });
        };
    }, []);

    return (
        <>
            <AnimatedCanvas />
            <div className="content-wrapper">
                <header className="header">
                    <nav className="container nav-bar">
                        <Link to="/" className="logo">Dot<span>Nation</span></Link>
                        <div className="nav-links">
                            <a href="#features">Features</a>
                            <a href="#">Docs</a>
                        </div>
                        <Link to="/dashboard" className="btn btn-primary">Launch App</Link>
                    </nav>
                </header>

                <main>
                    <section className="hero">
                        <div className="container hero-content">
                            <h1 className="scroll-animate">Decentralized Fundraising. Unchained Impact.</h1>
                            <p className="scroll-animate" style={{ transitionDelay: '100ms' }}>DotNation is a secure, scalable, and fully transparent platform for creators and donors. Launch your campaign, track your impact on-chain, and build community trust—all powered by Polkadot.</p>
                            <div className="hero-buttons scroll-animate" style={{ transitionDelay: '200ms' }}>
                                <a href="#" className="btn btn-primary">&gt; Launch a Campaign</a>
                                <a href="#" className="btn btn-secondary">Explore Causes</a>
                            </div>
                        </div>
                    </section>

                    <section className="seen-on scroll-animate">
                        <div className="container">
                            <p className="seen-on-title">Built with trusted, open-source technology</p>
                            <div className="logos">
                                <svg viewBox="0 0 81 81" fill="currentColor" height="35" width="35"><g><path d="M40.5 81c22.39 0 40.5-18.11 40.5-40.5C81 18.11 62.89 0 40.5 0 18.11 0 0 18.11 0 40.5 0 62.89 18.11 81 40.5 81zM20.6 40.5c0-10.99 8.91-19.9 19.9-19.9 10.99 0 19.9 8.91 19.9 19.9 0 10.99-8.91 19.9-19.9 19.9-10.99 0-19.9-8.91-19.9-19.9z"></path><path d="M40.5 31.7c-4.86 0-8.8 3.94-8.8 8.8s3.94 8.8 8.8 8.8 8.8-3.94 8.8-8.8-3.94-8.8-8.8-8.8z"></path></g></svg>
                                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="35" width="35" fill="currentColor"><title>Rust</title><path d="M12 11.137h11.313v1.725H12zm0 2.287h11.313v1.725H12zM0 12l6.02-6L7.51 7.5 1.5 12l6.01 4.5L6.02 18z" /></svg>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="35" viewBox="0 0 24 24"><path d="M19.53,8.37l-3.9-3.9a2.4,2.4,0,0,0-3.39,0L3.9,12.82a2.4,2.4,0,0,0,0,3.39l3.9,3.9a2.4,2.4,0,0,0,3.39,0L19.53,11.76a2.4,2.4,0,0,0,0-3.39ZM8.24,18.86,5.2,15.82a.4.4,0,0,1,0-.56l3-3.09a.4.4,0,0,1,.57,0l3,3.09a.4.4,0,0,1,0,.56l-3,3.09A.4.4,0,0,1,8.24,18.86Zm8.27-8.27L12.7,14.4a.4.4,0,0,1-.56,0L9.05,11.31a.4.4,0,0,1,0-.57l3.79-3.79a.4.4,0,0,1,.56,0l3.09,3.09A.4.4,0,0,1,16.51,10.59Z" /></svg>
                            </div>
                        </div>
                    </section>

                    <section className="why-us">
                        <div className="container">
                            <h2 className="scroll-animate">Rebuilding Trust in Giving</h2>
                            <div className="why-us-grid">
                                <div className="why-us-card scroll-animate">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 1.5m-5-1.5l1 1.5m7.5-1.5l-1 1.5m3-1.5l-1 1.5m-1.5-1.5l1 1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <h3>Radical Transparency</h3>
                                    <p>Every donation is an immutable, verifiable transaction on the blockchain. See exactly where funds are going in real time.</p>
                                </div>
                                <div className="why-us-card scroll-animate" style={{ transitionDelay: '100ms' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>
                                    <h3>Uncompromising Security</h3>
                                    <p>Built with enterprise-grade Rust smart contracts (ink!), our platform ensures that funds are locked, secure, and only accessible by the campaign creator.</p>
                                </div>
                                <div className="why-us-card scroll-animate" style={{ transitionDelay: '200ms' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                                    <h3>Direct Empowerment</h3>
                                    <p>Go from idea to impact without intermediaries. Your campaign, your community, your funds. We provide the tools; you drive the change.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="trust">
                        <div className="container">
                            <h2 className="scroll-animate">Designed for Trust & Transparency</h2>
                            <div className="trust-grid">
                                <div className="trust-card scroll-animate">
                                    <h3>Verifiable On-Chain Fund Flow</h3>
                                    <p>Funds never touch our servers. Donations go directly from a donor&apos;s wallet to the secure smart contract, and are only released to the creator.</p>
                                    <div className="trust-diagram">
                                        <div>👤<br /><span>Donor</span></div>
                                        <div className="arrow">&rarr;</div>
                                        <div>📄<br /><span>Smart Contract</span></div>
                                        <div className="arrow">&rarr;</div>
                                        <div>👥<br /><span>Creator</span></div>
                                    </div>
                                </div>
                                <div className="trust-card scroll-animate" style={{ transitionDelay: '100ms' }}>
                                    <h3>Audited & Open Source</h3>
                                    <p>Our codebase is publicly available for anyone to review and verify. We are committed to undergoing regular security audits to ensure platform integrity.</p>
                                    <a href="#" className="btn btn-secondary" style={{ marginTop: '15px' }}>View on GitHub</a>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="features">
                        <div className="container">
                            <h2 className="scroll-animate">An End-to-End Platform for Modern Fundraising</h2>
                            <div className="features-grid">
                                <div className="feature-card scroll-animate"><h3>Effortless Campaign Management</h3><p>Launch a campaign in minutes. Set your goal, tell your story, and define your timeline.</p></div>
                                <div className="feature-card scroll-animate" style={{ transitionDelay: '100ms' }}><h3>Real-Time, On-Chain Donations</h3><p>Donors connect their Polkadot.js wallet and contribute with a single click.</p></div>
                                <div className="feature-card scroll-animate" style={{ transitionDelay: '200ms' }}><h3>Verifiable Impact & Audibility</h3><p>A public, on-chain event log tracks every key action—from campaign launch to fund withdrawal.</p></div>
                                <div className="feature-card scroll-animate" style={{ transitionDelay: '300ms' }}><h3>Extensible & Future-Ready</h3><p>Designed for what&apos;s next, with support for NFT rewards, DAO governance, and more.</p></div>
                            </div>
                        </div>
                    </section>

                    <section className="cta-section-wrapper scroll-animate">
                        <div className="container">
                            <div className="cta-section">
                                <h2>Ready to Join the Nation?</h2>
                                <p>Join the next generation of creators and donors building a more transparent world. Launch the app to start your journey today.</p>
                                <a href="#" className="btn btn-primary" style={{ padding: '15px 35px', fontSize: '1.1rem' }}>Launch the dApp</a>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="footer">
                    <div className="container">
                        <div className="footer-grid">
                            <div className="footer-col scroll-animate">
                                <Link to="/" className="logo">Dot<span>Nation</span></Link>
                                <p>Decentralized fundraising for unchained impact. Built on Polkadot.</p>
                            </div>
                            <div className="footer-col scroll-animate" style={{ transitionDelay: '100ms' }}>
                                <h4>Project</h4>
                                <a href="#">About Us</a>
                                <a href="#features">Features</a>
                                <a href="#">Documentation</a>
                            </div>
                            <div className="footer-col scroll-animate" style={{ transitionDelay: '200ms' }}>
                                <h4>Community</h4>
                                <div className="footer-socials">
                                    <a href="#" title="Twitter"><svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg></a>
                                    <a href="#" title="Discord"><svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><title>Discord</title><path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.369-.42.869-.579 1.239a18.286 18.286 0 00-5.488 0 11.203 11.203 0 00-.579-1.239.074.074 0 00-.079-.037A19.736 19.736 0 003.683 4.37a.074.074 0 00-.037.079C3.725 10.173 5.438 15.35 8.18 19.134a.074.074 0 00.079.037c.368-.21.698-.42.998-.63a.074.074 0 00.021-.079 12.072 12.072 0 01-.42-1.239c-.14-.28-.29-.57-.42-.868a.074.074 0 01.021-.104c.368-.21.698-.42 1.028-.629a.074.074 0 01.09.022c.48.579 1.029 1.119 1.628 1.589a.074.074 0 00.079.021c.72-.28 1.4-.63 2.02-.998a.074.074 0 00.04-.079 10.56 10.56 0 01-.42-1.239c-.14-.28-.29-.57-.42-.868a.074.074 0 01.021-.104c.368-.21.698-.42 1.028-.629a.074.074 0 01.09.022c.48.579 1.029 1.119 1.628 1.589a.074.074 0 00.079.021c.72-.28 1.4-.63 2.02-.998a.074.074 0 00.04-.079c.07-.42.14-.868.21-1.239a.074.074 0 00-.037-.079zM8.02 15.33c.839 0 1.519-.68 1.519-1.52s-.68-1.52-1.52-1.52c-.838 0-1.518.68-1.518 1.52 0 .84.68 1.52 1.52 1.52zm7.98 0c.839 0 1.519-.68 1.519-1.52s-.68-1.52-1.52-1.52c-.838 0-1.518.68-1.518 1.52 0 .84.68 1.52 1.52 1.52z" /></svg></a>
                                </div>
                            </div>
                            <div className="footer-col scroll-animate" style={{ transitionDelay: '300ms' }}>
                                <h4>Legal</h4>
                                <a href="#">Terms of Service</a>
                                <a href="#">Privacy Policy</a>
                            </div>
                        </div>
                        <div className="footer-bottom">
                            <p>&copy; 2025 DotNation. Built with ❤️ on Polkadot.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default LandingPage;