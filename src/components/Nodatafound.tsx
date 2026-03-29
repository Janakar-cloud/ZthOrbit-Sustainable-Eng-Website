type Props = {
  message?: string;
  onRetry?: () => void;
};

export default function NoData({ message = "No data found", onRetry }: Props) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.icon}>📭</div>

        <h2 style={styles.title}>{message}</h2>

        {onRetry && (
          <button style={styles.button} onClick={onRetry}>
            🔄 Retry
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100%",
    minHeight: "60vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    textAlign: "center" as const,
    padding: "30px",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    maxWidth: "320px",
    width: "100%",
  },
  icon: {
    fontSize: "50px",
    marginBottom: "10px",
  },
  title: {
    marginBottom: "10px",
    color: "#333",
  },
  message: {
    marginBottom: "20px",
    color: "#777",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    background: "#5cb039",
    color: "#fff",
    cursor: "pointer",
  },
};