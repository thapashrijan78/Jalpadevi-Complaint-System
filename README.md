# श्री जाल्पादेवी माध्यमिक विद्यालय — गुनासो दर्ता प्रणाली

यो नेपाली विद्यालय/स्थानीय समुदायका लागि मोबाइल र कम्प्युटर दुवैमा चल्ने गुनासो पोर्टल हो। React/Vite frontend र Flask API एउटै project र एउटै production service बाट चल्छन्।

## मुख्य सुविधाहरू

- पूर्ण नेपाली UI र responsive design
- विद्यार्थी, शिक्षक र अभिभावकका लागि गुनासो दर्ता
- व्यक्तिगत विवरणसहित वा गोप्य/अनामिक रूपमा गुनासो
- विषय, शीर्षक, विवरण र स्थान
- मोबाइल/ल्यापटपबाट आवाज रेकर्ड
- JPG/JPEG/PNG/PDF फाइल संलग्न
- गुनासो दर्ता भएपछि Tracking ID र सार्वजनिक अवस्था जाँच
- अध्यक्ष/प्रशासनका लागि login र dashboard
- QR code generator

## स्थानीय रूपमा चलाउने

पहिलो पटक repository को मुख्य folder मा:

```bash
npm install
npm run dev
```

`npm run dev` ले frontend र backend दुवै सुरु गर्छ। पहिलो पटक backend को Python virtual environment बनाउँछ र `backend/requirements.txt` का packages स्थापना गर्छ। Python 3 र Node.js चाहिन्छ। Browser मा Vite ले देखाएको URL खोल्नुहोस्, सामान्यतया `http://127.0.0.1:5173`। रोक्न `Ctrl+C` थिच्नुहोस्।

स्थानीय demo administrator:

- Username: `admin`
- Password: `admin123`

## एउटै, निःशुल्क hosting विकल्प

Frontend र Flask API एउटै Flask web app बाट चलाउन PythonAnywhere को free account प्रयोग गर्न सकिन्छ। यो सेटअपमा अलग frontend/backend deploy हुँदैन। PythonAnywhere का free accounts मा storage सीमित हुन्छ र नयाँ account को site एक महिनापछि expire हुन सक्छ। त्यसैले यसलाई demo वा परीक्षणका लागि मात्र लिनुहोस्, स्थायी production hosting भनेर नमान्नुहोस्। Signup गर्दा dashboard मा देखिने हालका limits जाँच्नुहोस्।

### PythonAnywhere सेटअप

1. PythonAnywhere मा free account बनाएर **Consoles → Bash** खोल्नुहोस्.
2. Repository clone गरेर project folder भित्र जानुहोस्:

   ```bash
   git clone https://github.com/thapashrijan78/Jalpadevi-Complaint-System.git
   cd Jalpadevi-Complaint-System
   ```

3. Frontend production files बनाउनुहोस्:

   ```bash
   npm install
   npm run build:pythonanywhere
   ```

4. **Web → Add a new web app** बाट आफ्नो free `pythonanywhere.com` subdomain बनाउनुहोस् र उपलब्ध Python version छान्नुहोस्.
5. Virtualenv बनाउनुहोस् र backend packages राख्नुहोस्. PythonAnywhere ले उपलब्ध गराएको Python version अनुसार path बदल्नुहोस्:

   ```bash
   mkvirtualenv --python=/usr/bin/python3.11 jalpa-venv
   pip install -r ~/Jalpadevi-Complaint-System/backend/requirements.txt
   ```

6. Web page मा virtualenv path सेट गर्नुहोस्. WSGI configuration file मा यस repository को `deploy/pythonanywhere_wsgi.py` का contents राखेर `YOUR_PYTHONANYWHERE_USERNAME` बदल्नुहोस्. त्यही dashboard-only file मा admin password र token लाई निजी, random values ले बदल्नुहोस्; GitHub मा नराख्नुहोस्.
7. **Reload** थिच्नुहोस् र `https://YOUR_USERNAME.pythonanywhere.com/api/health` खोल्नुहोस्. `ok: true` आएपछि frontend र API दुवै एउटै site मा चल्छन्.

Complaint data र uploads free account को सीमित filesystem मा रहन्छन्. Free service expire हुन सक्छ, त्यसैले वास्तविक विद्यालय प्रयोगका लागि नियमित backup राख्नुहोस्. कुनै paid plan नछान्नुहोस्.

Local development मा Vite proxy ले API लाई Flask मा पठाउँछ.

## Pages

- मुख्य पृष्ठ: `#home`
- गुनासो दर्ता: `#complaint`
- गुनासो अवस्था: `#status`
- QR code: `#qr`
- प्रशासन login: `#login`
- प्रशासन dashboard: `#dashboard`

## Storage

PythonAnywhere free account मा JSON data र uploads app को filesystem मा रहन्छन्. Free storage सीमित छ; आवश्यक data को backup अलग राख्नुहोस्.

यो prototype ले JSON file मा data राख्छ। धेरै प्रयोगकर्ता वा विद्यालयको औपचारिक production प्रयोगका लागि PostgreSQL, password hashing, rate limiting, backups र notification configuration थप्नु उपयुक्त हुन्छ।
