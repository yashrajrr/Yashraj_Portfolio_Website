document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    // Set up scroll observer script 
    window.addEventListener('scroll', () => {
        let currentId = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Trigger active state when section enters top third of view
            if (scrollY >= (sectionTop - window.innerHeight / 3)) {
                currentId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            // Reset styling to default
            link.classList.remove('text-[#C0C1FF]', 'border-[#C0C1FF]');
            link.classList.add('text-slate-400', 'border-transparent');
            
            // Apply primary styling for active section
            if (link.getAttribute('href') === `#${currentId}`) {
                link.classList.add('text-[#C0C1FF]', 'border-[#C0C1FF]');
                link.classList.remove('text-slate-400', 'border-transparent');
            }
        });
    });
});
