import styles from "./Loader.module.css";

function Loader() {
  return (
    <div class={styles["lds-ring"]}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

export default Loader;