import ClipLoader from "react-spinners/ClipLoader";

export default function Loader() {
    return (
        <div style={{ textAlign: "center" }}>
            <ClipLoader color="#5cb039" size={100} />
        </div>
    );
}