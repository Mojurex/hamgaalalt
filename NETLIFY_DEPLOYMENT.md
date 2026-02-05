# 🚀 Netlify Deployment Guide - Сурагчийн Туслах Систем

## Яагаад алдаа гарч байна вэ?

Netlify дээр Next.js апп тавихад дараах асуудлууд гарч болно:
1. **Environment variables** тохируулаагүй
2. **MongoDB холболт** - Netlify serverless дээр local MongoDB ажиллахгүй
3. **Build тохиргоо** буруу байх

---

## ✅ Шийдэл: MongoDB Atlas + Netlify тохиргоо

### Алхам 1: MongoDB Atlas үүсгэх (ЧУХАЛ!)

Netlify serverless орчинд local MongoDB (`localhost:27017`) ажиллахгүй. Cloud database хэрэгтэй.

1. **MongoDB Atlas руу бүртгүүлэх**
   - Хаяг: https://www.mongodb.com/cloud/atlas/register
   - Үнэгүй (M0 Free tier)

2. **Cluster үүсгэх**
   - "Build a Database" дарах
   - "Shared" (FREE) сонгох
   - Cloud Provider: AWS
   - Region: Singapore эсвэл ойр байрлал сонгох
   - Cluster Name: `school-support-cluster`

3. **Database User үүсгэх**
   - Security → Database Access
   - "Add New Database User" дарах
   - Username: `school_admin`
   - Password: хүчтэй нууц үг үүсгэх (хадгалаад авах!)
   - Built-in Role: "Read and write to any database"

4. **Network Access тохируулах**
   - Security → Network Access
   - "Add IP Address" дарах
   - "Allow Access from Anywhere" сонгох (0.0.0.0/0)
   - Confirm

5. **Connection String авах**
   - Database → Connect
   - "Connect your application" сонгох
   - Driver: Node.js, Version: 5.5 or later
   - Connection string хуулах:
   ```
   mongodb+srv://<username>:<password>@school-support-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - `<username>` болон `<password>`-ыг өөрийн мэдээллээр солих

6. **Database name нэмэх**
   - Connection string-д database нэр нэмэх:
   ```
   mongodb+srv://school_admin:YOUR_PASSWORD@school-support-cluster.xxxxx.mongodb.net/school-support-system?retryWrites=true&w=majority
   ```

---

### Алхам 2: Netlify Site тохиргоо

1. **Netlify-д нэвтэрч GitHub холбох**
   - https://app.netlify.com руу орох
   - "Add new site" → "Import an existing project"
   - GitHub repository холбох: `Mojurex/hamgaalalt`

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables тохируулах**
   
   Site Configuration → Environment Variables дээр дараах утгуудыг нэмнэ:

   ```bash
   # MongoDB Connection (ATLAS холболт ашиглах!)
   MONGODB_URI=mongodb+srv://school_admin:YOUR_PASSWORD@school-support-cluster.xxxxx.mongodb.net/school-support-system?retryWrites=true&w=majority

   # JWT Secret (хүчтэй нууц түлхүүр)
   JWT_SECRET=netlify-production-super-secret-key-change-this-2026

   # NextAuth URL (Netlify domain ашиглах)
   NEXTAUTH_URL=https://hamgaalalt.netlify.app

   # Environment
   NODE_ENV=production
   
   # Netlify flag
   NETLIFY=true
   ```

4. **Deploy Settings**
   - "Deploy site" дарах
   - Build хийгдэхийг хүлээх (2-5 минут)

---

### Алхам 3: Database эхлүүлэх (Atlas дээр)

Atlas дээр анхны өгөгдөл үүсгэх:

**Option A: Script ашиглах (local)**
```bash
# Local .env файлд Atlas URI оруулах
MONGODB_URI=mongodb+srv://school_admin:YOUR_PASSWORD@cluster.mongodb.net/school-support-system

# Database эхлүүлэх
npm run init-db
```

**Option B: Netlify Function дуудах**

1. Эхлээд deploy амжилттай болохыг хүлээх
2. Browser-д нээх: `https://hamgaalalt.netlify.app/api/admin/init-db`
3. Эсвэл Netlify Functions tab дээр manually run хийх

---

### Алхам 4: Deployment шалгах

1. **Site нээх**
   ```
   https://hamgaalalt.netlify.app
   ```

2. **Admin нэвтрэх**
   ```
   https://hamgaalalt.netlify.app/admin/login
   Username: admin
   Password: admin1234
   ```

3. **Health check шалгах**
   ```
   https://hamgaalalt.netlify.app/api/health
   ```
   
   Response:
   ```json
   {
     "ok": true,
     "mongo": "connected",
     "dbName": "school-support-system"
   }
   ```

---

## 🔧 Алдаа засах (Troubleshooting)

### Алдаа 1: "500 Internal Server Error"

**Шалтгаан**: Environment variables алдаатай эсвэл MongoDB холбогдохгүй байна

**Шийдэл**:
1. Netlify Site Settings → Environment Variables шалгах
2. MONGODB_URI зөв Atlas connection string эсэхийг баталгаажуулах
3. MongoDB Atlas Network Access 0.0.0.0/0 нээлттэй эсэхийг шалгах
4. Redeploy хийх: Deploys → Trigger deploy → Deploy site

### Алдаа 2: "Cannot connect to MongoDB"

**Шийдэл**:
1. Atlas cluster идэвхтэй байгаа эсэхийг шалгах
2. Database user нууц үг зөв эсэхийг шалгах
3. Network Access whitelist 0.0.0.0/0 байгаа эсэхийг шалгах
4. Connection string format зөв эсэхийг шалгах

### Алдаа 3: "NEXTAUTH_URL not found"

**Шийдэл**:
1. Netlify environment variables дээр NEXTAUTH_URL нэмэх:
   ```
   NEXTAUTH_URL=https://hamgaalalt.netlify.app
   ```
2. Redeploy хийх

### Алдаа 4: Build failed

**Шийдэл**:
1. Netlify build logs шалгах
2. Local дээр `npm run build` ажиллаж байгаа эсэхийг шалгах
3. Dependencies install алдаа бол `package-lock.json` commit хийх

---

## 📋 Environment Variables жагсаалт

Netlify Site Settings → Environment Variables дээр эдгээр бүгдийг тохируулах:

| Variable | Value | Тайлбар |
|----------|-------|---------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas холболт |
| `JWT_SECRET` | `strong-random-secret` | JWT токен нууцлал |
| `NEXTAUTH_URL` | `https://hamgaalalt.netlify.app` | Site URL |
| `NODE_ENV` | `production` | Production орчин |
| `NETLIFY` | `true` | Netlify platform танилт |

---

## 🔄 Redeploy хийх

Code өөрчлөлт хийсний дараа:

```bash
# Local дээр
git add .
git commit -m "Fix: Update for Netlify deployment"
git push origin main
```

Netlify автоматаар rebuild хийнэ (2-5 минут).

---

## 🎯 Амжилттай Deployment шалгах checklist

- [ ] MongoDB Atlas cluster үүсгэсэн
- [ ] Database user үүсгэж, нууц үг хадгалсан
- [ ] Network Access 0.0.0.0/0 нээсэн
- [ ] Connection string зөв авсан
- [ ] Netlify environment variables бүгд тохируулсан
- [ ] Build амжилттай дууссан (green)
- [ ] Site нээгдэж байна
- [ ] `/api/health` endpoint 200 OK буцааж байна
- [ ] Admin login ажиллаж байна
- [ ] MongoDB дээр өгөгдөл харагдаж байна

---

## 💡 Зөвлөмж

1. **Atlas Free Tier хангалттай** - Жижиг project-д үнэгүй M0 cluster хэрэглэх
2. **Connection String нууцлах** - Environment variables дээр хадгалах, code-д бичихгүй
3. **Backup авах** - Atlas автомат backup хийдэг (Free tier дээр 1 өдрийн retention)
4. **Monitoring** - Netlify Functions logs болон Atlas monitoring шалгах
5. **Custom Domain** - Netlify дээр өөрийн домайн холбож болно

---

## 📞 Тусламж

MongoDB Atlas тусламж: https://www.mongodb.com/docs/atlas/
Netlify тусламж: https://docs.netlify.com/

---

**Амжилт хүсье! 🚀**
