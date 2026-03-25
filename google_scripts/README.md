# El Inge POS AI - Google Scripts Backend

## 📋 Overview

This folder contains the **Google Apps Script** backend code that connects your React POS app to:
- **Google Sheets** - Database for Products, Sales, Clients, Suppliers, Settings, Users, Inventory Movements
- **Google Drive** - File storage for receipts, invoices, product images, bank statements

---

## 🚀 Setup Instructions

### Step 1: Open Your Google Sheet
1. Go to: https://sheets.google.com
2. Open your spreadsheet with ID: `13agoUn9Cdp3UVjAtBtvYrTQljnSy0x85cIgWdU5Xshc`

### Step 2: Open Apps Script Editor
1. In the Google Sheet, go to **Extensions** > **Apps Script**
2. Delete any existing code in the editor
3. Copy the entire content of `Code.gs` and paste it into the editor
4. Click **Save** (💾) and name your project "El Inge POS Backend"

### Step 3: Initialize the Backend
1. In the Apps Script editor, select the `initializeBackend` function from the dropdown
2. Click **Run** ▶️
3. Grant permissions when prompted (Review permissions > Allow)
4. This will create:
   - All required sheets (Products, Sales, Clients, Suppliers, Settings, Users, InventoryMovements)
   - All Drive subfolders in your main folder

### Step 4: Seed Product Catalog + Create Admin User
1. Select the `seedSyngentaCatalog` function
2. Click **Run** ▶️
3. This will:
   - Populate your Products sheet with 12 Syngenta products
   - Create a default admin user (username: `admin`, password: `admin123`)

### Step 5: Deploy as Web App
1. Click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: El Inge POS API v1
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone (or Anyone with Google account)
5. Click **Deploy**
6. Copy the **Web app URL** - you'll need this for your React app!

---

## 📁 Google Sheets Structure

### 1. Products Sheet
| Column | Type | Description |
|--------|------|-------------|
| id | String | Unique product ID |
| name | String | Product name |
| category | String | insecticida/herbicida/fungicida/etc |
| price | Number | Unit price |
| stock | Number | Current stock |
| unit | String | Lt/Kg/Pza |
| minStock | Number | Minimum stock alert threshold |
| emoji | String | Product emoji icon |
| barcode | String | Barcode for scanner |
| isExternal | Boolean | External product flag |
| imageUrl | String | Google Drive image URL |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### 2. Sales Sheet
| Column | Type | Description |
|--------|------|-------------|
| id | String | Sale ID (V-timestamp) |
| items | JSON | Array of cart items |
| subtotal | Number | Subtotal before tax |
| iva | Number | IVA amount (16% or 0) |
| total | Number | Final total |
| date | String | Sale date/time |
| ivaCondition | String | "aplica" or "exento" |
| clientId | String | Optional client ID |
| receiptUrl | String | Google Drive receipt URL |
| createdAt | Date | Creation timestamp |

### 3. Clients Sheet
| Column | Type | Description |
|--------|------|-------------|
| id | String | Unique client ID |
| name | String | Client name |
| phone | String | Phone number |
| email | String | Email address |
| rfc | String | Mexican tax ID |
| address | String | Full address |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### 4. Suppliers Sheet
| Column | Type | Description |
|--------|------|-------------|
| id | String | Unique supplier ID |
| company | String | Company name |
| contact | String | Contact person |
| phone | String | Phone number |
| email | String | Email address |
| address | String | Full address |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### 5. Settings Sheet
| Column | Type | Description |
|--------|------|-------------|
| key | String | Setting key |
| value | String | Setting value |
| updatedAt | Date | Last update timestamp |

### 6. Users Sheet ⭐ NEW
| Column | Type | Description |
|--------|------|-------------|
| id | String | Unique user ID |
| username | String | Username for login |
| email | String | Email address |
| passwordHash | String | SHA-256 password hash |
| role | String | "admin" or "user" |
| fullName | String | Full name |
| phone | String | Phone number |
| active | Boolean | Account active status |
| lastLogin | Date | Last login timestamp |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### 7. InventoryMovements Sheet ⭐ NEW
| Column | Type | Description |
|--------|------|-------------|
| id | String | Unique movement ID |
| productId | String | Product ID |
| productName | String | Product name |
| type | String | "sale", "restock", "adjustment", "return" |
| quantity | Number | Quantity changed |
| previousStock | Number | Stock before change |
| newStock | Number | Stock after change |
| reason | String | Reason for movement |
| userId | String | User who made the change |
| saleId | String | Related sale ID (if applicable) |
| createdAt | Date | Movement timestamp |

---

## 📂 Google Drive Folder Structure

```
Main Folder (1WEHDtOtDc4XC4EDQsyVowep5rto70DvQ)
├── 📁 Products_Images/     - Product photos
├── 📁 Sales_Receipts/      - Sale receipts (PDFs)
├── 📁 Invoices/            - Invoices
├── 📁 Bank_Statements/     - Bank statements
└── 📁 Suppliers_Documents/ - Supplier documents
```

---

## 🔌 API Endpoints

After deployment, your Web App URL will be:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### GET Requests

| Action | Parameters | Description |
|--------|------------|-------------|
| `getProducts` | - | Get all products |
| `getProduct` | `id` | Get single product |
| `getSales` | - | Get all sales |
| `getClients` | - | Get all clients |
| `getClient` | `id` | Get single client |
| `getSuppliers` | - | Get all suppliers |
| `getSupplier` | `id` | Get single supplier |
| `getSettings` | - | Get all settings |
| `getUsers` | - | Get all users |
| `getUser` | `id` | Get single user |
| `authenticate` | `username`, `password` | Authenticate user |
| `getFolderUrl` | `folderType` | Get Drive folder URL |
| `getInventoryMovements` | `productId` | Get inventory movements |

### POST Requests

| Action | Body | Description |
|--------|------|-------------|
| `createProduct` | Product object | Create new product |
| `updateProduct` | Product object | Update product |
| `deleteProduct` | `{ id }` | Delete product |
| `createSale` | Sale object | Create new sale |
| `createClient` | Client object | Create new client |
| `updateClient` | Client object | Update client |
| `deleteClient` | `{ id }` | Delete client |
| `createSupplier` | Supplier object | Create new supplier |
| `updateSupplier` | Supplier object | Update supplier |
| `deleteSupplier` | `{ id }` | Delete supplier |
| `updateSettings` | Settings object | Update settings |
| `createUser` | User object | Create new user |
| `updateUser` | User object | Update user |
| `deleteUser` | `{ id }` | Delete user |
| `updateUserPassword` | `{ id, newPassword }` | Update user password |
| `recordInventoryMovement` | Movement object | Record inventory movement |
| `uploadFile` | `{ fileName, mimeType, base64Data, folderType }` | Upload file to Drive |

---

## 📝 Example API Calls

### Get All Products
```javascript
fetch('YOUR_WEB_APP_URL?action=getProducts')
  .then(r => r.json())
  .then(data => console.log(data.data));
```

### Authenticate User
```javascript
fetch('YOUR_WEB_APP_URL?action=authenticate&username=admin&password=admin123')
  .then(r => r.json())
  .then(data => console.log(data.data));
```

### Create a Sale
```javascript
fetch('YOUR_WEB_APP_URL?action=createSale', {
  method: 'POST',
  body: JSON.stringify({
    id: 'V-123456',
    items: [...],
    subtotal: 1000,
    iva: 160,
    total: 1160,
    date: new Date().toLocaleString('es-MX'),
    ivaCondition: 'aplica'
  })
})
.then(r => r.json())
.then(data => console.log(data.data));
```

### Create User
```javascript
fetch('YOUR_WEB_APP_URL?action=createUser', {
  method: 'POST',
  body: JSON.stringify({
    username: "rodrigo",
    email: "rodrigo@elinge.com",
    password: "secure123",
    fullName: "Rodrigo H.",
    role: "admin",
    phone: "(489) 123-4567"
  })
})
.then(r => r.json())
.then(data => console.log(data.data));
```

### Record Inventory Movement
```javascript
fetch('YOUR_WEB_APP_URL?action=recordInventoryMovement', {
  method: 'POST',
  body: JSON.stringify({
    productId: "1",
    productName: "Denim",
    type: "restock",
    quantity: 50,
    previousStock: 24,
    newStock: 74,
    reason: "New shipment received",
    userId: "user-123"
  })
})
.then(r => r.json())
.then(data => console.log(data.data));
```

### Upload a Receipt
```javascript
fetch('YOUR_WEB_APP_URL?action=uploadFile', {
  method: 'POST',
  body: JSON.stringify({
    fileName: 'receipt-V-123456.pdf',
    mimeType: 'application/pdf',
    base64Data: 'data:application/pdf;base64,JVBERi0xLjQK...',
    folderType: 'salesReceipts'
  })
})
.then(r => r.json())
.then(data => console.log(data.data));
```

---

## ⚠️ Important Notes

1. **CORS**: Google Apps Script handles CORS automatically
2. **Rate Limits**: ~100 requests/minute per user
3. **Execution Time**: Max 6 minutes per request
4. **Quotas**: Check your Google Cloud quotas in Apps Script dashboard
5. **Security**: Passwords are hashed with SHA-256 (for production, consider stronger encryption)

---

## 🧪 Testing Functions

Run these manually from the Apps Script editor:

| Function | Purpose |
|----------|---------|
| `initializeBackend()` | Create all sheets and folders |
| `seedSyngentaCatalog()` | Populate 12 default products + create admin user |
| `createDefaultAdmin()` | Create admin user only |
| `getProducts()` | Test products fetch |
| `getSettings()` | Test settings fetch |
| `getUsers()` | Test users fetch |

---

## 🔐 Default Admin Credentials

After running `seedSyngentaCatalog()`:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | admin |

**⚠️ IMPORTANT:** Change this password immediately after first login!

---

## 🔐 Security

- Deploy with **"Execute as: Me"** to use your credentials
- Set **"Who has access"** based on your needs:
  - **Anyone**: Public API (less secure)
  - **Anyone with Google account**: Requires sign-in
  - **Only myself**: For testing only
- Password hashes are stored in Sheets (not plain text)
- Password hash is never returned in API responses

---

## 📞 Support

For issues, check:
1. Apps Script **Executions** tab for errors
2. Google Sheet **Version History** for data changes
3. Drive **Activity** for file uploads
