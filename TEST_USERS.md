# Teşvik360 Test Users 🧪

## Quick Test Credentials

### 👨‍💼 Admin User
- **Email:** `admin@tesvik360.com`
- **Password:** `admin123`
- **Role:** Administrator
- **Status:** ✅ Active

### 🏢 Company Users

#### User 1: Active Company
- **Email:** `demo@akintechnology.com`
- **Password:** `company123`
- **Company:** Akın Technology A.Ş.
- **Status:** ✅ Active

#### User 2: Active Company
- **Email:** `info@innovasyon.com`
- **Password:** `company123`
- **Company:** İnovasyon Yazılım Ltd. Şti.
- **Status:** ✅ Active

#### User 3: Pending Company
- **Email:** `contact@digitech.com`
- **Password:** `company123`
- **Company:** DigiTech Solutions A.Ş.
- **Status:** ⏳ Pending (Admin approval needed)

#### User 4: Active Company
- **Email:** `admin@greentech.com`
- **Password:** `company123`
- **Company:** GreenTech Energy Ltd.
- **Status:** ✅ Active

### 👨‍🏫 Consultant Users

#### Consultant 1: Active
- **Email:** `ahmet@danismanlik.com`
- **Password:** `consultant123`
- **Sector:** Teknoloji ve Yazılım
- **Status:** ✅ Active

#### Consultant 2: Active
- **Email:** `fatma@tesvikuzman.com`
- **Password:** `consultant123`
- **Sector:** İmalat ve Sanayi
- **Status:** ✅ Active

#### Consultant 3: Pending
- **Email:** `mustafa@consultant.com`
- **Password:** `consultant123`
- **Sector:** Enerji ve Çevre
- **Status:** ⏳ Pending (Admin approval needed)

#### Consultant 4: Active
- **Email:** `elif@uzman.com`
- **Password:** `consultant123`
- **Sector:** Ar-Ge ve İnovasyon
- **Status:** ✅ Active

## 🧪 Testing Scenarios

### Immediate Login (Active Users)
- Try logging in with any **Active** user to see the dashboard
- Test different roles to see different features

### Admin Approval Flow
- Login as admin to approve pending users
- Try logging in with pending users before/after approval

### Registration Testing
- Register new users and test the approval workflow
- Test different role selections (Company vs Consultant)

## 🌐 URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001/api/health

## 💡 Test Tips
- **Active users** can login immediately
- **Pending users** need admin approval first
- Use admin account to approve pending users
- Test the modern UI design with different screen sizes