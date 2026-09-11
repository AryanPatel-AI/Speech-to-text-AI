---
title: Speech To Text AI
emoji: 🚀
colorFrom: red
colorTo: red
sdk: docker
pinned: false
---

# 🚀 Speech To Text AI

An AI-powered **Speech-to-Text** web application that converts spoken audio into text quickly and accurately.

## 🌐 Live Demo

**Vercel:**
[Speech To Text AI — Live Demo](https://speech-to-text-ai-three.vercel.app/?utm_source=chatgpt.com)

**Hugging Face Space:**
Add your Hugging Face Space URL here once the Space is published.

---

## ✨ Features

* 🎙️ Speech-to-text transcription
* 🤖 AI-powered audio processing
* ⚡ Fast and responsive interface
* 🌐 Full-stack web application
* 📱 Responsive design
* 🔒 Secure server-side processing
* 📦 Docker-based deployment
* 🚀 Deployed on Vercel
* 🤗 Compatible with Hugging Face Spaces

---

## 🛠️ Tech Stack

* **Frontend:** Next.js / React
* **Backend:** Next.js server-side functionality
* **AI:** Speech-to-Text processing
* **Database:** Configured through `DATABASE_URL`
* **Email:** Email provider for inquiry notifications
* **Deployment:** Vercel + Hugging Face Spaces
* **Containerization:** Docker

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
DATABASE_URL=your_database_url
```

Add any additional API keys or service credentials required by your project.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 📦 Production Build

Create a production build with:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

---

## 🐳 Docker

This project is configured for Docker-based deployment.

Build the Docker image:

```bash
docker build -t speech-to-text-ai .
```

Run the container:

```bash
docker run -p 3000:3000 speech-to-text-ai
```

The application will be available at:

```text
http://localhost:3000
```

---

## ☁️ Deployment

### Vercel

The application is deployed on Vercel:

[https://speech-to-text-ai-three.vercel.app/](https://speech-to-text-ai-three.vercel.app/?utm_source=chatgpt.com)

For Vercel deployment, make sure all required environment variables are configured in the project's **Environment Variables** settings.

### Hugging Face Spaces

This project can also be deployed as a Docker-based Hugging Face Space.

Hugging Face Space configuration:

```yaml
---
title: Speech To Text AI
emoji: 🚀
colorFrom: red
colorTo: red
sdk: docker
pinned: false
---
```

For more information, see the Hugging Face Spaces configuration reference:

[Hugging Face Spaces Configuration Reference](https://huggingface.co/docs/hub/spaces-config-reference?utm_source=chatgpt.com)

---

## 📁 Project Structure

```text
.
├── app/
├── public/
├── components/
├── lib/
├── Dockerfile
├── package.json
├── next.config.*
├── .gitignore
└── README.md
```

> The exact structure may vary depending on the current project implementation.

---

## 🔐 Environment Variables

Never commit secrets or API keys to Git.

Example:

```env
DATABASE_URL=your_database_url
```

If your application uses additional services, add their credentials as environment variables rather than hard-coding them in the source code.

---

## 📝 Inquiry Notifications

The application can be configured to send notifications when users submit inquiries through the website.

Configure the required email service credentials in your deployment environment rather than committing them to the repository.

---

## 📄 License

Add your preferred license here.

For example:

```text
MIT License
```

---

## 👨‍💻 Developer

**Aryan Patel**

Built with ❤️ using Next.js and AI.


---

⭐ If you find this project useful, consider giving the repository a star!
