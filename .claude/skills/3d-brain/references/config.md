# 個人化與來源設定

使用者選好名稱與分類後，建立如下格式的 JSON：

```json
{
  "name": "Atlas Brain",
  "port": 4640,
  "sources": [
    {"id":"knowledge","label":"業務知識","paths":["context","wiki"],"color":"#38BDF8","staleDays":75},
    {"id":"meetings","label":"會議","paths":["meetings"],"color":"#FB923C","staleDays":null},
    {"id":"projects","label":"專案","paths":["projects"],"color":"#34D399"}
  ]
}
```

這是格式範例，不代表上述資料夾一定存在。只納入已確認且由使用者選擇的路徑。建立工具會計算相對於生成應用的 `root`，讓工作系統移到別的資料夾或電腦後，repo 內路徑仍可使用。本機 `brain.config.json` 由 Git 忽略。

欄位說明：

| 欄位 | 意義 |
|---|---|
| `name` | 完整顯示名稱，1–64 字元。所有個人品牌顯示均由此取得。 |
| `root` | 相對於已安裝應用設定檔的工作系統根目錄，由建立工具自動設定。 |
| `port` | 本機連接埠，1024–65535，預設 4640。需確認沒有衝突。 |
| `maxNodes` | 掃描上限，預設 3000、最高 10000。到達上限時，清單會顯示通知。 |
| `sources` | 1–12 個分類。 |
| `sources[].id` | 以字母開頭的唯一小寫 ID，只用字母、數字與連字號。 |
| `sources[].label` | 使用者看到的分類名稱。 |
| `sources[].paths` | 已核准的檔案／資料夾，可用相對根目錄的路徑、明確絕對路徑或 `~/` 路徑；不支援 glob 萬用比對。 |
| `sources[].type` | `markdown`（預設）或 `codex-memory`。 |
| `sources[].color` | 選填的六位十六進位色碼；省略時分配可區分的配色。 |
| `sources[].exclude` | 選填，各指定資料夾內要排除的相對路徑前綴。 |
| `sources[].staleDays` | 正數，預設 90；設為 `null` 可停用歷史紀錄的過期標記。 |
| `sources[].obsidianVault` | 選填，既有 Obsidian vault 名稱；只有節點路徑相對於該 vault 有效時才使用。 |

## 支援的來源

**Markdown：** 遞迴掃描 `.md`、`.txt`，讀取簡單純量 frontmatter（`title`、`name`、`description`、`type`、`updated`、`created`、`tags`），並解析 Markdown 檔案連結與 wikilink。納入範圍由來源資料夾決定，不使用原作者寫死的知識庫架構。專案索引條目仍是筆記文字；要納入專案筆記，需選取實際資料夾。

排除隱藏目錄、git、相依套件、封存、暫存、檢查輸出、生成資料及生成應用本身。探索掃描略過符號連結；超過 1 MB 的檔案會產生通知。導覽筆記列在清單中，不畫成節點。重複選取同一檔案不會產生重複節點。

**Claude 記憶：** 使用 `markdown` 與已核准、特定專案的 Claude 記憶資料夾。不要猜測編碼後目錄名，需在本機確認。若存在，探索工具會提供與目前根目錄精確對應的位置。

**Codex 記憶：** 使用 `codex-memory` 與明確選取的記憶根目錄。探索工具優先遵循 `CODEX_HOME`，否則檢查 `~/.codex/memories`。轉接器讀取 `memory_summary.md`、`MEMORY.md` 的章節、Markdown `rollout_summaries/`、記憶 `skills/` 及 `extensions/ad_hoc/notes/`。不掃描原始對話日誌、`.env`、憑證、隱藏檔案或重複的 `raw_memories.md`。記憶可能來自多個專案，使用者選擇前需知道範圍。

**其他格式：** 預設不支援。請使用者提供或依授權建立本機 Markdown 匯出，或實作有文件的轉接器。不要合成缺失的業務內容，也不要宣稱已支援遠端 API。
