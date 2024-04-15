import "./App.css";
import Chat from "./components/Chat";
import { APIClientProvider } from "./context/AdvisorClientContext";
import "./tailwind.css";

function App() {
    return (
        <div className="App">
            <APIClientProvider
                baseURL={process.env.REACT_APP_API_BASE as string}
                licenseKey={process.env.REACT_APP_LICENSE_KEY as string}
            >
                <Chat />
            </APIClientProvider>
        </div>
    );
}

export default App;
