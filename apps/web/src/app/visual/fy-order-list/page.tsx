import styles from "./page.module.css";

type StatusTone = "pending" | "approved" | "draft" | "booking" | "done";

type NavLevel = "group" | "item";

type NavEntry = {
  label: string;
  level: NavLevel;
  active?: boolean;
  expandable?: boolean;
};

type OrderRow = {
  id: string;
  type: string;
  scope: string;
  customer: string;
  sales: string;
  service: string;
  status: string;
  statusTone: StatusTone;
  exception: string;
  phase: string;
  financialDate: string;
};

const navEntries: NavEntry[] = [
  { label: "驾驶舱", level: "group", expandable: true },
  { label: "首页", level: "item" },
  { label: "业务驾驶舱", level: "item" },
  { label: "商务驾驶舱", level: "item" },
  { label: "客服驾驶舱", level: "item" },
  { label: "订单管理", level: "group", expandable: true },
  { label: "创建订单", level: "item" },
  { label: "订单列表", level: "item", active: true },
  { label: "订单审批管理", level: "item" },
  { label: "订单任务管理", level: "item" },
  { label: "应收管理", level: "group", expandable: true },
  { label: "应付管理", level: "group", expandable: true },
  { label: "财务管理", level: "group", expandable: true },
  { label: "数据中心", level: "group", expandable: true },
  { label: "流程引擎", level: "group", expandable: true },
  { label: "规则管理", level: "group", expandable: true },
  { label: "客户管理", level: "group", expandable: true },
  { label: "基础数据", level: "group" },
];

const tableRows: OrderRow[] = [
  {
    id: "DD2604170002",
    type: "Remy订单类型",
    scope: "CY-CY",
    customer: "阿里巴巴集团控股有限公司",
    sales: "QiKie（陈希伦）",
    service: "Vinson（周映旭）",
    status: "审核通过",
    statusTone: "approved",
    exception: "待处理",
    phase: "放舱",
    financialDate: "2026-04-25",
  },
  {
    id: "DD2604170001",
    type: "Remy订单类型",
    scope: "CY-CY",
    customer: "阿里巴巴集团控股有限公司",
    sales: "QiKie（陈希伦）",
    service: "Vinson（周映旭）",
    status: "审核通过",
    statusTone: "approved",
    exception: "待处理",
    phase: "放舱",
    financialDate: "2026-02-18",
  },
  {
    id: "DD2604160002",
    type: "Evan测试类型",
    scope: "",
    customer: "",
    sales: "",
    service: "",
    status: "草稿",
    statusTone: "draft",
    exception: "",
    phase: "",
    financialDate: "2026-04-16",
  },
  {
    id: "DD2604160001",
    type: "测试-海运",
    scope: "",
    customer: "",
    sales: "",
    service: "",
    status: "草稿",
    statusTone: "draft",
    exception: "",
    phase: "",
    financialDate: "2026-04-16",
  },
  {
    id: "DD2604100003",
    type: "Remy订单类型",
    scope: "CY-CY",
    customer: "test11",
    sales: "Ian（徐政玥）",
    service: "Vinson（周映旭）",
    status: "订舱中",
    statusTone: "booking",
    exception: "待处理",
    phase: "放舱",
    financialDate: "2026-02-18",
  },
  {
    id: "DD2604100002",
    type: "Remy订单类型",
    scope: "CY-CY",
    customer: "test11",
    sales: "Ian（徐政玥）",
    service: "Vinson（周映旭）",
    status: "订舱中",
    statusTone: "booking",
    exception: "待处理",
    phase: "放舱",
    financialDate: "2026-02-18",
  },
  {
    id: "DD2604100001",
    type: "测试-海运",
    scope: "CY-CY",
    customer: "Vinson0001",
    sales: "Vinson（周映旭）",
    service: "Vinson（周映旭）",
    status: "已完成",
    statusTone: "done",
    exception: "",
    phase: "放舱",
    financialDate: "2026-03-13",
  },
  {
    id: "DD2604080006",
    type: "测试-海运",
    scope: "CY-CY",
    customer: "Amos测试客户",
    sales: "Jackson（王镇杰）",
    service: "Jackson（王镇杰）",
    status: "已完成",
    statusTone: "done",
    exception: "",
    phase: "放舱",
    financialDate: "2026-03-13",
  },
  {
    id: "DD2604080005",
    type: "测试-海运",
    scope: "CY-CY",
    customer: "Amos测试客户",
    sales: "Jackson（王镇杰）",
    service: "Jackson（王镇杰）",
    status: "订舱中",
    statusTone: "booking",
    exception: "",
    phase: "放舱",
    financialDate: "2026-03-13",
  },
  {
    id: "DD2604080004",
    type: "测试-海运",
    scope: "CY-CY",
    customer: "Amos测试客户",
    sales: "Jackson（王镇杰）",
    service: "Jackson（王镇杰）",
    status: "草稿",
    statusTone: "draft",
    exception: "",
    phase: "放舱",
    financialDate: "2026-03-13",
  },
  {
    id: "DD2604080003",
    type: "Remy订单类型",
    scope: "CY-CY",
    customer: "阿里巴巴集团控股有限公司",
    sales: "QiKie（陈希伦）",
    service: "QiKie（陈希伦）",
    status: "已完成",
    statusTone: "done",
    exception: "",
    phase: "放舱",
    financialDate: "2025-11-28",
  },
  {
    id: "DD2604080002",
    type: "Remy订单类型",
    scope: "CY-CY",
    customer: "test11",
    sales: "Ian（徐政玥）",
    service: "Vinson（周映旭）",
    status: "订舱中",
    statusTone: "booking",
    exception: "",
    phase: "放舱",
    financialDate: "2026-02-18",
  },
  {
    id: "DD2604080001",
    type: "Remy订单类型",
    scope: "CY-CY",
    customer: "test11",
    sales: "Ian（徐政玥）",
    service: "Vinson（周映旭）",
    status: "订舱中",
    statusTone: "booking",
    exception: "",
    phase: "放舱",
    financialDate: "2026-02-18",
  },
  {
    id: "DD2604070003",
    type: "Amos测试",
    scope: "",
    customer: "阿里巴巴集团控股有限公司",
    sales: "Amos（王虎）",
    service: "Albert（温建宝）",
    status: "订舱中",
    statusTone: "booking",
    exception: "",
    phase: "放舱",
    financialDate: "2026-04-07",
  },
  {
    id: "DD2604070002",
    type: "Amos测试",
    scope: "",
    customer: "阿里巴巴集团控股有限公司",
    sales: "Amos（王虎）",
    service: "Albert（温建宝）",
    status: "订舱中",
    statusTone: "booking",
    exception: "",
    phase: "放舱",
    financialDate: "2026-04-07",
  },
];

function statusClass(tone: StatusTone): string {
  if (tone === "pending") {
    return styles.statusPending;
  }
  if (tone === "approved") {
    return styles.statusApproved;
  }
  if (tone === "draft") {
    return styles.statusDraft;
  }
  if (tone === "booking") {
    return styles.statusBooking;
  }
  return styles.statusDone;
}

function NavIcon() {
  return (
    <span className={styles.navIcon} aria-hidden>
      <span className={styles.navIconInner} />
    </span>
  );
}

export default function FyOrderListVisualPage() {
  return (
    <main className={styles.viewport} data-visual-ready="true">
      <aside className={styles.sidebar}>
        <section className={styles.logoRow}>
          <div className={styles.logoCluster}>
            <div className={styles.logoMain}>
              <span className={styles.logoEmblem}>F</span>
              <span className={styles.logoMainText}>弗拉联盟</span>
            </div>
            <span className={styles.logoSub}>CargoCanCare</span>
          </div>
          <div className={styles.userPortrait} aria-hidden />
        </section>

        <section className={styles.systemBar}>
          <NavIcon />
          <span>FY订单管理系统V1</span>
        </section>

        <nav className={styles.navRail} aria-label="主导航">
          {navEntries.map((entry) => (
            <button
              className={[
                styles.navButton,
                entry.level === "group" ? styles.navGroup : styles.navItem,
                entry.active ? styles.navItemActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={entry.label}
              type="button"
            >
              <NavIcon />
              <span className={styles.navLabel}>{entry.label}</span>
              {entry.expandable ? <span className={styles.navChevron}>›</span> : null}
            </button>
          ))}
        </nav>

        <section className={styles.sidebarFooter}>
          <span className={styles.footerDot} />
          <span className={styles.footerDot} />
          <span className={styles.footerDot} />
        </section>
      </aside>

      <section className={styles.mainPane}>
        <header className={styles.topTabs}>
          <div className={styles.tab}>首页</div>
          <div className={styles.tabActive}>订单列表</div>
          <div className={styles.topActions}>
            <button className={styles.iconButton} type="button" aria-label="刷新">
              ↻
            </button>
            <button className={styles.iconButton} type="button" aria-label="更多">
              ▾
            </button>
          </div>
        </header>

        <section className={styles.breadcrumbBar}>
          <p className={styles.breadcrumbText}>☑ FY订单管理系统V1 / 订单管理 / 订单列表</p>
        </section>

        <section className={styles.filterPanel}>
          <div className={styles.filterActionRow}>
            <button className={styles.primaryButton} type="button">
              创建订单
            </button>
            <div className={styles.refreshGroup}>
              <button className={styles.secondaryButton} type="button">
                ↻ 刷新
              </button>
              <p className={styles.pageHint}>‹&nbsp;&nbsp;1 - 50 / 591&nbsp;&nbsp;›</p>
            </div>
          </div>

          <div className={styles.filterGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                订单编号 <i>等于</i>
              </span>
              <input readOnly value="" aria-label="订单编号" />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                订单类型 <i>包含</i>
              </span>
              <div className={styles.selectLike}>
                <input readOnly value="" aria-label="订单类型" />
                <span>⌄</span>
              </div>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                客户 <i>包含</i>
              </span>
              <input readOnly value="" aria-label="客户" />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                业务员 <i>等于</i>
              </span>
              <div className={styles.selectLike}>
                <input readOnly value="" aria-label="业务员" />
                <span>⌄</span>
              </div>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                订单状态 <i>等于</i>
              </span>
              <div className={styles.selectLike}>
                <input readOnly value="" aria-label="订单状态" />
                <span>⌄</span>
              </div>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                异常状态 <i>等于</i>
              </span>
              <div className={styles.selectLike}>
                <input readOnly value="" aria-label="异常状态" />
                <span>⌄</span>
              </div>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                ETD <i>⦿ 在范围内</i>
              </span>
              <input readOnly value="" aria-label="ETD" />
            </label>
            <div className={styles.moreWrap}>
              <button className={styles.secondaryButton} type="button">
                ... 更多条件 (27)
              </button>
            </div>
          </div>
        </section>

        <section className={styles.tablePanel}>
          <span className={styles.sidebarHandle} aria-hidden>
            ‹
          </span>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.headerGroupRow}>
                  <th colSpan={9}>基础信息</th>
                  <th>财务日期</th>
                </tr>
                <tr>
                  <th>订单编号</th>
                  <th>订单类型</th>
                  <th>服务范围</th>
                  <th>客户</th>
                  <th>业务员</th>
                  <th>客服</th>
                  <th>订单状态</th>
                  <th>异常状态</th>
                  <th>当前阶段</th>
                  <th>财务日期</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.id}>
                    <td className={styles.orderLinkCell}>
                      <a href="#">{row.id}</a>
                    </td>
                    <td>{row.type}</td>
                    <td>
                      {row.scope ? <span className={styles.scopeBadge}>{row.scope}</span> : ""}
                    </td>
                    <td>{row.customer}</td>
                    <td>{row.sales}</td>
                    <td>{row.service}</td>
                    <td>
                      <span className={statusClass(row.statusTone)}>{row.status}</span>
                    </td>
                    <td>
                      {row.exception ? <span className={styles.statusPending}>{row.exception}</span> : ""}
                    </td>
                    <td>{row.phase}</td>
                    <td>{row.financialDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
