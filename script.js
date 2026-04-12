document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const labCards = document.querySelectorAll('.lab-card');
    const dockerBtns = document.querySelectorAll('.docker-btn');
    const toast = document.getElementById('toast');

    // Filtering & Searching Logic
    const searchInput = document.getElementById('searchInput');

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
});
