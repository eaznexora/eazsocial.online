document.addEventListener("DOMContentLoaded", function () {
    
    // --- 1. SETUP VARIABLES ---
    const photoInput = document.getElementById('photoInput');
    const photoPreview = document.getElementById('photoPreview');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModal');
    const vcardForm = document.getElementById('vcardForm');
    let base64ImageString = "";

    // --- 2. IMAGE PREVIEW LOGIC ---
    if (photoInput && photoPreview) {
        // Circle click karne par input click ho
        photoPreview.addEventListener('click', function() {
            photoInput.click();
        });

        // File select hone par preview dikhaye
        photoInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    // Base64 string se header hatana (VCF ke liye)
                    base64ImageString = e.target.result.split(',')[1];
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // --- 3. GENERATE VCARD LOGIC ---
    if (vcardForm) {
        vcardForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Starting Generation...");

            try {
                // Helper function to safely get values
                const getVal = (id) => {
                    const el = document.getElementById(id);
                    return el ? el.value.trim() : "";
                };

                // --- DATA COLLECTION (FIXED ORDER) ---
                const fname = getVal('fname');
                const lname = getVal('lname');
                const mobile = getVal('mobile');
                
                // Validate Required Fields
                if (!fname || !mobile) {
                    alert("Please fill in First Name and Mobile Number.");
                    return; 
                }

                const nickname = getVal('nickname');
                const bday = getVal('bday');
                const title = getVal('title');
                const org = getVal('org');
                const workMobile = getVal('work_mobile');
                const email = getVal('email');
                const website = getVal('website');
                
                // Address
                const street = getVal('street');
                const city = getVal('city');
                const state = getVal('state');
                const zip = getVal('zip');
                const country = getVal('country');
                
                const note = getVal('note');
                const fullName = `${fname} ${lname}`.trim();

                // --- BUILD VCF STRING ---
                let vcard = `BEGIN:VCARD
VERSION:3.0
N:${lname};${fname};;;
FN:${fullName}`;

                if (nickname) vcard += `\nNICKNAME:${nickname}`;
                if (org) vcard += `\nORG:${org}`;
                if (title) vcard += `\nTITLE:${title}`;
                if (bday) vcard += `\nBDAY:${bday}`;

                // Phone Numbers
                vcard += `\nTEL;TYPE=CELL:${mobile}`;
                if (workMobile) vcard += `\nTEL;TYPE=WORK:${workMobile}`;

                // Email & Web
                if (email) vcard += `\nEMAIL;TYPE=INTERNET:${email}`;
                if (website) vcard += `\nURL:${website}`;

                // Address
                if (street || city || state || zip || country) {
                    vcard += `\nADR;TYPE=WORK:;;${street};${city};${state};${zip};${country}`;
                }

                // Notes (Escape new lines)
                if (note) {
                    vcard += `\nNOTE:${note.replace(/\n/g, '\\n')}`;
                }

                // Photo
                if (base64ImageString) {
                    vcard += `\nPHOTO;ENCODING=b;TYPE=JPEG:${base64ImageString}`;
                }

                vcard += `\nEND:VCARD`;

                // --- DOWNLOAD FILE ---
                const blob = new Blob([vcard], { type: 'text/vcard' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                // Safe filename
                const safeName = fname.replace(/[^a-z0-9]/gi, '_');
                link.download = `${safeName}_Contact.vcf`;
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // --- SHOW SUCCESS POPUP ---
                if (successModal) {
                    successModal.classList.add('active');
                }

            } catch (error) {
                console.error("Error:", error);
                alert("Technical Error: " + error.message);
            }
        });
    }

    // --- 4. CLOSE POPUP LOGIC ---
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            successModal.classList.remove('active');
        });
    }

    // Close on outside click
    window.addEventListener('click', function(e) {
        if (e.target == successModal) {
            successModal.classList.remove('active');
        }
    });

});
