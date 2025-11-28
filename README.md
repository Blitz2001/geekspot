# Geekspot - Premium Tech E-commerce Platform 🚀

Geekspot is a modern, full-stack e-commerce application built for tech enthusiasts. It features a sleek, dark-themed UI with glassmorphism effects, comprehensive product management, and a seamless shopping experience.

![Geekspot Banner](https://via.placeholder.com/1200x400?text=Geekspot+E-commerce)

## ✨ Key Features

### 🛍️ Customer Experience
*   **Modern UI/UX**: Responsive design with neon accents and smooth animations.
*   **Product Discovery**: Advanced filtering (Price, Brand), sorting, and search.
*   **Special Deals**: Dedicated section for time-limited offers and featured products.
*   **User Accounts**: Order tracking, profile management, and review system.
*   **Shopping Cart**: Real-time stock checks and seamless checkout process.
*   **Reviews**: Star ratings and photo reviews for products.

### 👨‍💼 Admin Dashboard
*   **Product Management**: Create, edit, and delete products with image uploads (Cloudinary).
*   **Inventory Control**: Track stock levels with low-stock alerts.
*   **Order Management**: Process orders, update statuses, and generate PDF invoices.
*   **Analytics**: Visual dashboard for revenue, sales, and customer insights.
*   **Review Moderation**: Approve or reject user reviews.
*   **Product Validity**: Set auto-expiration dates for time-sensitive pricing.

## 🛠️ Tech Stack

### Frontend
*   **React** (Vite)
*   **Tailwind CSS** (Styling)
*   **Framer Motion** (Animations)
*   **Lucide React** (Icons)
*   **Axios** (API Requests)

### Backend
*   **Node.js & Express**
*   **MongoDB** (Database)
*   **Mongoose** (ODM)
*   **JWT** (Authentication)
*   **Cloudinary** (Image Storage)
*   **PDFKit** (Invoice Generation)
*   **Nodemailer** (Email Notifications)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v14+)
*   MongoDB (Local or Atlas)
*   Cloudinary Account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Blitz2001/geekspot.git
    cd geekspot
    ```

2.  **Install Dependencies**
    ```bash
    # Install backend dependencies
    cd backend
    npm install

    # Install frontend dependencies
    cd ../frontend
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    EMAIL_USER=your_email
    EMAIL_PASS=your_email_password
    FRONTEND_URL=http://localhost:5173
    ```

    Create a `.env` file in the `frontend` directory:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

4.  **Run the Application**
    ```bash
    # Start Backend (from backend dir)
    npm start

    # Start Frontend (from frontend dir)
    npm run dev
    ```

## 📄 License
This project is licensed under the MIT License.
