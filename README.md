# श्री जाल्पादेवी माध्यमिक विद्यालय — गुनासो दर्ता प्रणाली

नेपाली विद्यालय तथा स्थानीय समुदायका लागि React/Vite frontend र Flask API भएको गुनासो पोर्टल। दुवै Vercel मा deploy हुन्छन्। गुनासो विवरण र संलग्न फाइलहरू private Vercel Blob storage मा रहन्छन्।

## सुविधाहरू

- मोबाइल र कम्प्युटरका लागि नेपाली interface
- विद्यार्थी, शिक्षक र अभिभावकका गुनासो
- व्यक्तिगत विवरणसहित वा अनामिक रूपमा दर्ता
- फोटो/PDF र आवाज संलग्न
- Tracking ID बाट सार्वजनिक अवस्था जाँच
- प्रशासन login, dashboard र QR code

## स्थानीय रूपमा चलाउने

Repository को मुख्य folder मा:

```bash
npm install
npm run dev
```

पहिलो पटक Python 3 र Node.js चाहिन्छ। `npm run dev` ले Flask API र Vite frontend दुवै सुरु गर्छ। स्थानीय demo administrator:

- Username: `admin`
- Password: `admin123`

## एउटै Vercel project मा deploy

`vercel.json` ले एउटै Vercel project `jalpadevi-gunasho` मा frontend र Flask API लाई Vercel Services का रूपमा चलाउँछ। `/api/*` अनुरोध backend मा र अरू पृष्ठ frontend मा जान्छन्। Project को Root Directory repository को मुख्य folder हुनुपर्छ र Framework Preset `Services` हुनुपर्छ। Frontend र API एउटै domain (`https://jalpadevi-gunasho.vercel.app`) प्रयोग गर्छन्।

Project मा private Vercel Blob store जोडेर `BLOB_READ_WRITE_TOKEN` उपलब्ध गराउनुहोस्। Production, Preview र Development environment मा यी variables राख्नुहोस्:

- `ADMIN_PASSWORD`: बलियो, अद्वितीय प्रशासन पासवर्ड
- `ADMIN_TOKEN`: लामो, random secret token
- `ADMIN_EMAILS`: login गर्न पाउने email हरू comma ले छुट्याएर
- `BLOB_READ_WRITE_TOKEN`: private Blob store को read/write token
- `SMTP_USER`, `SMTP_PASSWORD`: email सूचना चाहिँदा मात्रै

`ADMIN_PASSWORD`, `ADMIN_TOKEN` वा Blob token लाई Git मा नराख्नुहोस्। Production portal सार्वजनिक हुन Vercel Deployment Protection को SSO बन्द हुनुपर्छ। Repository को मुख्य folder बाट deploy गर्न:

```bash
vercel --prod
```

Vercel Function को ४.५ MB request सीमा भएकाले गुनासो फारमले फोटो/PDF र आवाजको जम्मा आकार ३ MB सम्म स्वीकार गर्छ। फाइलहरू private राखिएका छन् र डाउनलोड गर्न प्रशासन login आवश्यक हुन्छ।

## Data

Complaint records र attachments private Vercel Blob storage मा राखिन्छन्। Vercel Functions को स्थानीय filesystem स्थायी हुँदैन, त्यसैले production data त्यहाँ लेखिँदैन।

Repository को पुरानो demo `backend/data.json` र `backend/uploads` मा व्यक्तिगत विवरण/आवाज भएकाले deployment बाट बाहिर राखिन्छन् र Git मा अब commit हुँदैनन्। नयाँ production Blob store मा ती records copy हुँदैनन्।

## Pages

- मुख्य पृष्ठ: `#home`
- गुनासो दर्ता: `#complaint`
- गुनासो अवस्था: `#status`
- QR code: `#qr`
- प्रशासन login: `#login`
- प्रशासन dashboard: `#dashboard`
