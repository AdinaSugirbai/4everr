<div className="relative">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              className={`${input} pr-20`}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-brand"
            >
              {showPw ? t("Жасыру|Скрыть|Hide") : t("Көрсету|Показать|Show")}
            </button>
          </div>

          {mode === "register" && (
            <ul className="mt-3 space-y-1 text-sm">
              {rules.map((r, i) => (
                <li key={i} className={r.ok ? "text-green-600" : "text-mute"}>
                  {r.ok ? "✓" : "•"} {r.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white transition-opacity disabled:opacity-60"
        >
          {busy
            ? t("Күте тұрыңыз...|Подождите...|Please wait...")
            : mode === "register"
              ? t("Аккаунт жасау|Создать аккаунт|Create account")
              : t("Кіру|Войти|Sign in")}
        </button>
      </form>
    </div>
  );
}
