# Final Step: Publish Your Website

I have prepared your project for live deployment. Follow these simple steps to make your website live for the world!

## 1. Publish the Frontend (Vercel)
Vercel is the best way to host your Next.js frontend for free.

1.  Go to [vercel.com](https://vercel.com/new) and log in with your GitHub account.
2.  Import your **E-Commerce-AI** repository.
3.  In the **Environment Variables** section, add:
    -   `NEXT_PUBLIC_BACKEND_URL`: `https://your-backend-url.onrender.com/api` (You will get this from step 2).
4.  Click **Deploy**.

## 2. Publish the Backend & ML Service (Render)
Render will host your Node.js and Python services together using the blueprint I created.

1.  Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints) and log in with GitHub.
2.  Connect your **E-Commerce-AI** repository.
3.  Render will automatically see the `render.yaml` file I created. Click **Apply**.
4.  Once the services are live, copy your backend URL (e.g., `https://aimart-backend.onrender.com`) and update your Vercel environment variables.

---
### **I've pushed these instructions to your GitHub repository!**
You can always refer to `DEPLOY.md` in your repo for these steps.
