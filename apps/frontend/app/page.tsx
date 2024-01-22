import styles from './page.module.css';

export default async function Index() {
  return (
    <div className={styles.page}>
      <div className="wrapper">
        <h3>Hello Next JS!</h3>
      </div>
    </div>
  );
}
