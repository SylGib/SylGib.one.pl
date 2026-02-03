class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-checkbox');
        this.themeLabel = document.getElementById('theme-label');
        this.htmlElement = document.documentElement;
        
        this.init();
    }
    
    init() {
        // Ustaw początkowy motyw
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Nasłuchuj zmiany przełącznika
        this.themeToggle.addEventListener('change', () => this.toggleTheme());
    }
    
    setTheme(theme) {
        this.htmlElement.setAttribute('data-theme', theme);
        this.themeToggle.checked = theme === 'dark';
        this.themeLabel.textContent = theme === 'dark' ? 'Tryb ciemny' : 'Tryb jasny';
        localStorage.setItem('theme', theme);
    }
    
    toggleTheme() {
        const newTheme = this.themeToggle.checked ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}

// Inicjalizacja przy załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});
