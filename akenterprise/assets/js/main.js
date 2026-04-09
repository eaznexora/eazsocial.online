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

    // ========== TASK 7: WORKS CAROUSEL MODAL & GESTURE ENGINE ==========
    
    // 1. Define your images
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
        // Add more categories matching data-work here
    };

    const workItems = document.querySelectorAll('.work-item');
    const modal = document.getElementById('workModal');
    const closeModal = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const carouselImage = document.getElementById('carouselImage');
    const carouselCounter = document.getElementById('carouselCounter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const thumbnailContainer = document.getElementById('thumbnailContainer');

    let currentGallery = [];
    let currentIndex = 0;

    // --- GESTURE VARIABLES ---
    let currentScale = 1;
    let translateX = 0, translateY = 0;
    let isPointerDown = false;
    let pointerStartX = 0, pointerStartY = 0;
    let prevTranslateX = 0, prevTranslateY = 0;
    let lastTapTime = 0;

    // --- ZOOM FUNCTIONS ---
    function setZoomTransform(scale, x, y) {
        carouselImage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }

    function resetZoom() {
        currentScale = 1; translateX = 0; translateY = 0;
        carouselImage.style.transition = 'transform 0.3s ease';
        setZoomTransform(1, 0, 0);
    }

    function zoomToPoint(x, y, scaleTarget) {
        let rect = carouselImage.getBoundingClientRect();
        let centerX = rect.width / 2;
        let centerY = rect.height / 2;
        // Calculate offset to zoom precisely where the user clicked
        translateX = (centerX - x) * (scaleTarget - 1);
        translateY = (centerY - y) * (scaleTarget - 1);
        currentScale = scaleTarget;
        
        carouselImage.style.transition = 'transform 0.3s ease';
        setZoomTransform(currentScale, translateX, translateY);
    }

    // 2. Open Modal Logic (Includes Single Image Fix)
    workItems.forEach(item => {
        item.addEventListener('click', function() {
            const workId = this.getAttribute('data-work');
            
            if (!workGalleries[workId] || !workGalleries[workId].images || workGalleries[workId].images.length === 0) {
                const imgSource = this.querySelector('img').src;
                const titleText = this.querySelector('span').innerText;
                currentGallery = [imgSource]; 
                modalTitle.innerText = titleText;
            } else {
                currentGallery = workGalleries[workId].images;
                modalTitle.innerText = workGalleries[workId].title;
            }

            currentIndex = 0;
            setupThumbnails();
            updateCarousel();
            modal.classList.add('show');
        });
    });

    function setupThumbnails() {
        thumbnailContainer.innerHTML = '';
        if (currentGallery.length > 1) {
            currentGallery.forEach((src, index) => {
                const img = document.createElement('img');
                img.src = src;
                img.classList.add('thumb-img');
                if (index === 0) img.classList.add('active');
                img.addEventListener('click', () => {
                    currentIndex = index;
                    updateCarousel();
                });
                thumbnailContainer.appendChild(img);
            });
            thumbnailContainer.style.display = 'flex';
        } else {
            thumbnailContainer.style.display = 'none';
        }
    }

    function updateCarousel() {
        carouselImage.src = currentGallery[currentIndex];
        resetZoom(); // Reset zoom every time image changes
        
        if(currentGallery.length <= 1) {
            carouselCounter.style.display = 'none';
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            carouselCounter.style.display = 'block';
            carouselCounter.innerText = `${currentIndex + 1} / ${currentGallery.length}`;
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
            
            const thumbs = document.querySelectorAll('.thumb-img');
            thumbs.forEach((thumb, idx) => {
                thumb.classList.toggle('active', idx === currentIndex);
            });
        }
    }

    // 3. Navigation Buttons
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

    // 4. THE GESTURE ENGINE (Pan, Swipe, Double Tap)
    carouselImage.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        // Double Tap / Double Click Detection
        let currentTime = new Date().getTime();
        let tapLength = currentTime - lastTapTime;
        if (tapLength < 300 && tapLength > 0) {
            if (currentScale > 1) {
                resetZoom();
            } else {
                let rect = carouselImage.getBoundingClientRect();
                zoomToPoint(e.clientX - rect.left, e.clientY - rect.top, 2.5);
            }
        }
        lastTapTime = currentTime;

        // Start Panning / Swiping
        isPointerDown = true;
        pointerStartX = e.clientX;
        pointerStartY = e.clientY;
        prevTranslateX = translateX;
        prevTranslateY = translateY;
        carouselImage.style.transition = 'none'; // Instant drag feeling
        carouselImage.setPointerCapture(e.pointerId);
    });

    carouselImage.addEventListener('pointermove', (e) => {
        if (!isPointerDown) return;
        e.preventDefault();
        
        if (currentScale > 1) {
            // Dragging the image while zoomed in
            translateX = prevTranslateX + (e.clientX - pointerStartX);
            translateY = prevTranslateY + (e.clientY - pointerStartY);
            setZoomTransform(currentScale, translateX, translateY);
        }
    });

    carouselImage.addEventListener('pointerup', (e) => {
        isPointerDown = false;
        carouselImage.releasePointerCapture(e.pointerId);

        // Swipe Left/Right Detection (Only triggers if NOT zoomed in)
        if (currentScale === 1 && currentGallery.length > 1) {
            let diffX = e.clientX - pointerStartX;
            if (diffX > 60) prevBtn.click(); // Swiped right
            if (diffX < -60) nextBtn.click(); // Swiped left
        }
    });

    // 5. PC Mouse Wheel Zoom
    carouselImage.addEventListener('wheel', (e) => {
        e.preventDefault();
        let delta = e.deltaY < 0 ? 0.3 : -0.3;
        let newScale = Math.max(1, Math.min(currentScale + delta, 4));

        if (newScale === 1) resetZoom();
        else {
            currentScale = newScale;
            carouselImage.style.transition = 'transform 0.1s ease';
            setZoomTransform(currentScale, translateX, translateY);
        }
    }, { passive: false });

    // 6. Mobile Pinch-To-Zoom Logic
    let initialTouchDist = 0;
    let initialPinchScale = 1;

    carouselImage.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            isPointerDown = false; // Cancel pan if pinching
            initialTouchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialPinchScale = currentScale;
            carouselImage.style.transition = 'none';
        }
    }, { passive: false });

    carouselImage.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault(); // Stop page scrolling
            let currentDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            currentScale = Math.max(1, Math.min(initialPinchScale * (currentDist / initialTouchDist), 4));

            if (currentScale === 1) resetZoom();
            else setZoomTransform(currentScale, translateX, translateY);
        }
    }, { passive: false });

    // 7. Close Modal Logic
    function closeModalAction() {
        modal.classList.remove('show');
        setTimeout(resetZoom, 300); // Wait for fade out to reset
    }

    closeModal.addEventListener('click', closeModalAction);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModalAction();
    });

});
