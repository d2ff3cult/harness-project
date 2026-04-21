"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type VisualState = "initial" | "editing" | "confirm-modal" | "submitted";

const states: VisualState[] = ["initial", "editing", "confirm-modal", "submitted"];

const stateLabel: Record<VisualState, string> = {
  initial: "初始态",
  editing: "编辑中",
  "confirm-modal": "确认弹窗",
  submitted: "提交后"
};

export default function ServiceTransportOrderEditVisual() {
  const [state, setState] = useState<VisualState>("initial");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const hasPendingChanges = state === "editing" || state === "confirm-modal";
  const showConfirmModal = state === "confirm-modal";
  const submitted = state === "submitted";

  const content = useMemo(() => {
    return {
      serviceName: hasPendingChanges ? "门到门冷链运输（含夜间收货）" : "门到门冷链运输",
      transportMode: hasPendingChanges ? "公路整车 + 市内接驳" : "公路整车",
      bookingSource: hasPendingChanges ? "客服人工修正" : "客户自助录入",
      leadTime: hasPendingChanges ? "T+1 早班达" : "T+1 标准达",
      tempRule: hasPendingChanges ? "2°C - 8°C（强制记录）" : "2°C - 8°C",
      costRule: hasPendingChanges ? "联动重算待确认" : "当前报价锁定"
    };
  }, [hasPendingChanges]);

  return (
    <main
      className={styles.shell}
      data-visual-ready="true"
      data-visual-hydrated={hydrated ? "true" : "false"}
      data-state={state}
    >
      <section className={styles.panel}>
        <section className={styles.controls} data-testid="visual-controls">
          <span className={styles.controlsTitle}>Capture Controls</span>
          <div className={styles.controlsButtons}>
            <button
              className={styles.controlButton}
              type="button"
              data-testid="control-initial"
              onClick={() => setState("initial")}
            >
              Initial
            </button>
            <button
              className={styles.controlButton}
              type="button"
              data-testid="control-editing"
              onClick={() => setState("editing")}
            >
              Editing
            </button>
            <button
              className={styles.controlButton}
              type="button"
              data-testid="control-confirm-modal"
              onClick={() => setState("confirm-modal")}
            >
              Confirm Modal
            </button>
            <button
              className={styles.controlButton}
              type="button"
              data-testid="control-submitted"
              onClick={() => setState("submitted")}
            >
              Submitted
            </button>
          </div>
        </section>

        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Golden Case</p>
            <h1>服务信息 / 运输信息 双向联动</h1>
            <p className={styles.summary}>
              用于视觉回归采样的标准页面，覆盖初始、编辑、确认、提交后四种关键状态。
            </p>
          </div>
          <span className={submitted ? styles.badgeDone : styles.badgeLive}>
            {submitted ? "已提交同步" : `状态：${stateLabel[state]}`}
          </span>
        </header>

        <div className={styles.stateRail}>
          {states.map((item) => (
            <div key={item} className={item === state ? styles.stateChipActive : styles.stateChip}>
              {stateLabel[item]}
            </div>
          ))}
        </div>

        <section className={styles.grid}>
          <article className={styles.card}>
            <h2>服务信息</h2>
            <dl>
              <div className={styles.row}>
                <dt>服务模板</dt>
                <dd>{content.serviceName}</dd>
              </div>
              <div className={styles.row}>
                <dt>时效等级</dt>
                <dd>{content.leadTime}</dd>
              </div>
              <div className={styles.row}>
                <dt>预约来源</dt>
                <dd>{content.bookingSource}</dd>
              </div>
            </dl>
          </article>

          <article className={styles.card}>
            <h2>运输信息</h2>
            <dl>
              <div className={styles.row}>
                <dt>运输方式</dt>
                <dd>{content.transportMode}</dd>
              </div>
              <div className={styles.row}>
                <dt>温控要求</dt>
                <dd>{content.tempRule}</dd>
              </div>
              <div className={styles.row}>
                <dt>费用策略</dt>
                <dd>{content.costRule}</dd>
              </div>
            </dl>
          </article>
        </section>

        {hasPendingChanges && (
          <section className={styles.warning}>
            <h3>待确认变更</h3>
            <p>服务模板变化将触发运输方式和费用策略联动更新，请确认后提交。</p>
          </section>
        )}

        {submitted && (
          <section className={styles.success} data-testid="submitted-state">
            <h3>提交完成</h3>
            <p>服务信息与运输信息已完成同步，来源隔离校验通过。</p>
          </section>
        )}
      </section>

      {showConfirmModal && (
        <section className={styles.modalLayer} data-testid="confirm-modal">
          <div className={styles.modal}>
            <h3>确认联动更新？</h3>
            <p>
              将同步更新 3 个运输字段：运输方式、费用策略、温控要求。提交后进入“提交后”状态。
            </p>
            <div className={styles.modalActions}>
              <span className={styles.actionGhost}>取消</span>
              <span className={styles.actionPrimary}>确认提交</span>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
