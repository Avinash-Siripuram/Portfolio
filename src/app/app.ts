import { Component, ElementRef, ViewChild, signal, computed, OnInit, AfterViewInit, OnDestroy, ViewEncapsulation } from '@angular/core';

interface Experience {
  role: string;
  company: string;
  date: string;
  bullets: string[];
}

interface Project {
  title: string;
  desc: string;
  tags: string[];
  icon: string;
}

interface Profile {
  role: string;
  resumeLink: string;
  description: string;
  summary: string;
  stats: { years: string; tpm: string; uptime: string };
  skills: { languages: string[]; backend: string[]; frontend: string[]; cloud: string[] };
  experience: Experience[];
  projects: Project[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  // State Signals
  protected readonly currentProfile = signal<'fullstack' | 'backend' | 'frontend' | 'payments'>('fullstack');
  protected readonly theme = signal<'dark' | 'light'>('dark');
  protected readonly mobileMenuOpen = signal<boolean>(false);
  protected readonly showSuccessState = signal<boolean>(false);
  protected readonly customGreeting = signal<string | null>(null);
  protected readonly visualizerState = signal<'idle' | 'transaction' | 'duplicate' | 'cache'>('idle');
  protected readonly visualizerMessage = signal<string>('Select an action below to visualize how transactions are processed.');
  
  // Form Signals
  protected readonly formspreeId = signal<string>('mwvgpqjq'); // Enter your Formspree ID here to receive real emails!
  protected readonly formName = signal<string>('');
  protected readonly formEmail = signal<string>('');
  protected readonly formMessage = signal<string>('');
  protected readonly formStatus = signal<string>('');
  protected readonly formStatusClass = signal<string>('');

  // Particle System Variables
  private ctx!: CanvasRenderingContext2D;
  private particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = [];
  private confetti: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number }> = [];
  private readonly numParticles = 55;
  private readonly connectionDistance = 120;
  private mouse = { x: null as number | null, y: null as number | null, radius: 150 };
  private animationFrameId!: number;
  private resizeListener!: () => void;

  // Master Skills List (all categorized capabilities for comparison highlights)
  protected readonly allSkills = {
    languages: ["Go (Golang)", "TypeScript", "JavaScript", "Python", "SQL", "HTML5", "CSS3", "Data Structures", "Algorithms"],
    backend: ["RESTful APIs", "Microservices", "Event-Driven Design", "gRPC", "Config-Driven Architecture", "API Design", "Payment Processing", "ISO 20022", "SEPA/SWIFT concepts", "Mambu Integration"],
    frontend: ["Angular", "Angular CLI", "RxJS", "NgRx", "Tailwind CSS", "Micro-Frontends", "Shared UI Libraries", "Responsive UI", "Route Guards"],
    cloud: ["Docker", "Kubernetes", "PostgreSQL", "Redis", "Kafka", "CI/CD (Jenkins/Git)", "Jasmine", "Karma", "Agile Delivery"]
  };

  // Profile data definitions
  private readonly profileData: Record<string, Profile> = {
    fullstack: {
      role: "Full-Stack Cloud Systems",
      resumeLink: "resumes/fullstack-cloud.pdf",
      description: "Full-stack Software Engineer with 3 years of experience building scalable Angular frontends and Go-based backend microservices for production fintech platforms. Experienced in micro-frontends, core banking integrations, and cloud-native deployments.",
      summary: "Full-stack Software Engineer with 3 years of experience building both the Angular frontend and Go-based backend microservices for a production fintech platform. Experienced across the full delivery lifecycle: micro-frontend architecture, config-driven multi-entity backend services, core-banking connectivity, and cloud-native deployment on Docker and Kubernetes. Comfortable owning a feature end-to-end, from UI component through REST API to containerized service, within fast-paced Agile teams.",
      stats: { years: "3+", tpm: "10K+", uptime: "99.9%" },
      skills: {
        languages: ["Go (Golang)", "TypeScript", "JavaScript", "Python", "SQL", "HTML5", "CSS3"],
        backend: ["RESTful APIs", "Microservices", "Event-Driven Design", "gRPC", "Config-Driven Architecture", "API Design"],
        frontend: ["Angular", "RxJS", "NgRx", "Micro-Frontends", "Shared UI Libraries", "Responsive UI"],
        cloud: ["Docker", "Kubernetes", "PostgreSQL", "Redis", "Kafka", "CI/CD (Jenkins/Git)"]
      },
      experience: [
        {
          role: "Software Development Engineer — Full Stack (Angular / Go)",
          company: "IMPAR Fintech Software Solutions India Private Limited",
          date: "Jan 2024 — Present",
          bullets: [
            "Engineered a scalable Micro-Frontend (MFE) banking architecture in Angular, orchestrating a host shell to embed modular child apps and enabling independent, parallel deployments.",
            "Built and maintained a shared UI component library published to a private NPM registry, standardizing design tokens and reusable components.",
            "Engineered highly available REST-based publish services in Go managing complex 12-scheme workflows, sustaining over 10,000 transactions per minute at 99.9% uptime.",
            "Built critical connectivity services for Mambu core-banking integration, reducing partner integration time by 30%.",
            "Integrated Keycloak authentication end-to-end, architecting a dynamic menu system on the frontend driven by role-based permissions."
          ]
        },
        {
          role: "Associate Software Developer",
          company: "IMPAR Fintech Software Solutions India Private Limited",
          date: "Jul 2023 — Dec 2023",
          bullets: [
            "Built a full-stack self-service portal, pairing an Angular frontend with a Django/Python backend, cutting data retrieval time by 40%.",
            "Designed relational data models and REST endpoints powering personalized dashboards, contributing to a 15% uplift in feature adoption."
          ]
        }
      ],
      projects: [
        {
          title: "Real-Time Transaction Ledger & Rule Engine",
          desc: "Architected a high-throughput transaction processing service in Go with a pluggable rule engine to route transactions across configurable client schemes. Implemented an event-driven pipeline with Kafka for ingestion and Redis for rate-limiting.",
          tags: ["Go", "PostgreSQL", "Redis", "Kafka", "Docker", "gRPC"],
          icon: "⚙️"
        },
        {
          title: "Shared UI Component Library & MFE Shell",
          desc: "Engineered a reusable UI system and shell host for banking micro-frontends in Angular. Implemented custom design systems and dynamic, role-restricted route menus integrated with OAuth2/Keycloak.",
          tags: ["Angular", "TypeScript", "RxJS", "Keycloak", "NPM Registry"],
          icon: "🎨"
        }
      ]
    },
    backend: {
      role: "Backend Go Developer",
      resumeLink: "resumes/backend-go.pdf",
      description: "Results-driven Backend Engineer with 3 years of experience designing and building scalable RESTful services and distributed backend systems in Go (Golang) for high-volume fintech workflows.",
      summary: "Backend Software Engineer with 3 years of experience designing and building scalable RESTful services and distributed systems in Go (Golang). Strong grounding in data structures, algorithms, and system design, with hands-on experience in SQL, NoSQL, Kafka event streams, and CI/CD pipelines. Focused on translating complex business requirements into resilient, production-grade microservices.",
      stats: { years: "3+", tpm: "10K+", uptime: "99.9%" },
      skills: {
        languages: ["Go (Golang)", "Python", "JavaScript", "SQL", "Data Structures", "Algorithms"],
        backend: ["RESTful Services", "gRPC", "Microservices Architecture", "API Design", "Event-Driven Systems"],
        frontend: ["JavaScript (ES6+)", "Angular (foundational)", "HTML5/CSS3"],
        cloud: ["Docker", "Kubernetes", "PostgreSQL", "Redis", "Kafka", "CI/CD (Jenkins/Git)", "Agile Delivery"]
      },
      experience: [
        {
          role: "Software Development Engineer (SDE1) — Backend (Go)",
          company: "IMPAR Fintech Software Solutions India Private Limited",
          date: "Jul 2024 — Present",
          bullets: [
            "Engineered highly available, scalable REST-based publish services in Go to manage complex 12-scheme workflows across 3 client-specific configurations, leveraging a rule engine to sustain over 10,000 transactions per minute.",
            "Designed and implemented highly configurable internal microservices tailored to entity-specific needs, ensuring system resilience under load with 99.9% uptime.",
            "Built multiple critical connectivity services for Mambu core-banking integration, delivering reusable, pre-built modules that cut integration time by 30%.",
            "Authored reusable Go libraries and internal tooling that accelerated feature delivery, reducing time-to-market by 20%.",
            "Mentored junior developers on Go best practices, clean API design, and debugging strategies."
          ]
        },
        {
          role: "Web Development Intern",
          company: "IMPAR Fintech Software Solutions India Private Limited",
          date: "Jul 2023 — Jun 2024",
          bullets: [
            "Built a full-stack self-service portal backend using Django and Python, with efficient paginated data retrieval that cut data retrieval time by 40%.",
            "Designed relational data models and REST endpoints powering personalized user dashboards and server-side form validation.",
            "Partnered with frontend engineers to optimize API response times, contributing to a 25% improvement in search performance."
          ]
        }
      ],
      projects: [
        {
          title: "Real-Time Transaction Ledger & Rule Engine",
          desc: "Architected a high-throughput transaction processing service in Go simulating fintech publish workflows. Used a pluggable rule engine to route transactions, Kafka for ingestion, and containerized deployment.",
          tags: ["Go", "REST APIs", "PostgreSQL", "Redis", "Kafka", "Docker", "gRPC"],
          icon: "⚡"
        }
      ]
    },
    frontend: {
      role: "Frontend Angular Engineer",
      resumeLink: "resumes/frontend-angular.pdf",
      description: "Performance-driven Frontend Engineer with 3 years of experience building high-throughput Angular and TypeScript applications, specializing in micro-frontends, state management, and reusable UI components.",
      summary: "Performance-driven Frontend Engineer with 3 years of experience building high-throughput, accessible (a11y) B2B web applications using Angular, TypeScript, and RxJS. Skilled in state management (NgRx), responsive layouts, component lifecycles, and micro-frontend architectures.",
      stats: { years: "3+", tpm: "MFE Shells", uptime: "A11y Compliant" },
      skills: {
        languages: ["TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3", "SQL"],
        backend: ["RESTful APIs Integration", "API Data Modeling", "JSON Integration"],
        frontend: ["Angular", "Angular CLI", "RxJS (Observables)", "NgRx / Redux", "Tailwind CSS", "Micro-Frontend Shells", "Route Guards"],
        cloud: ["Git", "Jasmine", "Karma", "Webpack", "Responsive Web Design", "Browser Debugging Tools"]
      },
      experience: [
        {
          role: "Software Engineer II — Frontend (Angular)",
          company: "IMPAR Fintech Software Solutions India Private Limited",
          date: "Jul 2024 — Present",
          bullets: [
            "Engineered a scalable Micro-Frontend (MFE) banking architecture, orchestrating an Angular host shell to embed modular child apps and enable parallel deployments.",
            "Developed a shared UI library published to a private NPM registry, optimizing developer experience (DX).",
            "Designed and implemented a generic data table component featuring multi-type filtering, manual column reordering, and client-side layout state preservation.",
            "Integrated Keycloak authentication to manage granular user permissions, architecting a dynamic menu system that conditionally restricts UI actions."
          ]
        },
        {
          role: "Frontend Web Development Intern",
          company: "IMPAR Fintech Software Solutions India Private Limited",
          date: "Jan 2024 — Jun 2024",
          bullets: [
            "Developed and deployed enterprise-scale employee Self-Service Portal (SSP) web interfaces using Angular, driving a 15% increase in user interaction.",
            "Engineered a secure, data-driven availability calendar with dynamic visibility hierarchies.",
            "Spearheaded the development of a reusable UI component library, reducing code duplication by 25%.",
            "Optimized client-side rendering through semantic HTML5 and CSS3 grid architectures."
          ]
        }
      ],
      projects: [
        {
          title: "Shared Banking UI & MFE Host Shell",
          desc: "Created a host shell to load dynamic client applications, leveraging custom Angular route guards, NPM registry packaging, Keycloak role-based visibility, and clean RxJS state management.",
          tags: ["Angular", "TypeScript", "RxJS", "Keycloak", "NgRx", "Jasmine"],
          icon: "🎨"
        }
      ]
    },
    payments: {
      role: "Junior Solution Architect",
      resumeLink: "resumes/payments.pdf",
      description: "Fintech Backend Engineer specializing in Go-based microservices, payment orchestration engines, and core-banking integrations with working knowledge of SEPA, SWIFT, and ISO 20022.",
      summary: "Backend Software Engineer with 3 years of experience building Go-based microservices for fintech payment and core-banking workflows. Hands-on experience delivering configuration-driven, multi-entity platforms, integrating with Mambu core banking, and building rule-engine routers. Working knowledge of payment messaging concepts (SEPA, SWIFT, ISO 20022).",
      stats: { years: "3+", tpm: "ISO 20022", uptime: "SEPA / SWIFT" },
      skills: {
        languages: ["Go (Golang)", "Python", "TypeScript", "SQL"],
        backend: ["Payment Processing", "ISO 20022", "SEPA/SWIFT concepts", "Mambu Integration", "Microservices Architecture", "Event-Driven Routing"],
        frontend: ["Angular (basic)", "JavaScript", "HTML5/CSS3"],
        cloud: ["Docker", "Kubernetes", "PostgreSQL", "Redis", "Kafka", "gRPC / Protobuf", "Git"]
      },
      experience: [
        {
          role: "Software Development Engineer — Backend (Go)",
          company: "IMPAR Fintech Software Solutions India Private Limited",
          date: "Jul 2024 — Present",
          bullets: [
            "Contributed to a Go-based microservices publish platform handling scheme-driven transaction workflows across 12 configurable schemes, sustaining over 10,000 transactions per minute.",
            "Built a configuration-driven, multi-entity module supporting 3 client-specific configurations, enabling new client onboarding without core code changes.",
            "Delivered critical connectivity services for Mambu core-banking integration, reducing partner integration time by 30% and strengthening onboarding workflows.",
            "Applied rule-engine-based routing to support high-throughput, low-latency processing while maintaining 99.9% system uptime.",
            "Partnered with QA and DevOps to embed CI/CD practices, reducing operational overhead."
          ]
        },
        {
          role: "Web Development Intern",
          company: "IMPAR Fintech Software Solutions India Private Limited",
          date: "Jul 2023 — Jun 2024",
          bullets: [
            "Built a full-stack self-service portal backend using Django and Python, with efficient paginated data retrieval that cut retrieval time by 40%.",
            "Designed relational data models and REST endpoints powering dashboards, contributing to a 15% uplift in feature adoption.",
            "Collaborated with frontend engineers to harden API contracts and implement server-side validation safeguards."
          ]
        }
      ],
      projects: [
        {
          title: "Idempotent Payment Orchestration Engine",
          desc: "Architected a horizontally scalable payment engine in Go, employing an event-sourced ledger and idempotency keys to guarantee exactly-once processing semantics under concurrent retries. Used Redlock for distributed locks.",
          tags: ["Go", "gRPC", "Kafka", "Redis", "PostgreSQL", "Docker", "Kubernetes"],
          icon: "💳"
        }
      ]
    }
  };

  // Computed signal for active profile data
  protected readonly activeProfile = computed(() => this.profileData[this.currentProfile()]);

  // Computed signal for constellation floating badges in Hero
  protected readonly constellationBadges = computed(() => {
    const skillsObj = this.activeProfile().skills;
    const list = [...skillsObj.languages, ...skillsObj.backend, ...skillsObj.frontend, ...skillsObj.cloud];
    const uniqueList = Array.from(new Set(list));
    
    // Coordinates distribution
    const positions = [
      { top: '15%', left: '15%' },
      { top: '25%', left: '65%' },
      { top: '55%', left: '10%' },
      { top: '70%', left: '60%' },
      { top: '40%', left: '40%' },
      { top: '80%', left: '25%' },
      { top: '10%', left: '45%' }
    ];

    return uniqueList.slice(0, 7).map((skill, idx) => ({
      name: skill,
      top: positions[idx].top,
      left: positions[idx].left,
      delay: `${idx * 0.5}s`
    }));
  });

  ngOnInit(): void {
    // Set default theme from storage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    this.theme.set(savedTheme as 'dark' | 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Personalization Parameter Detection (robust search + hash fallback)
    const searchString = window.location.search || (window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
    const params = new URLSearchParams(searchString);
    const name = params.get('name');
    const company = params.get('company');
    if (name && company) {
      this.customGreeting.set(`Hello ${name} from ${company}! Welcome to my portfolio.`);
    } else if (name) {
      this.customGreeting.set(`Hello ${name}! Welcome to my portfolio.`);
    }
  }

  ngAfterViewInit(): void {
    this.initParticleSystem();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.resizeListener);
  }

  // --- Theme Toggle ---
  protected toggleTheme(): void {
    const newTheme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  // --- Profile Switching ---
  protected selectProfile(perspective: 'fullstack' | 'backend' | 'frontend' | 'payments'): void {
    this.currentProfile.set(perspective);
  }

  // --- Skills Highlighting Checker ---
  protected isSkillHighlighted(skill: string, category: 'languages' | 'backend' | 'frontend' | 'cloud'): boolean {
    const activeSkills = this.activeProfile().skills[category];
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return activeSkills.some(as => normalize(as) === normalize(skill));
  }

  // --- Form Handlers ---
  protected onNameInput(e: Event): void {
    this.formName.set((e.target as HTMLInputElement).value);
  }

  protected onEmailInput(e: Event): void {
    this.formEmail.set((e.target as HTMLInputElement).value);
  }

  protected onMessageInput(e: Event): void {
    this.formMessage.set((e.target as HTMLTextAreaElement).value);
  }

  protected handleFormSubmit(event: Event): void {
    event.preventDefault();
    const name = this.formName();
    const email = this.formEmail();
    const message = this.formMessage();
    if (!name || !email || !message) return;

    this.formStatus.set("Sending your message...");
    this.formStatusClass.set("");

    const id = this.formspreeId();
    if (id) {
      // Real form submission to Formspree
      fetch(`https://formspree.io/f/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message
        })
      })
      .then(response => {
        if (response.ok) {
          this.showSuccessState.set(true);
          this.triggerConfetti();
          this.resetForm();
        } else if (response.status === 402) {
          this.formStatus.set("Capacity limit reached: My free-tier inbox has hit its monthly quota! Please email or message me on LinkedIn directly above.");
          this.formStatusClass.set("error");
        } else {
          this.formStatus.set("Oops! Something went wrong on the server. Please email me directly instead.");
          this.formStatusClass.set("error");
        }
      })
      .catch(() => {
        this.formStatus.set("Connection error: Please check your internet connection and try again.");
        this.formStatusClass.set("error");
      });
    } else {
      // Simulation mode if Formspree ID is empty
      setTimeout(() => {
        this.showSuccessState.set(true);
        this.triggerConfetti();
        this.resetForm();
      }, 1000);
    }
  }

  private resetForm(): void {
    this.formName.set('');
    this.formEmail.set('');
    this.formMessage.set('');
    this.formStatus.set('');
    setTimeout(() => {
      this.showSuccessState.set(false);
    }, 5000);
  }

  private triggerConfetti(): void {
    const canvas = this.canvasRef.nativeElement;
    const colors = ['#0df', '#818cf8', '#c084fc', '#f43f5e', '#eab308', '#10b981'];
    
    // Spawn 120 colorful particles from the center/bottom area of the viewport
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.7;
    
    for (let i = 0; i < 140; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 4 + Math.random() * 10;
      this.confetti.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 3, // slightly upward force
        radius: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1
      });
    }
  }

  // --- Mobile Menu ---
  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update(val => !val);
  }

  // --- Canvas Particle System Implementation ---
  private initParticleSystem(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    this.resizeCanvas(canvas);
    
    // Create listener to reuse
    this.resizeListener = () => {
      this.resizeCanvas(canvas);
      this.initParticles(canvas);
    };
    window.addEventListener('resize', this.resizeListener);

    // Track mouse
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });


    this.initParticles(canvas);
    this.animateParticles();
  }

  private resizeCanvas(canvas: HTMLCanvasElement): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private initParticles(canvas: HTMLCanvasElement): void {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1
      });
    }
  }

  private animateParticles(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get theme values dynamically
    const isDark = this.theme() === 'dark';
    const particleColor = isDark ? 'rgba(0, 221, 255, 0.4)' : 'rgba(79, 70, 229, 0.3)';
    const lineColor = isDark ? 'rgba(0, 221, 255, 0.05)' : 'rgba(79, 70, 229, 0.04)';
    const activeLineColor = isDark ? 'rgba(129, 140, 248, 0.15)' : 'rgba(8, 145, 178, 0.12)';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = particleColor;
      this.ctx.fill();

      // Connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.connectionDistance) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);

          if (this.mouse.x !== null && this.mouse.y !== null && 
              Math.abs(p.x - this.mouse.x) < this.mouse.radius && 
              Math.abs(p.y - this.mouse.y) < this.mouse.radius) {
            this.ctx.strokeStyle = activeLineColor;
            this.ctx.lineWidth = 1.2;
          } else {
            this.ctx.strokeStyle = lineColor;
            this.ctx.lineWidth = 0.5;
          }
          this.ctx.stroke();
        }
      }
    }

    // Animate Confetti
    for (let idx = this.confetti.length - 1; idx >= 0; idx--) {
      const c = this.confetti[idx];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.2; // gravity
      c.vx *= 0.98; // horizontal drag
      c.alpha -= 0.015; // fade out

      if (c.alpha <= 0 || c.y > canvas.height) {
        this.confetti.splice(idx, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = c.color;
      this.ctx.globalAlpha = c.alpha;
      this.ctx.fill();
      this.ctx.restore();
    }

    this.animationFrameId = requestAnimationFrame(() => this.animateParticles());
  }

  protected runSimulation(state: 'transaction' | 'duplicate' | 'cache'): void {
    this.visualizerState.set(state);
    
    if (state === 'transaction') {
      this.visualizerMessage.set('Processing standard transaction: API Gateway auth succeeded -> Published to Kafka queue -> Go Consumer received -> Distributed lock acquired in Redis -> Normalized Ledger entry committed to PostgreSQL Database.');
    } else if (state === 'duplicate') {
      this.visualizerMessage.set('Processing duplicate transaction: Second request arrives -> Go Server checks Redis for Idempotency Key -> Cache hit confirms it was already processed -> Operation blocked instantly, preventing double charge.');
    } else if (state === 'cache') {
      this.visualizerMessage.set('Cache lookup: Go Server queries Redis cluster -> Cache hit -> Record returned instantly, avoiding expensive database queries.');
    }

    // Return to idle after 8 seconds
    setTimeout(() => {
      if (this.visualizerState() === state) {
        this.visualizerState.set('idle');
        this.visualizerMessage.set('Select an action below to visualize how transactions are processed.');
      }
    }, 8500);
  }
}
