import styles from "./page.module.css";

type HealthResponse = {
  status: string;
  database: string;
};

async function getHealth(baseUrl: string): Promise<HealthResponse | null> {
  try {
    const response = await fetch(`${baseUrl}/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as HealthResponse;
  } catch {
    return null;
  }
}

export default async function Home() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const health = await getHealth(apiBaseUrl);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <p className={styles.tag}>AI Design to Code Starter</p>
          <h1>项目初始化完成</h1>
          <p className={styles.description}>
            当前模板已完成 Next.js + NestJS + Prisma 的最小联通配置。
          </p>
        </div>

        <div className={styles.card}>
          <p>
            API Base URL: <code>{apiBaseUrl}</code>
          </p>
          <p>
            API 状态:{" "}
            <strong className={health ? styles.ok : styles.down}>
              {health ? "在线" : "离线"}
            </strong>
          </p>
          <p>
            数据库状态:{" "}
            <strong
              className={
                health?.database === "up" ? styles.ok : styles.down
              }
            >
              {health?.database === "up" ? "已连接" : "未连接"}
            </strong>
          </p>
        </div>
      </main>
    </div>
  );
}
