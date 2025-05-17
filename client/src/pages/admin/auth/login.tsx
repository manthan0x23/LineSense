import { useState } from "react";
import { useNavigate } from "react-router";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MdAdminPanelSettings } from "react-icons/md";
import { loginAdmin } from "@/lib/server-calls/admin/login-admin";

export const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const b = await loginAdmin(username, password);
            if (b) window.location.reload();
        } finally {
            setLoading(false);
        }
    };

    const goToRegister = () => {
        navigate("/admin/register");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <MdAdminPanelSettings className=" text-gray-600" size={32} />
                        <CardTitle >Admin Login</CardTitle>
                    </div>
                    <CardDescription>
                        Enter your credentials to access the admin panel.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                placeholder="Username"
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                placeholder="Password"
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading}>
                                {loading ? "Logging in..." : "Log In"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-4 text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                    onClick={goToRegister}
                    className="text-blue-600 hover:underline focus:outline-none"
                >
                    Register
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
