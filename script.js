document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const labCards = document.querySelectorAll('.lab-card');
    const dockerBtns = document.querySelectorAll('.docker-btn');
    const toast = document.getElementById('toast');

    // Filtering & Searching Logic
    const searchInput = document.getElementById('searchInput');

    const categoriesGrid = document.getElementById('categoriesGrid');
    const labsView = document.getElementById('labsView');
    const backToCategoriesBtn = document.getElementById('backToCategoriesBtn');
    const categoryCards = document.querySelectorAll('.category-card');

    function filterLabs() {
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        const searchTerm = searchInput.value.toLowerCase();

        labCards.forEach(card => {
            const categoryMatch = (activeFilter === 'all' || card.getAttribute('data-category') === activeFilter);
            
            const title = card.querySelector('.lab-title').textContent.toLowerCase();
            const desc = card.querySelector('.lab-desc').textContent.toLowerCase();
            const searchMatch = (title.includes(searchTerm) || desc.includes(searchTerm));

            if (categoryMatch && searchMatch) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetFilter = card.getAttribute('data-target');
            
            // Set active filter
            filterBtns.forEach(b => b.classList.remove('active'));
            const targetBtn = document.querySelector(`.filter-btn[data-filter="${targetFilter}"]`);
            if(targetBtn) targetBtn.classList.add('active');

            // Hide categories, show labs
            categoriesGrid.style.display = 'none';
            labsView.style.display = 'block';

            // Filter
            filterLabs();
        });
    });

    backToCategoriesBtn.addEventListener('click', () => {
        labsView.style.display = 'none';
        categoriesGrid.style.display = 'grid'; // because it uses CSS grid
        searchInput.value = ''; // Reset search
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterLabs();
        });
    });

    searchInput.addEventListener('input', filterLabs);

    // Modal Logic
    const howToBtn = document.getElementById('howToBtn');
    const howToModal = document.getElementById('howToModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    howToBtn.addEventListener('click', () => {
        howToModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        howToModal.classList.remove('active');
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === howToModal) {
            howToModal.classList.remove('active');
        }
    });

    // Copy Docker Command Logic
    dockerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.getAttribute('data-cmd');
            
            // Try clipboard API first
            if (navigator.clipboard) {
                navigator.clipboard.writeText(cmd).then(() => {
                    showToast();
                }).catch(err => {
                    console.error('Kopyalama basarisiz: ', err);
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = cmd;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showToast();
                } catch (err) {
                    console.error('Kopyalama basarisiz: ', err);
                }
                document.body.removeChild(textArea);
            }
        });
    });

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500); // Hide after 2.5s
    }

    // Flag System Logic
    const flagContainers = document.querySelectorAll('.flag-container');
    
    flagContainers.forEach(container => {
        const input = container.querySelector('.flag-input');
        const btn = container.querySelector('.flag-submit-btn');
        const feedback = container.querySelector('.flag-feedback');
        const correctFlag = container.getAttribute('data-correct-flag');

        function checkFlag() {
            let userFlag = input.value.trim();
            if (!userFlag) return;

            // Emir'in formatı gibi "FLAG ALTAY{...}" gelirse başındaki FLAG kısmını temizle
            userFlag = userFlag.replace(/^FLAG\s+/i, '');

            if (userFlag === correctFlag) {
                feedback.textContent = 'Doğru! Tebrikler.';
                feedback.className = 'flag-feedback success';
                input.style.borderColor = 'var(--easy-green)';
            } else {
                feedback.textContent = 'Yanlış flag, tekrar dene.';
                feedback.className = 'flag-feedback error';
                input.style.borderColor = 'var(--hard-red)';
                
                // Shake efekti
                input.classList.remove('shake');
                void input.offsetWidth; // trigger reflow
                input.classList.add('shake');
            }
        }

        btn.addEventListener('click', checkFlag);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkFlag();
        });
        
        input.addEventListener('input', () => {
            input.style.borderColor = '';
            feedback.textContent = '';
            feedback.className = 'flag-feedback';
        });
    });
});
