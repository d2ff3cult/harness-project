# 结构化输入 + Skills 驱动实施总计划（TS 全栈）

## 1. 目标与总原则
本项目将原有“提示词驱动”升级为“机器可执行契约驱动”，形成可复现、可审计、可回放的工程链路。

核心目标：
1. 以 TS 全栈（Next.js + NestJS + Prisma）为技术主线。
2. 引入 `IntentIR` 中间层，解耦自然语言需求与代码生成。
3. 采用 `ECC + 项目定制 Skills` 模式，统一输入编译与质量门禁。
4. 通过 CI 阻断 `schema/validate/eval/replay` 失败，禁止低质量产物合并。
5. 在 Golden Case 引入视觉回归验证，补齐“结构正确但视觉偏差”的质量盲区。

工程原则：
1. 自然语言仅是输入层，不直接执行。
2. 结构化 Spec 是执行层，必须通过 Schema。
3. 任何生成步骤必须记录 `skillVersion + schemaVersion + modelVersion` 到 manifest。
4. unknowns 不得带入主干（unknowns 非空即阻断）。

## 2. 输入编译链路（强制）
统一链路：

`PRD自然语言 -> Intent Card -> IntentIR(JSON) -> PageSpec/ContractSpec/DesignContextSpec/EvalSpec -> Schema Validate -> Gen/Eval -> Manifest/Reports`

其中：
1. `Intent Card` 用于从自然语言提取业务边界、事件、确认分支、风险点。
2. `IntentIR` 是唯一中间表示，禁止跳过 IntentIR 直接生成页面代码。
3. 四类 Spec 为执行入口：
   - `PageSpec`
   - `ContractSpec`
   - `DesignContextSpec`
   - `EvalSpec`

## 3. 目录与契约资产
关键目录：
1. `specs/schemas/`：IntentIR/Page/Contract/Eval 的 JSON Schema。
2. `design/schemas/`：DesignContextSpec Schema。
3. `specs/samples/`：每类 Spec 的 pass/fail 测试样例。
4. `specs/samples/golden/`：复杂联动 Golden Case。
5. `.agents/skills/`：项目私有 skills（3 个核心技能）。
6. `.gen/manifest/`：manifest schema 与回放数据。
7. `.evals/reports/`：评测报告。
8. `tests/visual/`：视觉回归测试脚本与场景配置（建议 Playwright）。
9. `.evals/visual/`：视觉基线与 diff 报告（截图、差异热区、阈值结果）。

## 4. Skills 策略（ECC + 项目定制）
来源策略：
1. ECC 提供通用方法基线（eval、verification、TDD 等）。
2. 项目内维护 3 个私有 skills（当前阶段强制）：
   - `intent-to-spec`
   - `figma-to-design-context`
   - `eval-gate`

技能要求：
1. 每个 skill 必须有 `SKILL.md` 与 `agents/openai.yaml`。
2. 每个 skill 至少 5 条回归用例。
3. skill 输出必须可被 schema 100% 校验通过。
4. skill 失败必须返回结构化错误，不得仅返回自由文本。

## 5. 命令与门禁契约
统一命令：
1. `intent:compile`
2. `spec:validate`
3. `design:validate`
4. `eval:run`
5. `replay:check`
6. `skills:smoke`
7. `visual:regression`

CI 门禁：
1. `spec:validate` 失败阻断。
2. `design:validate` 失败阻断。
3. `eval:run` 失败阻断（含 unknowns 非空阻断）。
4. `replay:check` 失败阻断。
5. PR 必须附 `manifest + eval reports`。
6. `visual:regression` 分阶段策略：
   - 早期（试点期）：仅告警，不阻断。
   - 稳定期（基线收敛后）：关键页面超过阈值即阻断。

## 6. 分阶段交付（锁定）
### P1：Schema 与 IntentIR 落地
1. 落地 5 类 schema（IntentIR/Page/Contract/Eval/DesignContext）。
2. 落地 pass/fail 样例，确保“可编译、可报错”。

### P2：3 个私有 skills 落地
1. 完成 skill 说明、输入输出约束、错误格式。
2. 完成每个 skill 至少 5 条回归样例。

### P3：CI 阻断 + manifest 回放字段
1. 接通 `validate + eval + replay` 自动门禁。
2. 固化 manifest 字段：
   - `specHash`
   - `designContextHash`
   - `generatorVersion`
   - `templateVersion`
   - `modelVersion`
   - `promptVersion`
   - `designMcpVersion`
   - `componentMapVersion`
   - `lockfileHash`
   - `outputs`
   - `evalReportRefs`
   - `skills`

### P4：试点与复盘基线
1. 以“服务信息/运输信息双向联动”作为首个 Golden Case。
2. 形成可回放回归基线并固化到仓库。

### P5：视觉回归接入与门禁升级
1. 只覆盖 Golden Case 的关键页面与关键状态（初始、编辑、确认弹窗、提交后）。
2. 首期仅覆盖 2 个视口（Desktop + Mobile）与 1 套主题（Light）。
3. 建立视觉阈值策略（建议像素差异比例 + 关键区域白名单）。
4. 前 2 个迭代作为告警模式收集噪声，完成基线清洗后切换为阻断模式。
5. 将视觉结果纳入 PR 工件（基线图、当前图、diff 图、失败原因）。

## 7. 验证策略
1. 每类 Spec 至少 `1 pass + 2 fail` 样例。
2. Golden Case 覆盖确认分支、取消分支、来源隔离。
3. Skills 回归覆盖至少 15 条样例（3 skills * 5 cases）。
4. unknowns 非空、schema 失败、关键 eval 失败均阻断。
5. 视觉回归至少覆盖：
   - 1 个 Golden 页面
   - 2 个视口（Desktop + Mobile）
   - 3 类状态（静态、交互中、提交后）
6. 视觉误差阈值必须配置并版本化；阈值变更需在 PR 说明原因。

## 8. 非目标与边界
1. 本轮不实现完整业务功能页面，仅实现“计划可执行化资产”。
2. 不回切 Vue/Java 路线，保持 TS 全栈方向。
3. 若后续无新增决策，默认先维持 3 个核心 skills，不扩展 7 技能全链。
4. 视觉回归首期不追求全站全状态覆盖，不做跨浏览器全矩阵，仅覆盖高风险关键路径。

## 9. 变更复核与实现记录要求（新增）
1. 每次非 trivial 变更必须同步提交两类复核资产：
   - `docs/review/checklists/*.md`：执行 checklist（含验证命令清单）。
   - `docs/review/records/*.md`：关键实现细节、验证证据、风险与后续项。
2. 复核资产要求进入 CI：`review:artifacts` 失败即阻断合并。
3. checklist 至少包含 Scope/Checklist/Verification 三段；关键实现记录至少包含 Background/Key Implementation Details/Verification Evidence/Risks and Follow-ups 四段。
4. 关键实现记录必须可用于“后续复盘/审计”：需明确改动文件、阈值/参数策略、门禁模式（warn/block）与验证结论。

## 10. 当前推进状态（2026-04-18）
1. 已完成视觉回归接入与 Golden Case 基线生成。
2. 已将视觉门禁从告警升级为阻断（CI 采用 `VISUAL_GATE_MODE=block`）。
3. 已引入交互式截图采集（stateActions），避免仅依赖 query 参数快照。

## 11. Figma 管道状态（2026-04-19）
1. 已补齐可执行命令：`figma:extract`、`figma:compile`、`figma:smoke`。
2. `figma:smoke` 已纳入 `ci:gate`，用于持续验证 “提取产物 -> DesignContextSpec” 编译链路。
3. 组件映射缺失默认阻断，并输出结构化错误（`DESIGN_CONTEXT_BLOCKED`）。
