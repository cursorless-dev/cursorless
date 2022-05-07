import styles from './cheatsheet.module.scss';

/* eslint-disable-next-line */
export interface CheatsheetProps {}

export function Cheatsheet(props: CheatsheetProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Cheatsheet!</h1>
    </div>
  );
}

export default Cheatsheet;
