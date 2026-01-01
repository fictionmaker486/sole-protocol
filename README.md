# SOLE PROTOCOL v2.0 🕵️‍♂️

![Status](https://img.shields.io/badge/Status-Live-brightgreen)
![Deployment](https://img.shields.io/badge/Deployment-Vercel-black)
![Database](https://img.shields.io/badge/Database-Supabase-blueviolet)

[Live Demo](https://sole-protocol.vercel.app/)

## 📄 專案簡介 / Project Overview

**SOLE PROTOCOL** 是一個極簡風格的特務身分管理系統。本專案展示了現代化的全端開發流程，包含前端 UI 設計、後端資料庫整合以及自動化雲端佈署。
**SOLE PROTOCOL** is a minimalist agent identity management system. This project demonstrates modern full-stack development, including frontend UI design, backend database integration, and automated cloud deployment.

---

## 🚀 技術堆疊 / Tech Stack

- **Frontend:** Next.js (React)
- **Styling:** Tailwind CSS (Minimalist Dark/Light Mode)
- **Backend/Auth:** Supabase (PostgreSQL, Row Level Security)
- **Deployment:** Vercel

---

## ✨ 核心功能 / Core Features

- **🔐 安全驗證 (Security):** 整合 Supabase Auth 提供身分驗證，並透過 RLS (Row Level Security) 保護資料安全。
  Integrated Supabase Auth with RLS (Row Level Security) for data protection.
- **🆔 身分識別 (Identity):** 根據登入帳號動態生成特務識別證 (Agent ID Card)。
  Dynamic generation of Agent ID cards based on user profiles.
- **📊 信用評分 (Credibility):** 後台動態串接資料庫顯示特務的信譽分值。
  Real-time database fetching for agent credibility scores.

---

## 🛠️ 開發歷程 / Development Journey

本專案在佈署過程中克服了多項技術挑戰：
This project overcame several technical challenges during deployment:

1. **Root Directory Configuration:** 成功解決多層目錄下的 Vercel 佈署路徑設定。
   Resolved Vercel deployment path settings for monorepo structures.
2. **Database Integration:** 透過 SQL 直接注入修復了 RLS 權限與帳號驗證流程。
   Fixed RLS permissions and account verification flows via direct SQL injection.
3. **Environment Security:** 完整配置環境變數 (Environment Variables) 確保 API 金鑰安全。
   Configured Environment Variables to ensure API key security.

---

## 👤 測試帳號 / Test Credentials

若要進入系統查看，可使用以下測試憑證：
To explore the system, use the following credentials:

- **Email:** `final_agent@test.com`
- **Password:** `12345678`

---

## 👨‍💻 作者 / Author

**fictionmaker486**
- GitHub: [fictionmaker486](https://github.com/fictionmaker486)
- Project Link: [sole-protocol](https://github.com/fictionmaker486/sole-protocol)
