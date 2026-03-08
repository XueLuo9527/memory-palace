import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>记忆宫殿 - Memory Palace</title>
        <meta name="description" content="你的可视化知识管理系统" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          🏰 记忆宫殿
        </h1>
        <p className={styles.description}>
          把你的知识，放进宫殿里
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.icon}>🧠</span>
            <h3>空间化记忆</h3>
            <p>利用位置记忆法，让知识更有组织</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>🎨</span>
            <h3>视觉化呈现</h3>
            <p>告别枯燥列表，用空间管理信息</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.icon}>🔗</span>
            <h3>智能关联</h3>
            <p>自动发现知识之间的联系</p>
          </div>
        </div>

        <div className={styles.cta}>
          <Link href="/palaces">
            <button className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30 text-lg">
              🚀 进入我的宫殿
            </button>
          </Link>
          <p className="text-white/60 text-sm mt-4">v0.2.0 - 宫殿 & 房间管理</p>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Memory Palace © 2026 - 你的可视化知识管理系统</p>
      </footer>
    </div>
  )
}
