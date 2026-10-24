# پیگیری مطالعه Eteach

ریپو: [github.com/kianiii/zaban](https://github.com/kianiii/zaban)

برنامه از **۱ آبان ۱۴۰۵** شروع می‌شود. درس‌های ۱ تا ۱۵ به‌عنوان دور اول ثبت شده‌اند. پیشرفت در فایل `data/progress.json` همین ریپو ذخیره می‌شود تا موبایل و دسکتاپ یکی باشند.

## اجرا روی سیستم خودت

```bash
cd D:\zaban\eteaching-tracker
npm install
npm run dev
```

آدرس: `http://localhost:3000`

برای اینکه تیک‌ها روی گیت‌هاب ذخیره شوند، فایل `.env.local` بساز:

```
GITHUB_TOKEN=توکن_گیتهاب
GITHUB_OWNER=kianiii
GITHUB_REPO=zaban
GITHUB_BRANCH=main
GITHUB_PROGRESS_PATH=data/progress.json
```

توکن را از GitHub بساز: Settings → Developer settings → Personal access tokens → Fine-grained. دسترسی **Contents: Read and write** روی ریپوی `zaban`.

## موبایل و دسکتاپ روی اینترنت

بعد از پوش شدن ریپو، همین پروژه را به [Vercel](https://vercel.com) وصل کن و همان متغیرهای محیطی را آنجا هم بگذار. بعد لینک `https://....vercel.app` را روی گوشی و کامپیوتر باز کن.
