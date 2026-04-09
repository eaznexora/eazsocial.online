// =============================================
// AK Enterprise — Digital Visiting Card JS
// =============================================

document.addEventListener('DOMContentLoaded', function () {

    // ========== SAVE CONTACT — download VCF ==========
    function saveContact() {
        const link = document.createElement('a');
        link.href = 'assets/vcf/aabid-contact.vcf';
        link.download = 'Aabid-Contact.vcf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    document.getElementById('addContactBtn').addEventListener('click', saveContact);
    document.getElementById('saveContactBtn').addEventListener('click', saveContact);

    // ========== SHARE BUTTON — with pre-written message ==========
    document.getElementById('shareBtn').addEventListener('click', async function () {
        const shareData = {
            title: 'AK Enterprise — Sports & Surface Infrastructure Expert',
            text: '🏟️ AK Enterprise — Sports & Surface Infrastructure Expert\n\n✅ Turf Surfaces\n✅ Gym Flooring\n✅ Acrylic & PVC Surfaces\n✅ Netting & Interior Work\n       And more\n\n📞 +91 9867963555 | +91 9372131174\n📍 Jogeshwari West, Mumbai\n\n🌐 Check out our digital visiting card:',
            url: 'https://www.eazsocial.online/akenterprise'
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled
            }
        } else {
            try {
                await navigator.clipboard.writeText(
                    shareData.text + '\n' + shareData.url
                );
                alert('Details copied to clipboard!');
            } catch (err) {
                alert('Share not supported on this browser.');
            }
        }
    });

    // ========== TASK 3: SCROLL-AWARE SAVE CONTACT BAR ==========
    const saveBar = document.getElementById('saveContactBtn');
    const ourWorksSection = document.getElementById('ourWorks');

    function checkSaveBarVisibility() {
        if (!ourWorksSection) return;
        const rect = ourWorksSection.getBoundingClientRect();
        // Show when "Our Works" section reaches the top of viewport
        if (rect.top <= window.innerHeight * 0.5) {
            saveBar.classList.add('visible');
        } else {
            saveBar.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', checkSaveBarVisibility, { passive: true });
    checkSaveBarVisibility(); // initial check

    // ========== TASK 6: SCROLL ANIMATIONS ==========
    const animElements = document.querySelectorAll('.anim-hidden');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.15
    };

    let animDelay = 0;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const el = entry.target;

                // Determine animation type based on element context
                if (el.classList.contains('contact-card') || el.classList.contains('whatsapp-btn')) {
                    // Contact cards slide left to right
                    const idx = Array.from(el.parentElement.children).indexOf(el);
                    el.style.animationDelay = (idx * 0.1) + 's';
                    el.classList.add('anim-slideLeft');
                } else if (el.classList.contains('work-item')) {
                    // Work items slide in one by one
                    const allItems = document.querySelectorAll('.work-item');
                    const idx = Array.from(allItems).indexOf(el);
                    el.style.animationDelay = (idx * 0.12) + 's';
                    el.classList.add('anim-scaleIn');
                } else if (el.classList.contains('choose-card')) {
                    const allCards = document.querySelectorAll('.choose-card');
                    const idx = Array.from(allCards).indexOf(el);
                    el.style.animationDelay = (idx * 0.15) + 's';
                    el.classList.add('anim-fadeIn');
                } else {
                    el.classList.add('anim-fadeIn');
                }

                el.classList.remove('anim-hidden');
                observer.unobserve(el);
            }
        });
    }, observerOptions);

    animElements.forEach(function (el) {
        observer.observe(el);
    });

    // ========== TASK 7: WORKS CAROUSEL MODAL (UPDATED) ==========
    
    // 1. Define your images for each work category
    const workGalleries = {
        'turf': {
            title: 'Turf Surfaces',
            images: [
                'assets/images/turf-surfaces.jpeg',
                'assets/images/football-turf.jpeg'
            ]
        },
        'gym': {
            title: 'Gym Flooring',
            images: [
                'assets/images/gym-flooring.png'
            ]
        }
        // Add other categories matching your data-work attributes
    };

    // 2. Select modal elements
    const workItems = document.querySelectorAll('.work-item');
    const modal = document.getElementById('workModal');
    const closeModal = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const carouselImage = document.getElementById('carouselImage');
    const carouselCounter = document.getElementById('carouselCounter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const thumbnailContainer = document.getElementById('thumbnailContainer'); // NEW

    let currentGallery = [];
    let currentIndex = 0;

    // 3. Open Modal on Work Item Click
    workItems.forEach(item => {
        item.addEventListener('click', function() {
            const workId = this.getAttribute('data-work');
            
            // 4. FIX GLITCH: Clean reset of gallery
            if (!workGalleries[workId] || !workGalleries[workId].images || workGalleries[workId].images.length === 0) {
                // If single image (no gallery defined)
                const imgSource = this.querySelector('img').src;
                const titleText = this.querySelector('span').innerText;
                currentGallery = [imgSource]; 
                modalTitle.innerText = titleText;
            } else {
                // If gallery exists
                currentGallery = workGalleries[workId].images;
                modalTitle.innerText = workGalleries[workId].title;
            }

            currentIndex = 0;
            carouselImage.classList.remove('zoomed'); // Reset zoom
            setupThumbnails(); // Generate thumbnails
            updateCarousel();
            modal.classList.add('show');
        });
    });

    // Generate Thumbnails
    function setupThumbnails() {
        thumbnailContainer.innerHTML = ''; // Clear old thumbnails
        
        if (currentGallery.length > 1) {
            currentGallery.forEach((src, index) => {
                const img = document.createElement('img');
                img.src = src;
                img.classList.add('thumb-img');
                if (index === 0) img.classList.add('active');
                
                // Click thumbnail to go to image
                img.addEventListener('click', () => {
                    currentIndex = index;
                    updateCarousel();
                });
                thumbnailContainer.appendChild(img);
            });
            thumbnailContainer.style.display = 'flex';
        } else {
            thumbnailContainer.style.display = 'none'; // Hide if only 1 image
        }
    }

    // Update Image, Counter, and active Thumbnail
    function updateCarousel() {
        carouselImage.src = currentGallery[currentIndex];
        carouselImage.classList.remove('zoomed'); // reset zoom on image change
        
        // Hide arrows & counter if only 1 image exists
        if(currentGallery.length <= 1) {
            carouselCounter.style.display = 'none';
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            carouselCounter.style.display = 'block';
            carouselCounter.innerText = `${currentIndex + 1} / ${currentGallery.length}`;
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
            
            // Highlight correct thumbnail
            const thumbs = document.querySelectorAll('.thumb-img');
            thumbs.forEach((thumb, idx) => {
                thumb.classList.toggle('active', idx === currentIndex);
            });
        }
    }

    // 5. Next & Prev Navigation
    nextBtn.addEventListener('click', () => {
        if (currentGallery.length > 1) {
            currentIndex = (currentIndex === currentGallery.length - 1) ? 0 : currentIndex + 1;
            updateCarousel();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentGallery.length > 1) {
            currentIndex = (currentIndex === 0) ? currentGallery.length - 1 : currentIndex - 1;
            updateCarousel();
        }
    });

    // 6. Double Tap / Double Click to Zoom Functionality
    let lastTap = 0;
    carouselImage.addEventListener('click', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) { // Double tap detected
            this.classList.toggle('zoomed');
            e.preventDefault();
        }
        lastTap = currentTime;
    });

    // Close Modal functionality
    closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
        carouselImage.classList.remove('zoomed');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            carouselImage.classList.remove('zoomed');
        }
    });

});
