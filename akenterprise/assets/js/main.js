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

    // ========== TASK 7: WORKS CAROUSEL MODAL & GESTURE ENGINE (ULTIMATE FIX) ==========
    
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

    // --- STRICT GESTURE VARIABLES ---
    let currentScale = 1;
    let translateX = 0, translateY = 0;
    let isPointerDown = false;
    let pointerStartX = 0, pointerStartY = 0;
    let prevTranslateX = 0, prevTranslateY = 0;
    let lastTapTime = 0;
    
    // Lock states to prevent event fighting
    let isPinching = false;
    let activeTouches = 0;
    let initialTouchDist = 0;
    let initialPinchScale = 1;

    // --- ZOOM FUNCTIONS & ADVANCED BOUNDARY PHYSICS ---
    function setZoomTransform(scale, x, y) {
        carouselImage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }

    function resetZoom() {
        currentScale = 1; translateX = 0; translateY = 0;
        prevTranslateX = 0; prevTranslateY = 0;
        carouselImage.style.transition = 'transform 0.3s ease';
        setZoomTransform(1, 0, 0);
    }

    // PERFECT BOUNDARIES: Calculates actual visual pixels even with object-fit: contain
    function applyBoundaries() {
        let imgRatio = carouselImage.naturalWidth / carouselImage.naturalHeight;
        let containerRatio = carouselImage.offsetWidth / carouselImage.offsetHeight;
        
        let actualWidth = carouselImage.offsetWidth;
        let actualHeight = carouselImage.offsetHeight;

        if (imgRatio > containerRatio) actualHeight = carouselImage.offsetWidth / imgRatio;
        else actualWidth = carouselImage.offsetHeight * imgRatio;

        let maxTx = (actualWidth * currentScale - carouselImage.offsetWidth) / 2;
        let maxTy = (actualHeight * currentScale - carouselImage.offsetHeight) / 2;
        
        maxTx = Math.max(0, maxTx);
        maxTy = Math.max(0, maxTy);

        translateX = Math.max(-maxTx, Math.min(maxTx, translateX));
        translateY = Math.max(-maxTy, Math.min(maxTy, translateY));
    }

    function zoomToPoint(x, y, scaleTarget) {
        let rect = carouselImage.getBoundingClientRect();
        let centerX = rect.width / 2;
        let centerY = rect.height / 2;
        
        translateX = (centerX - x) * (scaleTarget - 1);
        translateY = (centerY - y) * (scaleTarget - 1);
        currentScale = scaleTarget;
        
        applyBoundaries(); 
        
        carouselImage.style.transition = 'transform 0.3s ease';
        setZoomTransform(currentScale, translateX, translateY);
    }

    // 2. Open Modal Logic
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
        resetZoom(); 
        
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

    // ==========================================
    // 4. THE ISOLATED GESTURE ENGINE
    // ==========================================

    // --- A. TOUCH EVENTS (STRICTLY FOR PINCHING) ---
    carouselImage.addEventListener('touchstart', (e) => {
        activeTouches = e.touches.length;
        if (activeTouches >= 2) {
            isPinching = true;
            isPointerDown = false; // Kill any active panning instantly
            initialTouchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialPinchScale = currentScale;
            carouselImage.style.transition = 'none';
        }
    }, { passive: false });

    carouselImage.addEventListener('touchmove', (e) => {
        if (activeTouches >= 2) {
            e.preventDefault(); // Stop screen scrolling
            let currentDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            currentScale = Math.max(1, Math.min(initialPinchScale * (currentDist / initialTouchDist), 4));

            if (currentScale === 1) {
                resetZoom();
            } else {
                applyBoundaries(); 
                setZoomTransform(currentScale, translateX, translateY);
            }
        }
    }, { passive: false });

    carouselImage.addEventListener('touchend', (e) => {
        activeTouches = e.touches.length;
        if (activeTouches < 2) {
            isPinching = false;
            // CRITICAL FIX: Sync the translation state so the next pan doesn't jump
            prevTranslateX = translateX;
            prevTranslateY = translateY;
        }
    });

    // --- B. POINTER EVENTS (STRICTLY FOR TAP, SWIPE, & PAN) ---
    carouselImage.addEventListener('pointerdown', (e) => {
        if (isPinching || activeTouches >= 2) return; // Ignore if pinching
        e.preventDefault();
        
        let currentTime = new Date().getTime();
        let tapLength = currentTime - lastTapTime;
        
        if (tapLength < 300 && tapLength > 0) {
            if (currentScale > 1) resetZoom();
            else {
                let rect = carouselImage.getBoundingClientRect();
                zoomToPoint(e.clientX - rect.left, e.clientY - rect.top, 2.5);
            }
            lastTapTime = 0; // Reset tap
            return; // CRITICAL FIX: Stops pan from starting immediately after double tap
        }
        lastTapTime = currentTime;

        // Start Pan
        isPointerDown = true;
        pointerStartX = e.clientX;
        pointerStartY = e.clientY;
        prevTranslateX = translateX;
        prevTranslateY = translateY;
        
        carouselImage.style.transition = 'none'; 
        carouselImage.setPointerCapture(e.pointerId);
    });

    carouselImage.addEventListener('pointermove', (e) => {
        if (isPinching || activeTouches >= 2) return; // Block pan during pinch
        if (!isPointerDown) return;
        e.preventDefault();
        
        if (currentScale > 1) {
            translateX = prevTranslateX + (e.clientX - pointerStartX);
            translateY = prevTranslateY + (e.clientY - pointerStartY);
            applyBoundaries(); 
            setZoomTransform(currentScale, translateX, translateY);
        }
    });

    carouselImage.addEventListener('pointerup', (e) => {
        if (!isPointerDown) return;
        isPointerDown = false;
        carouselImage.releasePointerCapture(e.pointerId);

        // Swipe Detection (Only if not zoomed)
        if (currentScale === 1 && currentGallery.length > 1) {
            let diffX = e.clientX - pointerStartX;
            if (diffX > 60) prevBtn.click(); 
            if (diffX < -60) nextBtn.click(); 
        }
    });

    // --- C. PC MOUSE WHEEL ZOOM ---
    carouselImage.addEventListener('wheel', (e) => {
        e.preventDefault();
        let delta = e.deltaY < 0 ? 0.3 : -0.3;
        let newScale = Math.max(1, Math.min(currentScale + delta, 4));

        if (newScale === 1) resetZoom();
        else {
            currentScale = newScale;
            applyBoundaries(); 
            carouselImage.style.transition = 'transform 0.1s ease';
            setZoomTransform(currentScale, translateX, translateY);
        }
    }, { passive: false });

    // 5. Close Modal Logic
    function closeModalAction() {
        modal.classList.remove('show');
        setTimeout(resetZoom, 300); 
    }

    closeModal.addEventListener('click', closeModalAction);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModalAction();
    });

});
