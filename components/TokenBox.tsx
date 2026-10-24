"use client";

import { useState } from "react";
import { getToken, setToken } from "@/lib/progress-store";

export function TokenBox() {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <section className="card p-3.5">
      <h2 className="m-0 text-[1.05rem] font-black">ذخیره روی گیت‌هاب</h2>
      <p className="subtitle">
        یک Fine-grained token با دسترسی Contents روی ریپوی zaban بگذار تا تیک گوشی و کامپیوتر یکی شود.
      </p>
      <input
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={getToken() ? "توکن ذخیره شده؛ برای عوض کردن بنویس" : "GitHub token"}
        className="mt-3 w-full rounded-xl bg-black/20 border border-white/10 px-3 py-3 text-[15px]"
      />
      <button
        className="mt-3 rounded-xl bg-[var(--teal)] text-[#08110f] font-black px-4 py-3"
        onClick={() => {
          setToken(value);
          setSaved(true);
        }}
      >
        ذخیره توکن روی این دستگاه
      </button>
      {saved ? <p className="subtitle">ذخیره شد. از این به بعد تیک‌ها به data/progress.json می‌رود.</p> : null}
    </section>
  );
}
