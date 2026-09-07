# AI Partner 初始訪談表

這是 AI Partner 初始設定的正式來源。你可以打字、使用語音輸入（Wispr Flow／作業系統聽寫），或執行 `/onboard` 進行引導訪談。不論採用哪種方式，`/onboard` 都會讀取本檔案來建立第一天的設定。

**最多 7 題。** 每題以能在 60 秒內回答為原則。不用過度思考，之後隨時可以修改並重新執行 `/onboard`。

---

## Q1：你是誰？提供什麼產品或服務？服務誰？

身分、方案、理想客戶輪廓，各寫一小段即可。

```text
[Your answer here]
```

請在上方占位填入你的回答；以下相同。

---

## Q2：貼上最近寫過的 1–2 段文字，不要修改

Email、LinkedIn 貼文、私訊、文件都可以，選自然表達時寫的內容。**請貼完整原文。** 不要在與 Claude 對話時現寫，現寫的文字會受對話影響，無法作為可靠的語氣樣本。

```text
[Sample 1 — paste raw]
```

```text
[Sample 2 — paste raw]
```

上方分別貼入第一份、第二份原始文字。

---

## Q3：未來 90 天最重要的 2–3 件事是什麼？

請寫季度優先事項，不是年度願望。原範例是：「哪些事情如果到了 7 月還沒做完，你會覺得浪費了第二季？」請依你目前的季度思考。

```text
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]
```

---

## Q4：收入實際進到哪裡？在哪裡記錄？

可以有多個答案，例如 Stripe、Skool、GoHighLevel、QuickBooks 或試算表。

```text
[Your answer here]
```

---

## Q5：平常透過什麼管道與客戶、團隊及外部聯絡？

Email（Gmail 或 Outlook）、Slack、Teams、私訊（Skool／Discord／iMessage）、電話等。

```text
[Your answer here]
```

---

## Q6：會議錄影、筆記與重要文件放在哪裡？

例如 Granola、Otter、Fireflies、Google Drive、Notion、Dropbox，或桌面上一直想整理的資料夾。

```text
[Your answer here]
```

---

## Q7：哪一項工作最占用你一週的時間？目前在哪裡追蹤工作？

寫出最耗時或反覆需要處理的一項工作，以及任務／專案目前放在哪裡，例如 ClickUp、Asana、Linear、Notion 或筆記本。

```text
[Your answer here]
```

---

填完後執行或重新執行 `/onboard`。精靈會建立初始檔案：`context/`、`references/voice.md`、填入資料的 `connections.md`，以及完成設定的 `CLAUDE.md`。
