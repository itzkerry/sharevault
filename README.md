## 📁 Share Vault
### [Live Demo](https://sharevault-3ype.vercel.app/)
**Share Vault** is a high-performance, secure media management platform. It allows users to create private digital lockers, upload bulk media, and share them via secure, obfuscated slug-links. Built with a focus on **security ownership** and **mobile-first UX**.

## 🚀 Technical Stack
- **Framework:** [Next.js 14 (App Router)](https://nextjs.org/)

 - **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)

- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Google OAuth)

- **Storage:** [ImageKit.io](https://imagekit.io/) (Image/Video Optimization)

- **Validation:** [Zod](https://zod.dev/)

- **Deployment:** [Vercel](https://http://vercel.com/)



## 🛠️ Key Features & Logic

### 🔐 Security & Ownership
Unlike basic sharing apps, Share Vault implements strict Ownership Checks. Even if a user knows a vault ID, the backend validates the session user against the database record before allowing any `Delete` or `Update` actions.

### **🔗 Smart Slug Generation**

To keep links readable but secure, I implemented a custom slug generator:

- **Format:** `name-lowercase-uuid_short`

- **Code:** `vault.name.toLocaleLowerCase().replace(/\s+/g, "-")}-${crypto.randomUUID().slice(0, 8)}`

- **Benefit:** Provides SEO-friendly URLs that are hard to "guess" (brute-force).

### 📱 Advanced Media Previewer

A custom-built viewer designed for both desktop and mobile:

- **Desktop:** Navigate using ArrowLeft and ArrowRight keyboard events.

- **Mobile:** Integrated touch-swipe gestures for a native app feel.

## 🧬 Database Schema



```Code snippet
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  image         String?
  vaults        Vault[]
}

model Vault {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  isPublic    Boolean  @default(false)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  media       Media[]
}

model Media {
  id        String   @id @default(cuid())
  url       String
  fileId    String   // ImageKit reference
  type      String   // "image" or "video"
  vaultId   String
  vault     Vault    @relation(fields: [vaultId], references: [id], onDelete: Cascade)
}
```


## 🛡️ Security Guardrails


1. **Input Validation:** Every API route is protected by **Zod** schemas to prevent SQL injection or malformed data.

2. **Auth-Protected Uploads:** Media is uploaded directly to ImageKit using a client-side approach, but only after receiving a **secure authentication token** from the backend.

3. **Privacy Toggle:** Users can flip a `shared` flag. If `false`, the vault returns a `403` `Forbidden` to any user except the owner.

## 🏃 Getting Started


1. **Clone the repo:**

```Bash
git clone https://github.com/itzkerry/share-vault.git
```
2. **Install dependencies:**
```Bash
npm install
```

3. **Setup Environment Variables (.env):**

```Code snippet
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```
4. **Run Prisma Migrations:**

```Bash
npx prisma db push
```
5. **Start the engine:**

```Bash
npm run dev
```
