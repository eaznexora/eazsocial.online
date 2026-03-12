document.addEventListener('DOMContentLoaded', () => {
    // --- Live Date & Time Logic ---
    function updateLiveTime() {
        const dateElement = document.getElementById('liveDate');
        const now = new Date();
        
        // Format: DD-MM-YYYY | HH:MM:SS
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        dateElement.textContent = `${day}-${month}-${year} | ${hours}:${minutes}:${seconds}`;
    }
    
    // Update immediately, then every second
    updateLiveTime();
    setInterval(updateLiveTime, 1000);

    // --- VCF Download Logic ---
    const saveBtn = document.getElementById('saveContactBtn');
    const modal = document.getElementById('successModal');
    const closeBtn = document.getElementById('closeModalBtn');

    saveBtn.addEventListener('click', () => {
        const studentInfo = {
            name: "Alfiya Samani",
            role: "B.Sc. IT Student",
            phone: "917738786445",
            email: "alfiyasamani19@gmail.com",
            org: "Sanpada College of Commerce & Technology"
        };

        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${studentInfo.name}
ORG:${studentInfo.org}
TITLE:${studentInfo.role}
TEL;TYPE=CELL:+${studentInfo.phone}
EMAIL;TYPE=INTERNET:${studentInfo.email}
END:VCARD`;

        const blob = new Blob([vcard], { type: "text/vcard" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "SCCT_ID_Alfiya_Samani.vcf";
        a.click();
        
        // Show Success Modal
        modal.style.display = "flex";
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = "none";
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
});