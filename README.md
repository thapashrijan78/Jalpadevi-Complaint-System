# श्री जाल्पादेवी माध्यमिक विद्यालय — गुनासो दर्ता प्रणाली

यो परियोजना नेपाली विद्यालय/स्थानीय समुदायका लागि मोबाइल र कम्प्युटर दुवैमा चल्ने गुनासो पोर्टल हो।

## मुख्य सुविधाहरू
- पूर्ण नेपाली UI
- विद्यार्थी, शिक्षक र अभिभावकका लागि गुनासो दर्ता
- व्यक्तिगत विवरण वा गोप्य/अनामिक गुनासो
- गुनासोको विषय, शीर्षक, विवरण र स्थान
- मोबाइल/ल्यापटपबाट आवाज रेकर्ड
- JPG/JPEG/PNG/PDF फाइल संलग्न
- गुनासो दर्ता भएपछि Tracking ID
- Tracking ID बाट गुनासोको अवस्था हेर्ने
- अध्यक्ष/प्रशासनका लागि login
- Admin dashboard, search, filter र status update
- QR code generator — स्क्यान गर्दा सार्वजनिक गुनासो पृष्ठ खुल्ने
- विद्यालयको लोगो/नाम/ठेगाना reference image अनुसार
- Responsive design

## चलाउने तरिका — Mac

### Terminal 1: Backend
```bash
cd path-to-your-clone/Jalpadevi-Complaint-System/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Terminal 2: Frontend
```bash
cd path-to-your-clone/Jalpadevi-Complaint-System/frontend
npm install
npm run dev
```

Vite ले दिएको `http://localhost:...` URL browser मा खोल्नुहोस्।

## Demo प्रशासन login
Username: `admin`
Password: `admin123`

## Production deployment (Vercel + Render)

The frontend and Flask API are deployed as two services. Vercel serves the site; Render runs the API and keeps complaint data and uploaded files on a persistent disk.

### 1. Deploy the API on Render

1. Push this project to a Git repository and create a new **Blueprint** in Render using `render.yaml`.
2. In the API service's environment settings, set `ADMIN_PASSWORD` to a strong private password. For the first deployment, set `CORS_ORIGINS` to `*`; after creating the Vercel site, replace it with the exact site origin, for example `https://your-site.vercel.app` (no trailing slash). Keep the generated `ADMIN_TOKEN` secret.
3. Wait for the service to deploy. Confirm `https://YOUR-API.onrender.com/api/health` returns JSON with `"ok": true`.

### 2. Deploy the frontend on Vercel

1. Import the same GitHub repository into Vercel and set **Root Directory** to `frontend`.
2. Add the environment variable `VITE_API_BASE_URL` with the API origin, for example `https://YOUR-API.onrender.com` (no trailing slash).
3. Deploy or redeploy. The site and API now connect through the configured API origin, and uploaded files use that same origin.

The root `vercel.json` that attempted to define both services has been removed; Vercel should deploy only the `frontend` directory. After frontend deployment, restrict Render `CORS_ORIGINS` from `*` to the Vercel site origin and redeploy the API. For a custom domain, update `CORS_ORIGINS` to that domain too.

Local development still uses Vite's `/api` proxy and does not need `VITE_API_BASE_URL`.

### Admin and storage notes

Set the Vercel environment variable before its production build. Configure the allowed admin emails with Render's `ADMIN_EMAILS` (comma-separated). The login page checks credentials through the API; credentials are no longer embedded in the frontend bundle. Render uses the persistent disk mounted at `/var/data` for the JSON records and uploads. The API makes a one-time copy of bundled demo data into that disk when it is empty.

## Public pages
- मुख्य पृष्ठ: `#home`
- गुनासो दर्ता: `#complaint`
- गुनासो अवस्था: `#status`
- QR code: `#qr`
- प्रशासन login: `#login`
- प्रशासन dashboard: `#dashboard`

## महत्वपूर्ण
यो local/demo deployment का लागि तयार गरिएको पूर्ण working prototype हो। वास्तविक विद्यालयमा सार्वजनिक प्रयोग गर्दा PostgreSQL, password hashing, HTTPS, secure sessions/JWT, cloud storage, backup, rate limiting र SMS/email notification थप्नुहोस्।
