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
import { registerAdmin } from "@/lib/server-calls/admin/register-admin";

const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await registerAdmin(username, password);
            navigate("/admin/login");
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const goToLogin = () => {
        navigate("/admin/login");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <MdAdminPanelSettings className=" text-gray-600" size={32} />
                        <CardTitle>Register Admin</CardTitle>
                    </div>
                    <CardDescription>Create your admin account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="username">Username</Label>
                            <Input
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
                                {loading ? "Registering..." : "Register"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-4 text-sm text-gray-600">
                Already have an account?{" "}
                <button
                    onClick={goToLogin}
                    className="text-blue-600 hover:underline focus:outline-none"
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default RegisterPage;
