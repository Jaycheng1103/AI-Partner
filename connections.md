# 工具連線

記錄 AI Partner 可存取的系統。`/onboard` 會根據 Q4–Q7 填入；後續接通新工具時持續擴充。`/audit` 會檢查本檔案涵蓋的工作領域與資料時效。

| # | 領域 | 工具 | 連線方式 | 授權 | 最近檢查 |
|---|---|---|---|---|---|
| 1 | 收入／財務 | _由 /onboard 填入_ | not yet connected | — | — |
| 2 | 客戶互動 | _由 /onboard 填入_ | not yet connected | — | — |
| 3 | 行事曆 | _由 /onboard 填入_ | not yet connected | — | — |
| 4 | 溝通 | _由 /onboard 填入_ | not yet connected | — | — |
| 5 | 專案／任務追蹤 | _由 /onboard 填入_ | not yet connected | — | — |
| 6 | 會議資訊 | _由 /onboard 填入_ | not yet connected | — | — |
| 7 | 知識／檔案 | _由 /onboard 填入_ | not yet connected | — | — |

**連線方式選項：** `mcp`（MCP 伺服器）、`script`（放在 `scripts/`、呼叫 API 的 Python／Bash）、`export`（CSV／JSON 匯出流程）、`key+ref`（`.env` 憑證搭配 `references/{tool}-api.md` 指南）、`not yet connected`（尚未連線）。這些識別值保留英文。

接通新工具時，也要儲存 `references/{tool}-api.md`，記錄端點、授權流程與常見查詢。研究完成就保存，供後續直接使用。
