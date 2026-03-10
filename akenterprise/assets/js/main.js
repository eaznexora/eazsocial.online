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

});
