# 结构化输入 + Skills 驱动实施总计划（TS 全栈）

## 1. 目标与总原则
本项目将原有“提示词驱动”升级为“机器可执行契约驱动”，形成可复现、可审计、可回放的工程链路。

核心目标：
1. 以 TS 全栈（Next.js + NestJS + Prisma）为技术主线。
2. 引入 `IntentIR` 中间层，解耦自然语言需求与代码生成。
3. 采用 `ECC + 项目定制 Skills` 模式，统一输入编译与质量门禁。
4. 通过 CI 阻断 `schema/validate/eval/replay` 失败，禁止低质量产物合并。

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

CI 门禁：
1. `spec:validate` 失败阻断。
2. `design:validate` 失败阻断。
3. `eval:run` 失败阻断（含 unknowns 非空阻断）。
4. `replay:check` 失败阻断。
5. PR 必须附 `manifest + eval reports`。

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

## 7. 验证策略
1. 每类 Spec 至少 `1 pass + 2 fail` 样例。
2. Golden Case 覆盖确认分支、取消分支、来源隔离。
3. Skills 回归覆盖至少 15 条样例（3 skills * 5 cases）。
4. unknowns 非空、schema 失败、关键 eval 失败均阻断。

## 8. 非目标与边界
1. 本轮不实现完整业务功能页面，仅实现“计划可执行化资产”。
2. 不回切 Vue/Java 路线，保持 TS 全栈方向。
3. 若后续无新增决策，默认先维持 3 个核心 skills，不扩展 7 技能全链。
