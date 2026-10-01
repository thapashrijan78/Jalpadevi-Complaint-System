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

## एउटै production deploy

Production मा एउटै Render service ले React app र Flask API दुवै serve गर्छ। Complaints र uploads Render persistent disk मा रहन्छन्। Vercel मा frontend र Render मा backend छुट्टाछुट्टै deploy गर्नु पर्दैन।

1. GitHub repository मा `render.yaml` Blueprint import गर्नुहोस्।
2. Render ले `ADMIN_PASSWORD` माग्दा निजी बलियो password सेट गर्नुहोस्। यो password GitHub मा नराख्नुहोस्। `ADMIN_TOKEN` आफैँ generate हुन्छ।
3. Blueprint deploy पूरा भएपछि Render ले दिएको एउटै URL खोल्नुहोस्। त्यही URL ले frontend र `/api` दुवै serve गर्छ।

Complaint data र uploads redeploy पछि पनि सुरक्षित राख्न Blueprint ले persistent disk जोड्छ। Render को persistent disk का लागि paid service चाहिन्छ; Blueprint पुष्टि गर्दा Render ले देखाउने compute र disk लागत समीक्षा गर्नुहोस्।

Frontend र API एउटै origin बाट चल्ने भएकाले Vercel मा `VITE_API_BASE_URL` वा CORS origin सेट गर्नु पर्दैन। Local development मा Vite proxy ले API लाई Flask मा पठाउँछ।

## Pages

- मुख्य पृष्ठ: `#home`
- गुनासो दर्ता: `#complaint`
- गुनासो अवस्था: `#status`
- QR code: `#qr`
- प्रशासन login: `#login`
- प्रशासन dashboard: `#dashboard`

## Storage

Render Blueprint ले `/var/data` मा 1 GB persistent disk जोड्छ। Database र uploads त्यहीँ रहन्छन्; service restart वा redeploy हुँदा complaint records हराउँदैनन्। Disk खाली हुँदा backend ले bundled demo data एक पटक copy गर्छ।

यो prototype ले JSON file मा data राख्छ। धेरै प्रयोगकर्ता वा विद्यालयको औपचारिक production प्रयोगका लागि PostgreSQL, password hashing, rate limiting, backups र notification configuration थप्नु उपयुक्त हुन्छ।
