// Elements selection
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
let base64ImageString = "";

// 1. Circle Click Feature
photoPreview.addEventListener('click', function() {
    photoInput.click();
});

// 2. Image Preview Logic
photoInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            base64ImageString = e.target.result.split(',')[1];
        }
        reader.readAsDataURL(file);
    }
});

// 3. VCard Generation Logic
document.getElementById('vcardForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const fname = document.getElementById('fname').value.trim();
    const lname = document.getElementById('lname').value.trim();
    const nickname = document.getElementById('nickname').value.trim();
    const bday = document.getElementById('bday').value;
    
    const title = document.getElementById('title').value.trim();
    const org = document.getElementById('org').value.trim();
    
    const mobile = document.getElementById('mobile').value.trim();
    const workMobile = document.getElementById('work_mobile').value.trim();
    const email = document.getElementById('email').value.trim();
    const website = document.getElementById('website').value.trim();
    
    const street = document.getElementById('street').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zip = document.getElementById('zip').value.trim();
    const country = document.getElementById('country').value.trim();

    const note = document.getElementById('note').value.trim();

    const fullName = `${fname} ${lname}`.trim();

    // VCF Structure
    let vcard = `BEGIN:VCARD
VERSION:3.0
N:${lname};${fname};;;
FN:${fullName}`;

    if(nickname) vcard += `\nNICKNAME:${nickname}`;
    if(org) vcard += `\nORG:${org}`;
    if(title) vcard += `\nTITLE:${title}`;
    
    if(mobile) vcard += `\nTEL;TYPE=CELL:${mobile}`;
    if(workMobile) vcard += `\nTEL;TYPE=WORK:${workMobile}`;
    
    if(email) vcard += `\nEMAIL;TYPE=INTERNET:${email}`;
    if(website) vcard += `\nURL:${website}`;

    if(street || city || state || zip || country) {
        vcard += `\nADR;TYPE=WORK:;;${street};${city};${state};${zip};${country}`;
    }

    if(bday) vcard += `\nBDAY:${bday}`;

    if(note) {
        const safeNote = note.replace(/\n/g, '\\n');
        vcard += `\nNOTE:${safeNote}`;
    }

    if (base64ImageString) {
        vcard += `\nPHOTO;ENCODING=b;TYPE=JPEG:${base64ImageString}`;
    }

    vcard += `\nEND:VCARD`;

    // Download
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${fname.replace(/\s/g, '_')}_${lname.replace(/\s/g, '_')}.vcf`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});