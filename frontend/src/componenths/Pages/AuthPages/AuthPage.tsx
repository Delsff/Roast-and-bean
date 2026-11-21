import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "../../../lib/authApi";

export const AuthPage = ({ mode }: { mode: "login" | "register" }) => {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const inputClass =
    "w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700";

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">
        {isLogin ? "Sign in" : "Create account"}
      </h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 border border-stone-200 rounded-xl"
      >
        {!isLogin && (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              required
              minLength={2}
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={isLogin ? 1 : 8}
            className={inputClass}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-700 text-white py-2.5 rounded-lg font-semibold hover:bg-amber-800 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading ? "Please wait ..." : isLogin ? "Sign in" : "Sign up"}
        </button>
      </form>
      <p className="text-sm text-stone-600 mt-4 text-center">
        {isLogin ? "No account yet? " : "Already registered? "}
        <Link
          to={isLogin ? "/register" : "/login"}
          className="text-amber-700 font-semibold hover:underline"
        >
          {isLogin ? "Sign up" : "Sign in"}
        </Link>
      </p>
    </main>
  );
};
