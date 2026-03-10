const saveBtn = document.getElementById('saveContactBtn');
const modal = document.getElementById('successModal');
const closeBtn = document.getElementById('closeModalBtn');

// Function to generate and download VCF
saveBtn.addEventListener('click', () => {
    const contactInfo = {
        name: "Alfiya Samani",
        role: "Fullstack Developer",
        phone: "917738786445",
        email: "alfiyasamani19@gmail.com",
        org: "Eaz Nexora"
    };

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contactInfo.name}
ORG:${contactInfo.org}
TITLE:${contactInfo.role}
TEL;TYPE=CELL:+${contactInfo.phone}
EMAIL;TYPE=INTERNET:${contactInfo.email}
END:VCARD`;

    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Alfiya_Samani.vcf";
    a.click();
    
    // Show Success Modal
    modal.style.display = "flex";
});

closeBtn.addEventListener('click', () => {
    modal.style.display = "none";
});