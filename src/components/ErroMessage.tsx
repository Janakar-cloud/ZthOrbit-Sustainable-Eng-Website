type Props = {
  message?: string;
  onRetry?: () => void;
};

export default function ErrorMessage({ message , onRetry }: Props) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.errorBox}>
        <h3 style={styles.title}>⚠️ Error</h3>
        <p style={styles.message}>{message}</p>
        <button style={styles.button} onClick={() => onRetry}>
          Retry
        </button>
      </div>
    </div>
  );
}


const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  errorBox: {
    padding: "30px",
    borderRadius: "12px",
    background: "#ffe6e6",
    color: "#d8000c",
    textAlign: "center" as const,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "300px",
    width: "100%",
  },
  title: {
    marginBottom: "10px",
  },
  message: {
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    background: "#d8000c",
    color: "#fff",
    cursor: "pointer",
  },
};