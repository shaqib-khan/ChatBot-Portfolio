class PortfolioChatbot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.quickOptions = document.querySelector('.quick-options');
        this.menuToggle = document.getElementById('menuToggle');
        this.dropdownMenu = document.getElementById('dropdownMenu');
        this.clearChatBtn = document.getElementById('clearChat');
        
        this.init();
        this.setupPortfolioData();
        this.setupSounds();
        this.showInitialOptions();
    }

    init() {
        // Event listeners
        this.sendBtn.addEventListener('click', () => this.handleSendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // Option buttons with touch support
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('option-btn')) {
                e.preventDefault();
                const option = e.target.dataset.option;
                this.handleOptionClick(option, e.target.textContent);
            }
        });

        // Touch events for better mobile experience
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('option-btn')) {
                e.target.style.transform = 'scale(0.95)';
            }
        });

        document.addEventListener('touchend', (e) => {
            if (e.target.classList.contains('option-btn')) {
                setTimeout(() => {
                    e.target.style.transform = '';
                }, 150);
            }
        });

        // Prevent zoom on input focus (iOS)
        this.messageInput.addEventListener('focus', () => {
            if (window.innerWidth < 768) {
                document.querySelector('meta[name=viewport]').setAttribute(
                    'content', 
                    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                );
            }
        });

        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.scrollToBottom();
            }, 500);
        });

        // Handle resize for mobile keyboards
        window.addEventListener('resize', () => {
            if (window.innerWidth < 768) {
                setTimeout(() => {
                    this.scrollToBottom();
                }, 300);
            }
        });

        // Dropdown menu functionality
        this.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dropdownMenu.classList.toggle('show');
        });

        // Clear chat functionality
        this.clearChatBtn.addEventListener('click', () => {
            this.clearAllChats();
            this.dropdownMenu.classList.remove('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.dropdownMenu.contains(e.target) && !this.menuToggle.contains(e.target)) {
                this.dropdownMenu.classList.remove('show');
            }
        });
    }

    setupSounds() {
        // Create audio context for sound effects
        this.sounds = {
            send: this.createBeepSound(800, 0.1, 'sine'),
            clear: this.createBeepSound(400, 0.2, 'square')
        };
    }

    createBeepSound(frequency, duration, type = 'sine') {
        return () => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.log('Audio not supported');
            }
        };
    }

    setupPortfolioData() {
        this.portfolioData = {
            about: {
                name: "Shaqib Khan",
                title: "Full-Stack Developer (MERN) & B.Tech CS Student",
                description: "Full-Stack Developer with hands-on experience building web applications using the MERN stack (MongoDB, Express.js, React, Node.js). Strong foundation in HTML, CSS, JavaScript, TypeScript, RESTful APIs, database design, Git, and GitHub, plus core computer science concepts. Currently pursuing a B.Tech in Computer Science at Integral University, Lucknow, and expanding my skillset by learning about AI.",
                location: "Indira Nagar, Lucknow, UP, India",
                email: "shaqibkhan135@gmail.com",
                phone: "+91-8953077757",
                github: "https://github.com/shaqib-khan",
                linkedin: "https://linkedin.com/in/shaqib-khan/"
            },
            skills: {
                frontend: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "NextJS", "TailwindCSS"],
                backend: ["Node.js", "Express.js", "Python"],
                database: ["MongoDB", "PostgreSQL", "SQL"],
                programming: ["Python", "C/C++", "JavaScript", "TypeScript", "Java", "SQL"],
                tools: ["Git", "GitHub", "VSCode", "Deployment & Hosting"]
            },
            projects: [
                {
                    title: "SyncPlay (SyncTube)",
                    description: "Real-Time YouTube Watch Party Platform with synchronized playback via YouTube IFrame API & Socket.IO, role-based access control, shared video queue, live party chat, and instant guest rooms.",
                    technologies: ["React", "Node.js", "Express.js", "MongoDB", "Socket.IO"],
                    link: "https://github.com/shaqib-khan/SyncPlay",
                    liveLink: "https://syncplay-updated.vercel.app/",
                    status: "Completed"
                },
                {
                    title: "Cyber Law Awareness Portal",
                    description: "MERN-stack educational portal focused on Indian Cyber Law, cybercrime identification, digital safety, and practical cyber awareness. Features an interactive Cyber Awareness Assessment Engine with safe threat simulations, scenario-based decisions, 10+ quizzes, learning progress, law mapping, study notes, and a client-side sandbox so real credentials, OTPs, and card data are never stored.",
                    technologies: ["React", "Node.js", "Express.js", "MongoDB", "JavaScript"],
                    link: "https://github.com/shaqib-khan",
                    status: "Completed"
                }
            ],
            experience: [
                {
                    company: "ETrain",
                    position: "Python Data Science Intern",
                    duration: "Jun. 2025 – Jul. 2025",
                    description: "Completed industry-oriented training in Python, Pandas, NumPy, Matplotlib, and Seaborn. Collaborated in a 5-member team to perform EDA, data cleaning, customer segmentation, correlation analysis, and visualization on festive-season e-commerce sales data."
                }
            ]
        };
    }

    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Play send sound
        this.sounds.send();

        // Add user message
        this.addMessage(message, 'user');
        this.messageInput.value = '';

        // Show typing indicator
        this.showTyping();

        // Process message and respond
        setTimeout(() => {
            this.hideTyping();
            this.processMessage(message);
        }, 1000 + Math.random() * 1000);
    }

    handleOptionClick(option, buttonText) {
        // Play send sound for option clicks
        this.sounds.send();
        
        // Hide quick options
        this.quickOptions.classList.add('hidden');
        
        // Add user message
        this.addMessage(buttonText, 'user');
        
        // Process option immediately without typing indicator
        this.handleOption(option);
    }

    processMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            this.addBotMessage("Hello! 👋 Nice to meet you! How can I help you learn more about my portfolio?");
            this.showQuickOptions();
        } else if (lowerMessage.includes('about') || lowerMessage.includes('who are you')) {
            this.handleOption('about');
        } else if (lowerMessage.includes('skill') || lowerMessage.includes('technology')) {
            this.handleOption('skills');
        } else if (lowerMessage.includes('project') || lowerMessage.includes('work') || lowerMessage.includes('synctube') || lowerMessage.includes('syncplay') || lowerMessage.includes('cyber')) {
            this.handleOption('projects');
        } else if (lowerMessage.includes('experience') || lowerMessage.includes('intern')) {
            this.showExperience();
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('reach')) {
            this.handleOption('contact');
        } else if (lowerMessage.includes('social') || lowerMessage.includes('github') || lowerMessage.includes('linkedin')) {
            this.handleOption('social');
        } else if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
            this.handleOption('resume');
        } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
            this.addBotMessage("You're welcome!  Is there anything else you'd like to know about my portfolio?");
            this.showQuickOptions();
        } else {
            this.addBotMessage("I'm not sure I understand that.  Let me show you what I can help you with:");
            this.showQuickOptions();
        }
    }

    handleOption(option) {
        switch (option) {
            case 'about':
                this.showAbout();
                break;
            case 'skills':
                this.showSkills();
                break;
            case 'projects':
                this.showProjects();
                break;
            case 'social':
                this.showSocial();
                break;
            case 'contact':
                this.showContact();
                break;
            case 'resume':
                this.showResume();
                break;
        }
    }

    showAbout() {
        const about = this.portfolioData.about;
        const message = `
            <p><strong>About Me</strong> </p>
            <p>${about.description}</p>
            <p><strong>Location:</strong> ${about.location}</p>
        `;
        this.addBotMessage(message);
        setTimeout(() => {
            this.addBotMessage("Would you like to know more about my skills or see my projects? 🚀");
            this.showQuickOptions();
        }, 1500);
    }

    showSkills() {
        const skills = this.portfolioData.skills;
        let message = '<p><strong>Skills </strong> </p>';
        
        message += '<p><strong>Frontend Technologies:</strong><br>';
        skills.frontend.forEach(skill => {
            message += `<span class="skill-tag">${skill}</span>`;
        });
        message += '</p>';
        
        message += '<p><strong>Backend Technologies:</strong><br>';
        skills.backend.forEach(skill => {
            message += `<span class="skill-tag">${skill}</span>`;
        });
        message += '</p>';
        
        message += '<p><strong>Programming Languages:</strong><br>';
        skills.programming.forEach(skill => {
            message += `<span class="skill-tag">${skill}</span>`;
        });
        message += '</p>';
        
        message += '<p><strong>Database:</strong><br>';
        skills.database.forEach(skill => {
            message += `<span class="skill-tag">${skill}</span>`;
        });
        message += '</p>';

        if (skills.tools && skills.tools.length) {
            message += '<p><strong>Tools & Version Control:</strong><br>';
            skills.tools.forEach(skill => {
                message += `<span class="skill-tag">${skill}</span>`;
            });
            message += '</p>';
        }
        
        this.addBotMessage(message);
        setTimeout(() => {
            this.addBotMessage("Interested in seeing how I've used these skills? Check out my projects! 🚀");
            this.showQuickOptions();
        }, 2000);
    }

    showProjects() {
        this.addBotMessage("<p><strong>My Projects</strong> </p><p>Here are some of my recent works:</p>");
        
        this.portfolioData.projects.forEach((project, index) => {
            setTimeout(() => {
                const projectHtml = `
                    <div class="project-card">
                        <div class="project-title">${project.title}</div>
                        <p>${project.description}</p>
                        <p><strong>Technologies:</strong></p>
                        ${project.technologies.map(tech => `<span class="project-tech">${tech}</span>`).join('')}
                        <p><strong>Status:</strong> ${project.status}</p>
                        <p><strong>Link:</strong> <a href="${project.link}" target="_blank">View on GitHub</a>${project.liveLink ? ` | <a href="${project.liveLink}" target="_blank">Live Demo</a>` : ''}</p>
                    </div>
                `;
                this.addBotMessage(projectHtml);
            }, index * 800);
        });
        
        setTimeout(() => {
            this.addBotMessage("Want to know more about my professional experience? 💼");
            this.showQuickOptions();
        }, this.portfolioData.projects.length * 800 + 1000);
    }

    showExperience() {
        this.addBotMessage("<p><strong>My Professional Experience</strong> 💼</p>");
        
        this.portfolioData.experience.forEach((exp, index) => {
            setTimeout(() => {
                const expHtml = `
                    <div class="project-card">
                        <div class="project-title">${exp.position}</div>
                        <p><strong>${exp.company}</strong> | ${exp.duration}</p>
                        <p>${exp.description}</p>
                    </div>
                `;
                this.addBotMessage(expHtml);
            }, index * 600);
        });
        
        setTimeout(() => {
            this.addBotMessage("Ready to get in touch? Let me share my contact information! 📞");
            this.showQuickOptions();
        }, this.portfolioData.experience.length * 600 + 1000);
    }

    showSocial() {
        const about = this.portfolioData.about;
        const message = `
            <p><strong>Let's Connect!</strong> 🔗</p>
            <div style="display: flex; flex-direction: column; gap: 10px; margin: 12px 0;">
                <a href="${about.github}" target="_blank" class="social-link" style="background: #1a1a1a; color: #ffffff; padding: 10px 16px; border-radius: 12px; text-decoration: none; display: flex; align-items: center; gap: 12px; font-weight: 500; border: 1px solid #333; transition: all 0.3s ease; font-size: 10px;">
                    <div style="width: 28px; height: 28px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fab fa-github" style="font-size: 14px; color: #000000;"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #ffffff; margin-bottom: 2px;">GitHub</div>
                        <div style="font-size: 8px; color: #aaaaaa;">View my code repositories</div>
                    </div>
                    <i class="fas fa-external-link-alt" style="font-size: 10px; color: #666;"></i>
                </a>
                <a href="${about.linkedin}" target="_blank" class="social-link" style="background: #0077b5; color: #ffffff; padding: 10px 16px; border-radius: 12px; text-decoration: none; display: flex; align-items: center; gap: 12px; font-weight: 500; border: 1px solid #0077b5; transition: all 0.3s ease; font-size: 10px;">
                    <div style="width: 28px; height: 28px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fab fa-linkedin-in" style="font-size: 14px; color: #0077b5;"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #ffffff; margin-bottom: 2px;">LinkedIn</div>
                        <div style="font-size: 8px; color: #e6f3ff;">Professional profile & network</div>
                    </div>
                    <i class="fas fa-external-link-alt" style="font-size: 10px; color: #b3d9ff;"></i>
                </a>
            </div>
            <p style="font-size: 9px; color: #aaaaaa; text-align: center; margin-top: 10px;">Click any link to connect with me! 🚀</p>
        `;
        this.addBotMessage(message);
        setTimeout(() => {
            this.addBotMessage("Want to get in touch directly? Check out my contact information! 📞");
            this.showQuickOptions();
        }, 2000);
    }

    showContact() {
        const about = this.portfolioData.about;
        const message = `
            <p><strong>Let's Connect!</strong> </p>
            <p><strong>Email:</strong> <a href="mailto:${about.email}" style="color: #00a884; font-weight: 500;">${about.email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${about.phone}" style="color: #00a884; font-weight: 500;">${about.phone}</a></p>
            <p><strong>Location:</strong> ${about.location}</p>
            <div style="margin: 12px 0; padding: 10px; background: #1a2b32; border-radius: 6px; border: 1px solid #00a884; box-shadow: 0 2px 4px rgba(0, 168, 132, 0.2);">
                <p style="margin: 0; font-size: 9px; color: #ffffff; font-weight: 400;">💡 <strong style="color: #ffffff;">Quick Tip:</strong> <span style="color: #ffffff;">You can also find me on social media! Check out my GitHub for code samples and LinkedIn for professional updates.</span></p>
            </div>
            <p>I'm always open to discussing new opportunities and interesting projects! 🤝</p>
        `;
        this.addBotMessage(message);
        setTimeout(() => {
            this.addBotMessage("Don't forget to download my resume for more details! 📄");
            this.showQuickOptions();
        }, 1500);
    }

    showResume() {
        const message = `
            <p><strong>My Resume</strong> 📄</p>
            <p>View or download my latest resume (PDF):</p>
            <p style="display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0;">
                <a href="resume.pdf" download="Shaqib_Khan_Resume.pdf" style="background: linear-gradient(135deg, #FDEB9E 0%, #006A67 100%); color: #000B58; padding: 10px 18px; border-radius: 25px; text-decoration: none; display: inline-block; font-weight: 600; box-shadow: 0 2px 8px rgba(253, 235, 158, 0.3);">📥 Download Resume (PDF)</a>
                <a href="resume.pdf" target="_blank" style="background: #1a2b32; color: #00a884; padding: 10px 18px; border-radius: 25px; text-decoration: none; display: inline-block; font-weight: 600; border: 1px solid #00a884;">👁️ View Resume</a>
            </p>
            <p><strong>Highlights:</strong> B.Tech CS @ Integral University (2023–Present) | Python Data Science Intern @ ETrain | MERN Stack Developer</p>
            <p>You can also view my detailed profile on LinkedIn or check out my code repositories on GitHub! 🔗</p>
        `;
        this.addBotMessage(message);
        setTimeout(() => {
            this.addBotMessage("Is there anything else you'd like to know about my background? 😊");
            this.showQuickOptions();
        }, 1500);
    }

    addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'user' ? 'U' : 'S';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.innerHTML = `<p>${message}</p>`;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        contentDiv.appendChild(bubbleDiv);
        contentDiv.appendChild(timeDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = 'S';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.innerHTML = message;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        contentDiv.appendChild(bubbleDiv);
        contentDiv.appendChild(timeDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTyping() {
        this.typingIndicator.classList.add('show');
        this.scrollToBottom();
    }

    hideTyping() {
        this.typingIndicator.classList.remove('show');
    }

    showQuickOptions() {
        setTimeout(() => {
            // Remove existing options if any
            const existingOptions = document.querySelector('.quick-options:not(.hidden)');
            if (existingOptions && existingOptions !== this.quickOptions) {
                existingOptions.remove();
            }
            
            // Create new options
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'quick-options';
            optionsDiv.innerHTML = `
                <button class="option-btn" data-option="about">About Me </button>
                <button class="option-btn" data-option="skills">Skills</button>
                <button class="option-btn" data-option="projects">Projects </button>
                <button class="option-btn" data-option="social">Social Profiles </button>
                <button class="option-btn" data-option="contact">Contact Me </button>
                <button class="option-btn" data-option="resume">Download Resume </button>
            `;
            
            this.chatMessages.appendChild(optionsDiv);
            this.scrollToBottom();
        }, 500);
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    clearAllChats() {
        // Play clear sound
        this.sounds.clear();
        
        // Clear all messages except the initial welcome message and options
        this.chatMessages.innerHTML = `
            <div class="message bot-message">
                <div class="message-avatar">
                    S
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        <p>Hey! Welcome to My Portfolio!</p>
                        <p>Pick one option below to get started:</p>
                    </div>
                    <div class="message-time">Just now</div>
                </div>
            </div>

            <div class="quick-options">
                <button class="option-btn" data-option="about">About Me </button>
                <button class="option-btn" data-option="skills">Skills </button>
                <button class="option-btn" data-option="projects">Projects </button>
                <button class="option-btn" data-option="social">Social Profiles </button>
                <button class="option-btn" data-option="contact">Contact Me </button>
                <button class="option-btn" data-option="resume">Download Resume </button>
            </div>
        `;
        
        // Update the quickOptions reference
        this.quickOptions = document.querySelector('.quick-options');
        
        // Scroll to top
        this.chatMessages.scrollTop = 0;
    }

    showInitialOptions() {
        // Add initial quick options after page load
        setTimeout(() => {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'quick-options';
            optionsDiv.innerHTML = `
                <button class="option-btn" data-option="about">About Me </button>
                <button class="option-btn" data-option="skills">Skills </button>
                <button class="option-btn" data-option="projects">Projects </button>
                <button class="option-btn" data-option="social">Social Profiles </button>
                <button class="option-btn" data-option="contact">Contact Me </button>
                <button class="option-btn" data-option="resume">Download Resume </button>
            `;
            
            this.chatMessages.appendChild(optionsDiv);
            this.quickOptions = optionsDiv;
            this.scrollToBottom();
        }, 100);
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioChatbot();
});
