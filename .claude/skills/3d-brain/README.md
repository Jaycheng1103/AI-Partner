# 3D 知識球體技能

從 AI Partner 已保存的知識建立有名稱的互動球體。技能會詢問顯示名稱與主要分類，對應指定的本機資料夾，再於 `apps/3d-brain/` 建立內附應用。

- Claude Code：`/3d-brain`
- Codex：選擇 **3D 知識球體**，或輸入 `$3d-brain`
- 自然語言：「從我的 AI Partner 建立 3D 知識球體。」

需要 Node.js 22 以上。內附已建置的繪圖程式，生成應用後執行 `node serve.mjs` 即可，不需先安裝 npm 套件。若要修改繪圖程式，請在生成的應用中執行 `npm ci`，修改後再執行 `npm run build:js`。

應用包含球面排列、中央球體、分類配色、搜尋、筆記閱讀器、來源篩選、完整清單、Cinema 展示模式與互動式成長重播。成長播放時仍可拖曳、縮放。連線來自所選筆記，動畫展示關聯，不是建立日期的歷史紀錄。

直接支援 Markdown／文字與整理後的 Codex 記憶。Claude 記憶使用指定的 Markdown 資料夾；會議與影片知識可使用本機 Markdown 匯出。其他格式與線上服務需先匯出或使用已測試的轉接器。

獨立安裝時，把整個技能資料夾（包括 `assets`、`scripts`、`references`、`agents`）複製到目標系統的 `.claude/skills/3d-brain/`。在本套件中執行 `bash scripts/sync-codex-skills.sh 3d-brain`，生成 Codex 副本。不能只複製 `SKILL.md`，也不要夾帶已生成的個人設定或資料。

套件驗證：`node scripts/test-package.mjs`。需要較大的虛構視覺測試資料時，加上 `--keep --demo --out <scratch-folder>`。

操作流程見 [SKILL.md](SKILL.md)，實作規格見[可攜式規格](references/portable-spec.md)，轉接器與限制見[設定指南](references/config.md)。
