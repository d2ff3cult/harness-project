# AI 设计到代码 + Evals-First Agentic SDLC 融合探索计划（harness-project）

## 0. 背景与目标
本项目用于探索并验证以下融合路线：
1. 以 **Evals-First Agentic SDLC** 作为主干治理框架（契约先行、评测先行、阻断式合并）。
2. 以 **Design System MCP + Agent 工作流** 作为前端“设计到代码”能力引擎（先产出结构化上下文，再生成代码）。
3. 在保证审计与可回放前提下，提升页面交付速度、视觉一致性和可维护性。

## 1. 融合原则（决策）
1. 主干不变：继续采用 Spec/Eval/Approval/Manifest 的治理体系。
2. 生成升级：将“直接代码生成”升级为“结构化 UI 上下文生成 -> 受限代码生成”。
3. 质量前置：a11y、token、一致性规则在生成阶段前置检查，不只在 PR 后兜底。
4. 强约束落地：AI 只能改写允许槽位，禁止整文件自由重写。

## 2. 总体架构（目标态）
```text
需求输入(PRD)
  -> 契约层(Contract/PageSpec/ExtensionSpec/EvalSpec)
  -> Design Context 层(Design System MCP + Figma 解析 Agent)
  -> 代码生成层(骨架生成 + 槽位填充)
  -> 评测门禁层(L0-L4 + 可视化报告)
  -> 审批与发布层(高风险审批 + 回滚)
  -> 回流学习层(失败样本 -> 规则/模板迭代)
```

## 3. 目录规划（项目内）
```text
specs/prd/
specs/contracts/
specs/pages/
specs/extensions/
specs/evals/

design/mcp/                    # 设计系统机器可读资产（组件/props/token/a11y）
design/agents/                 # 设计解析 Agent 配置与提示词版本
design/context/                # 结构化设计上下文产物（JSON）

tools/gen/                     # 骨架生成器、槽位填充器
tools/design/                  # Figma 抽取、组件映射、token 校验工具
tools/evals/                   # 评测执行器

tests/contract/
tests/e2e/
tests/visual/

.evals/baseline/
.evals/reports/
.gen/manifest/
```

## 4. 关键契约新增（在原方案上扩展）
### 4.1 DesignContextSpec（新增）
用于承接 Design System MCP + Agent 输出，建议字段：
- `pageId`
- `figmaNodeRefs`
- `layoutTree`
- `componentMappings`
- `designTokens`
- `i18nCandidates`
- `a11yRequirements`
- `interactionModel`
- `knownRisks`

阻断规则：
1. `componentMappings` 为空时禁止进入代码生成。
2. 出现未注册 token 或未识别组件时，默认阻断并要求人工确认。
3. 缺失 `a11yRequirements` 时只允许进入草稿分支，不得合并主干。

### 4.2 Manifest 扩展字段
在现有 `manifest.json` 中新增：
- `designContextHash`
- `designMcpVersion`
- `figmaSnapshotId`
- `componentMapVersion`
- `agentWorkflowVersion`

## 5. Agent 工作流（对齐 monday 思路）
建议采用“多节点串联、产出上下文而非直接代码”的流程：
1. 节点1：Figma 节点抽取与层级整理。
2. 节点2：布局语义化（容器、栅格、间距、对齐）。
3. 节点3：设计系统组件映射（原子->业务组件）。
4. 节点4：Design Token 对齐与冲突检测。
5. 节点5：可访问性规则注入（标签、焦点、语义）。
6. 节点6：文案与 i18n 检测（硬编码风险识别）。
7. 节点7：交互状态建模（默认/hover/disabled/error/empty）。
8. 节点8：输出 DesignContextSpec + 风险标签。

说明：该工作流输出 `design/context/*.json`，不直接输出生产代码。

## 6. 生成链路（融合后）
1. 输入 `PageSpec + (可选)ExtensionSpec + DesignContextSpec`。
2. `gen:page` 生成标准骨架与受限槽位。
3. `gen:fill` 仅在受限槽位填充代码（组件引用、布局、绑定）。
4. 运行 `spec:validate`、`design:validate`、`eval:run`。
5. 产出 `manifest + reports`，提交 PR。

## 7. Evals 门禁矩阵（升级版）
| 级别 | 检查项 | 阻断条件 |
|---|---|---|
| L0 | Schema、lint、typecheck、DesignContextSpec 校验 | 任一失败即阻断 |
| L1 | unit、contract(API/权限/状态)、组件映射正确率阈值 | 任一失败即阻断 |
| L2 | e2e 关键业务流、交互状态覆盖率 | 任一失败即阻断 |
| L3 | visual diff、token 一致性、a11y 扫描、安全扫描 | 超阈值或高危即阻断 |
| L4 | 高风险人工审批（权限/资金/导出/审计） | 未审批不得合并 |

建议新增阈值：
1. 组件映射覆盖率 `>= 95%`。
2. 未知 token 数量 `= 0`。
3. 关键页面 a11y 严重告警 `= 0`。

## 8. 分阶段执行计划（探索版）
### Phase 1：基础打桩（Week 1-2）
目标：把治理骨架跑通。
1. 初始化目录与 Schema（含 DesignContextSpec）。
2. 建立 `spec:validate` 与 `design:validate`。
3. 建立最小 `manifest.json`（含新增字段占位）。
4. 接通 L0 门禁到 CI。

### Phase 2：设计上下文链路（Week 3-4）
目标：打通“Figma -> 结构化上下文”。
1. 建立 Design System MCP 最小资产（10-20 个核心组件）。
2. 实现 Agent 工作流 MVP（先 4-5 节点）。
3. 输出 `design/context/*.json` 并可追溯版本。
4. 建立组件映射准确率评测。

### Phase 3：受限生成与质量闭环（Week 5-6）
目标：让上下文驱动可合并代码。
1. 建立 `gen:page` + `gen:fill` 双阶段生成。
2. 接入 L1/L2（contract + e2e）。
3. 接入视觉回归与 token 一致性检查。
4. PR 模板强制附带 manifest + eval 报告。

### Phase 4：试点域验证（Week 7-8）
目标：以 1 个业务域验证收益。
1. 选择“列表 + 表单 + 详情”三类页面作为试点。
2. 对比人工基线：周期、返工率、视觉缺陷率、一次通过率。
3. 形成 ADR 与组织级准入标准。
4. 输出下一阶段扩域计划（L2/L3 页面）。

## 9. 成功判据（PoC 退出条件）
1. 至少 3 个试点页面由融合链路完整交付并上线。
2. 所有试点 PR 均附 `manifest + eval reports + visual reports`。
3. 组件映射覆盖率稳定 `>= 95%`，未知 token 为 0。
4. 首次 PR 全门禁通过率较人工基线明显提升。
5. 出现失败样本时可回放定位（基于 `specHash + designContextHash`）。

## 10. 风险与缓解
1. 风险：设计系统资产不完整导致映射失败。
   缓解：先做核心组件白名单，分批扩充。
2. 风险：Figma 命名不规范导致语义漂移。
   缓解：建立命名规范扫描器和提交流程门禁。
3. 风险：视觉回归误报干扰迭代节奏。
   缓解：固定环境 + 冻结时间 + mask 动态区 + 基线审批流。
4. 风险：模型升级导致输出漂移。
   缓解：manifest 固化 `modelVersion/promptVersion`，漂移超阈值阻断。

## 11. 首批待办（可直接开工）
1. 建立 `specs/`、`design/`、`tools/`、`tests/` 目录与 README 占位。
2. 定义 `PageSpec`、`EvalSpec`、`DesignContextSpec` 的 JSON Schema。
3. 落地 `spec:validate` 与 `design:validate` 命令。
4. 产出一份试点页面的最小 `PageSpec + DesignContextSpec` 样例。
5. 在 CI 中先接 L0，保证每次提交都执行结构门禁。

## 12. 多 PR 执行蓝图（可冷启动）
### 12.1 依赖图
```text
S1 基础骨架与目录
  -> S2 契约与 Schema 校验
    -> S3 Manifest 与可回放
      -> S4 Design MCP 资产 MVP
        -> S5 Design Agent 工作流 MVP
          -> S6 双阶段代码生成
            -> S7 评测门禁升级(L1-L3)
              -> S8 试点域验证与复盘
```

### 12.2 并行位
1. `S2` 期间可并行启动 `S4` 的组件盘点（不改主流程代码）。
2. `S6` 开始后可并行推进 `S7` 的 visual/a11y 安全扫描接线。

### 12.3 Step 清单
#### S1：基础骨架与目录
Context Brief：在空仓中建立最小可执行项目结构，保证后续 Step 有落脚点。  
Tasks：
1. 创建 `specs/、design/、tools/、tests/、.evals/、.gen/`。
2. 为关键目录补 `README.md`（用途、输入输出、责任边界）。
3. 增加统一脚本入口（先占位），避免后续命令漂移。
Verify Commands：
1. `find specs design tools tests .evals .gen -maxdepth 2 -type d | sort`
Exit Criteria：
1. 目录结构可见且命名稳定。
2. README 说明可让新同学 10 分钟内理解结构。
Rollback：
1. 删除新增空目录与占位文件，恢复空仓状态。

#### S2：契约与 Schema 校验
Context Brief：先把“输入可验证”做扎实，避免生成链路放大歧义。  
Tasks：
1. 定义 `PageSpec`、`ExtensionSpec`、`EvalSpec`、`DesignContextSpec` Schema。
2. 实现 `spec:validate`、`design:validate` 命令。
3. 增加最小样例文件（通过与失败各一份）。
Verify Commands：
1. `npm run spec:validate`
2. `npm run design:validate`
Exit Criteria：
1. 非法 Spec 必然失败并给出可读错误。
2. 合法 Spec 全通过。
Rollback：
1. 回退校验器与 Schema 到上一个可用版本。

#### S3：Manifest 与可回放
Context Brief：把“生成可追溯”建立起来，为后续模型漂移治理打基础。  
Tasks：
1. 定义 `.gen/manifest/manifest.schema.json`。
2. 在生成流程写入 `specHash/designContextHash/modelVersion/promptVersion`。
3. 增加 `replay:check` 命令验证可重放一致性。
Verify Commands：
1. `npm run gen:manifest`
2. `npm run replay:check`
Exit Criteria：
1. 同输入可重放，差异超阈值时可阻断。
Rollback：
1. 关闭严格阻断，保留报告模式。

#### S4：Design MCP 资产 MVP
Context Brief：先覆盖核心组件，优先可用性而非一次性全量。  
Tasks：
1. 建立组件注册表（组件名、props、约束、示例）。
2. 建立 token 注册表（颜色、间距、字号、圆角等）。
3. 加入 a11y 规则基线（label、role、focus）。
Verify Commands：
1. `npm run design:mcp:lint`
2. `npm run design:mcp:report`
Exit Criteria：
1. 覆盖试点页面所需组件 >= 90%。
2. token 注册表可被校验器消费。
Rollback：
1. 退回到“组件白名单 + 人工映射”简化模式。

#### S5：Design Agent 工作流 MVP
Context Brief：打通 Figma 到结构化上下文，不直接产出生产代码。  
Tasks：
1. 实现节点：抽取、布局语义、组件映射、token 对齐、a11y 注入。
2. 输出 `design/context/<pageId>.json`。
3. 对接 `DesignContextSpec` 校验。
Verify Commands：
1. `npm run design:extract -- --figma <url_or_id>`
2. `npm run design:context:validate`
Exit Criteria：
1. 样例页面能稳定生成 DesignContext。
2. 映射失败可定位到具体节点与原因。
Rollback：
1. 使用静态 JSON 样例替代在线抽取，先推进下游。

#### S6：双阶段代码生成
Context Brief：将“上下文理解”与“代码生成”解耦，降低整文件漂移风险。  
Tasks：
1. `gen:page` 生成骨架。
2. `gen:fill` 仅填充受限槽位。
3. 增加“越权改写检测”。
Verify Commands：
1. `npm run gen:page -- --spec specs/pages/demo.json`
2. `npm run gen:fill -- --context design/context/demo.json`
3. `npm run gen:guard`
Exit Criteria：
1. 生成器不会改动受限区外内容。
2. 组件引用与 token 引用符合 DesignContext。
Rollback：
1. 回退到仅骨架生成，复杂段落改为人工实现。

#### S7：评测门禁升级（L1-L3）
Context Brief：从结构门禁扩展到行为、视觉、安全和可访问性门禁。  
Tasks：
1. 接入 contract/e2e/visual/a11y/security 到 CI。
2. 固化阈值（视觉 diff、映射覆盖率、a11y 严重告警）。
3. PR 模板强制附 `manifest + reports`。
Verify Commands：
1. `npm run test:contract`
2. `npm run test:e2e`
3. `npm run test:visual`
4. `npm run test:a11y`
5. `npm run test:security`
Exit Criteria：
1. CI 对不达标 PR 能稳定阻断。
2. 报告可用于审计和复盘。
Rollback：
1. 临时降级非关键门禁为告警模式（有时限）。

#### S8：试点域验证与复盘
Context Brief：用真实业务域验证收益并形成组织标准。  
Tasks：
1. 选 3 类页面（列表/表单/详情）完成全流程交付。
2. 对比人工基线（周期、返工、缺陷、一次通过率）。
3. 输出 ADR 与扩域准入标准。
Verify Commands：
1. `npm run metrics:pilot`
2. `npm run report:pilot`
Exit Criteria：
1. 达成第 9 章 PoC 退出条件。
2. 形成下一阶段扩域路线图。
Rollback：
1. 仅保留成功链路，失败环节转为手工并列流程。

## 13. 计划变更协议（防失控）
1. 新增步骤：必须写明依赖、输入输出、验证命令。
2. 拆分步骤：若单步超过 1 个 PR，必须拆分并重画依赖。
3. 跳过步骤：需记录风险与补偿措施，不可口头跳过。
4. 阈值调整：必须由 QA + TL 双签并记录生效时间。
