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

    // ========== TASK 7: WORKS CAROUSEL MODAL & GESTURE ENGINE (BULLETPROOF) ==========
    
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

    // --- UNIFIED POINTER STATE MACHINE ---
    let currentScale = 1;
    let translateX = 0, translateY = 0;
    
    // Pointer Tracker
    let evCache = [];
    let isDragging = false;
    let startX = 0, startY = 0;
    let prevTx = 0, prevTy = 0;
    
    // Pinch Tracker
    let initialPinchDist = -1;
    let initialPinchScale = 1;
    let lastTapTime = 0;

    // --- ZOOM & BOUNDARY PHYSICS ---
    function setZoomTransform(scale, x, y) {
        carouselImage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }

    function resetZoom() {
        currentScale = 1; 
        translateX = 0; 
        translateY = 0;
        prevTx = 0; 
        prevTy = 0;
        carouselImage.style.transition = 'transform 0.3s ease';
        setZoomTransform(1, 0, 0);
    }

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

    // 2. Open Modal & Setup
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
    // 4. THE UNIFIED POINTER GESTURE ENGINE
    // ==========================================
    
    function removeEventFromCache(e) {
        for (let i = 0; i < evCache.length; i++) {
            if (evCache[i].pointerId === e.pointerId) {
                evCache.splice(i, 1);
                break;
            }
        }
    }

    carouselImage.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        carouselImage.setPointerCapture(e.pointerId);
        evCache.push(e);

        if (evCache.length === 1) {
            // Check Double Tap
            let currentTime = new Date().getTime();
            let tapLength = currentTime - lastTapTime;
            
            if (tapLength < 300 && tapLength > 0) {
                if (currentScale > 1) resetZoom();
                else {
                    let rect = carouselImage.getBoundingClientRect();
                    zoomToPoint(e.clientX - rect.left, e.clientY - rect.top, 2.5);
                }
                lastTapTime = 0;
                return;
            }
            lastTapTime = currentTime;

            // Start Pan
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            prevTx = translateX;
            prevTy = translateY;
            carouselImage.style.transition = 'none'; 
        }
        else if (evCache.length === 2) {
            // Start Pinch
            initialPinchDist = Math.hypot(
                evCache[0].clientX - evCache[1].clientX,
                evCache[0].clientY - evCache[1].clientY
            );
            initialPinchScale = currentScale;
            carouselImage.style.transition = 'none';
        }
    });

    carouselImage.addEventListener('pointermove', (e) => {
        e.preventDefault();
        
        // Update the event cache with the moving finger
        for (let i = 0; i < evCache.length; i++) {
            if (e.pointerId === evCache[i].pointerId) {
                evCache[i] = e;
                break;
            }
        }

        if (evCache.length === 1 && isDragging && currentScale > 1) {
            // Handle Single Finger Pan
            translateX = prevTx + (e.clientX - startX);
            translateY = prevTy + (e.clientY - startY);
            applyBoundaries();
            setZoomTransform(currentScale, translateX, translateY);
        }
        else if (evCache.length === 2) {
            // Handle Two Finger Pinch
            let currentDist = Math.hypot(
                evCache[0].clientX - evCache[1].clientX,
                evCache[0].clientY - evCache[1].clientY
            );
            
            if (initialPinchDist > 0) {
                currentScale = initialPinchScale * (currentDist / initialPinchDist);
                currentScale = Math.max(1, Math.min(currentScale, 4));

                if (currentScale === 1) {
                    translateX = 0;
                    translateY = 0;
                } else {
                    applyBoundaries();
                }
                setZoomTransform(currentScale, translateX, translateY);
            }
        }
    });

    function handlePointerUp(e) {
        e.preventDefault();
        carouselImage.releasePointerCapture(e.pointerId);
        removeEventFromCache(e);

        if (evCache.length < 2) {
            initialPinchDist = -1; // End pinch
        }
        
        if (evCache.length === 0) {
            isDragging = false;
            
            // Handle Swipe Left/Right when zoomed out
            if (currentScale === 1 && currentGallery.length > 1) {
                let diffX = e.clientX - startX;
                if (diffX > 60) prevBtn.click(); 
                if (diffX < -60) nextBtn.click(); 
            }
        } else if (evCache.length === 1) {
            // CRITICAL FIX: If one finger is lifted, re-anchor the drag to the remaining finger 
            // so the image doesn't jump back to an old location!
            startX = evCache[0].clientX;
            startY = evCache[0].clientY;
            prevTx = translateX;
            prevTy = translateY;
        }
    }

    carouselImage.addEventListener('pointerup', handlePointerUp);
    carouselImage.addEventListener('pointercancel', handlePointerUp);
    carouselImage.addEventListener('pointerout', handlePointerUp);

    // --- PC MOUSE WHEEL ZOOM ---
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
