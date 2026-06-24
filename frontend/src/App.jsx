import { AuthProvider } from "./context/AuthContext.jsx";
import { NavigationProvider, AppRoutes } from "./routes/AppRoutes.jsx";

function App() {
    return (
        <AuthProvider>
            <NavigationProvider>
                <AppRoutes />
            </NavigationProvider>
        </AuthProvider>
    );
}

export default App;